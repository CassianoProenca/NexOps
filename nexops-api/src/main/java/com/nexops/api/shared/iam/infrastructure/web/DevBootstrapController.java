package com.nexops.api.shared.iam.infrastructure.web;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.infrastructure.web.dto.DevBootstrapRequest;
import com.nexops.api.shared.iam.infrastructure.web.dto.DevBootstrapResponse;
import com.nexops.api.shared.security.JwtService;
import com.nexops.api.shared.tenant.domain.model.Tenant;
import com.nexops.api.shared.tenant.domain.ports.in.TenantProvisioningUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Endpoint de uso exclusivo em desenvolvimento.
 * Cria tenant + schema + usuário admin e retorna um JWT pronto para uso,
 * sem necessidade de SMTP, convite ou definição de senha.
 *
 * Usa JDBC puro com schema explícito para evitar dependência do search_path.
 * Desabilitar via DEV_BOOTSTRAP_ENABLED=false em produção.
 */
@Slf4j
@RestController
@RequestMapping("/dev")
@RequiredArgsConstructor
@Tag(name = "Dev Bootstrap", description = "⚠️ Desenvolvimento — cria tenant e retorna JWT de admin")
public class DevBootstrapController {

    private final TenantProvisioningUseCase provisioningUseCase;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.dev-bootstrap-enabled:true}")
    private boolean enabled;

    @Operation(summary = "Bootstrap tenant + admin (DEV ONLY)",
               description = "Provisiona schema, cria usuário admin ATIVO e retorna JWT pronto para uso")
    @PostMapping("/bootstrap")
    public DevBootstrapResponse bootstrap(@RequestBody @Valid DevBootstrapRequest request) {
        if (!enabled) {
            throw new BusinessException("Dev bootstrap está desabilitado neste ambiente");
        }

        // 1. Provisiona tenant — cria schema PostgreSQL e executa migrações Flyway
        Tenant tenant = provisioningUseCase.provision(
                request.tenantName(),
                request.tenantSlug(),
                "STARTER",
                50
        );

        String s = tenant.getSchemaName(); // alias para queries abaixo

        // 2. Busca o role ADMIN semeado pelas migrações (schema explícito — sem search_path)
        UUID adminRoleId = jdbcTemplate.queryForObject(
                "SELECT id FROM " + s + ".roles WHERE name = 'ADMIN'",
                UUID.class
        );
        if (adminRoleId == null) {
            throw new BusinessException("Role ADMIN não encontrado — a migração V1 rodou corretamente?");
        }

        // 3. Cria o usuário admin já ATIVO com senha hashada
        String rawPassword = request.resolvedPassword();
        UUID userId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();

        jdbcTemplate.update(
                "INSERT INTO " + s + ".users (id, name, email, password_hash, status, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?)",
                userId,
                request.adminEmail().split("@")[0],
                request.adminEmail(),
                passwordEncoder.encode(rawPassword),
                now,
                now
        );

        // 4. Vincula o role ADMIN ao usuário
        jdbcTemplate.update(
                "INSERT INTO " + s + ".user_roles (user_id, role_id) VALUES (?, ?)",
                userId, adminRoleId
        );

        // 5. Carrega as permissões do role ADMIN para embutir no JWT
        List<String> permList = jdbcTemplate.queryForList(
                "SELECT p.code FROM " + s + ".role_permissions rp " +
                "JOIN " + s + ".permissions p ON p.id = rp.permission_id " +
                "WHERE rp.role_id = ?",
                String.class,
                adminRoleId
        );
        Set<String> permissions = new HashSet<>(permList);

        // 6. Gera JWT pronto para uso
        String accessToken = jwtService.generateAccessToken(
                userId,
                request.adminEmail(),
                tenant.getSlug(),
                permissions
        );

        log.warn("⚠️ DEV BOOTSTRAP — tenant={} schema={} admin={}",
                tenant.getSlug(), s, request.adminEmail());

        return new DevBootstrapResponse(
                tenant.getSlug(),
                s,
                request.adminEmail(),
                rawPassword,
                accessToken
        );
    }
}
