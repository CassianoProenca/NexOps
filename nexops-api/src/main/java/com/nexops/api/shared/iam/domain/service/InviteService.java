package com.nexops.api.shared.iam.domain.service;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.domain.model.Role;
import com.nexops.api.shared.iam.domain.model.User;
import com.nexops.api.shared.iam.domain.model.UserStatus;
import com.nexops.api.shared.iam.domain.ports.in.CreateInviteUseCase;
import com.nexops.api.shared.iam.domain.ports.out.PasswordEncoderPort;
import com.nexops.api.shared.iam.domain.ports.out.RoleRepository;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.security.SecurityContext;
import com.nexops.api.shared.tenant.domain.ports.in.SendEmailUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InviteService implements CreateInviteUseCase {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoderPort passwordEncoder;
    private final SendEmailUseCase sendEmailUseCase;

    @Override
    @Transactional
    public void execute(String name, String email, UUID roleId, String password) {
        log.info("Attempting to create user: {} ({}) with role: {}", name, email, roleId);
        
        var caller = SecurityContext.get();
        if (caller == null) {
            log.error("Create user failed: Not authenticated");
            throw new BusinessException("Não autenticado");
        }

        log.info("Caller: {} Permissions: {}", caller.email(), caller.permissions());

        if (!caller.hasPermission("USER_MANAGE")) {
            log.error("Create user failed: Insufficient permissions. Required: USER_MANAGE");
            throw new BusinessException("Sem permissão para gerenciar usuários");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("E-mail já cadastrado");
        }

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new BusinessException("Perfil não encontrado"));

        if (!role.getTenantId().equals(caller.tenantId())) {
            throw new BusinessException("Perfil inválido para este tenant");
        }

        String passwordHash = passwordEncoder.encode(password);

        User user = new User(
                UUID.randomUUID(),
                caller.tenantId(),
                name,
                email,
                passwordHash,
                UserStatus.PENDING,
                OffsetDateTime.now(),
                OffsetDateTime.now(),
                null,
                new HashSet<>(Collections.singletonList(role)),
                new HashMap<>() // Corrected to HashMap for permissionOverrides
        );

        userRepository.save(user);

        try {
            String html = """
                    <div style="font-family:sans-serif;max-width:520px;margin:auto">
                      <h2 style="color:#2563eb">Bem-vindo ao NexOps!</h2>
                      <p>Olá, <strong>%s</strong>.</p>
                      <p>Sua conta foi criada. Use as credenciais abaixo para o seu primeiro acesso:</p>
                      <table style="border:1px solid #e4e4e7;border-radius:8px;padding:16px;background:#fafafa;width:100%%">
                        <tr><td style="color:#71717a;font-size:13px">E-mail</td><td><strong>%s</strong></td></tr>
                        <tr><td style="color:#71717a;font-size:13px">Senha temporária</td><td><strong>%s</strong></td></tr>
                      </table>
                      <p style="font-size:13px;color:#71717a;margin-top:24px">
                        Por segurança, altere sua senha no primeiro acesso.
                      </p>
                    </div>
                    """.formatted(name, email, password);
            sendEmailUseCase.send(caller.tenantId(), email, "Bem-vindo ao NexOps — suas credenciais de acesso", html);
        } catch (Exception e) {
            log.warn("Falha ao enviar e-mail de convite para {}: {}", email, e.getMessage());
        }
    }
}
