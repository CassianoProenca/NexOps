package com.nexops.api.shared.iam.domain.service;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.domain.model.TokenPair;
import com.nexops.api.shared.iam.domain.model.User;
import com.nexops.api.shared.iam.domain.ports.in.FirstAccessUseCase;
import com.nexops.api.shared.iam.domain.ports.out.InviteRepository;
import com.nexops.api.shared.iam.domain.ports.out.PasswordEncoderPort;
import com.nexops.api.shared.iam.domain.ports.out.TenantSeedPort;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.util.Base64;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FirstAccessService implements FirstAccessUseCase {

    private final InviteRepository inviteRepository;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final PasswordEncoderPort passwordEncoder;
    private final TenantSeedPort tenantSeedPort;

    @Override
    @Transactional
    public TokenPair execute(String rawToken, String nome, String email, String senha) {
        String tokenHash = hash(rawToken);

        var invite = inviteRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BusinessException("Token de convite inválido"));

        if (!invite.isValid()) {
            if (invite.isExpired()) {
                throw new BusinessException("Token de convite expirado");
            }
            throw new BusinessException("Token de convite já utilizado");
        }

        if (!invite.getEmail().equalsIgnoreCase(email)) {
            throw new BusinessException("E-mail não corresponde ao convite");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("E-mail já cadastrado");
        }

        String passwordHash = passwordEncoder.encode(senha);
        User user = User.create(nome, email, passwordHash, invite.getTenantId());
        user = userRepository.save(user);

        // Assign USER role
        tenantSeedPort.assignUserRole(user.getId(), invite.getTenantId());

        // Mark invite as used
        invite.markUsed();
        inviteRepository.save(invite);

        // Load resolved permissions (USER role)
        // Re-fetch user to get assigned roles
        var savedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Erro ao carregar usuário criado"));

        Set<String> permissions = savedUser.resolvedPermissions();

        String accessToken = jwtService.generateAccessToken(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getTenantId(),
                permissions
        );

        String refreshToken = refreshTokenService.generate(savedUser.getId(), savedUser.getTenantId());

        return new TokenPair(accessToken, refreshToken);
    }

    private String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return Base64.getEncoder().encodeToString(
                    digest.digest(raw.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("Erro ao hashear token", e);
        }
    }
}
