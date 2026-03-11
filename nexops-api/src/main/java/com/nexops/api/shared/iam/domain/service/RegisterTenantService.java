package com.nexops.api.shared.iam.domain.service;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.domain.model.TokenPair;
import com.nexops.api.shared.iam.domain.model.User;
import com.nexops.api.shared.iam.domain.ports.in.RegisterTenantUseCase;
import com.nexops.api.shared.iam.domain.ports.out.PasswordEncoderPort;
import com.nexops.api.shared.iam.domain.ports.out.TenantSeedPort;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.security.JwtService;
import com.nexops.api.shared.tenant.domain.model.Tenant;
import com.nexops.api.shared.tenant.domain.ports.out.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class RegisterTenantService implements RegisterTenantUseCase {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final PasswordEncoderPort passwordEncoder;
    private final TenantSeedPort tenantSeedPort;

    @Override
    @Transactional
    public TokenPair execute(String cnpj, String nomeFantasia, String email, String senha) {
        // Validate CNPJ format (14 digits)
        String cleanCnpj = cnpj.replaceAll("[^0-9]", "");
        if (cleanCnpj.length() != 14) {
            throw new BusinessException("CNPJ inválido — deve conter 14 dígitos");
        }

        if (tenantRepository.existsByCnpj(cleanCnpj)) {
            throw new BusinessException("CNPJ já cadastrado");
        }

        if (tenantRepository.existsByEmail(email)) {
            throw new BusinessException("E-mail já cadastrado como empresa");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("E-mail já em uso");
        }

        // Create and save tenant
        Tenant tenant = Tenant.create(cleanCnpj, nomeFantasia, email);
        tenant = tenantRepository.save(tenant);

        // Seed tenant roles (creates ADMIN, TECH, USER roles + permissions)
        Set<String> adminPermissions = tenantSeedPort.seedTenantRoles(tenant.getId());

        // Create admin user
        String adminName = nomeFantasia;
        String passwordHash = passwordEncoder.encode(senha);
        User adminUser = User.create(adminName, email, passwordHash, tenant.getId());
        adminUser = userRepository.save(adminUser);

        // Assign ADMIN role
        tenantSeedPort.assignAdminRole(adminUser.getId(), tenant.getId());

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(
                adminUser.getId(),
                adminUser.getName(),
                adminUser.getEmail(),
                adminUser.getTenantId(),
                adminPermissions
        );

        String refreshToken = refreshTokenService.generate(adminUser.getId(), adminUser.getTenantId());

        return new TokenPair(accessToken, refreshToken);
    }
}
