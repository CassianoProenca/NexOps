package com.nexops.api.shared.iam.domain.service;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.domain.model.InviteToken;
import com.nexops.api.shared.iam.domain.ports.in.CreateInviteUseCase;
import com.nexops.api.shared.iam.domain.ports.out.InviteRepository;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.security.SecurityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class InviteService implements CreateInviteUseCase {

    private static final long INVITE_EXPIRATION_MS = 7L * 24 * 60 * 60 * 1000; // 7 days
    private static final SecureRandom RANDOM = new SecureRandom();

    private final InviteRepository inviteRepository;
    private final UserRepository userRepository;

    @Override
    public String execute(String email) {
        var caller = SecurityContext.get();
        if (caller == null) {
            throw new BusinessException("Não autenticado");
        }

        if (!caller.hasPermission("INVITE_CREATE")) {
            throw new BusinessException("Sem permissão para criar convites");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("E-mail já cadastrado");
        }

        String rawToken = generateRaw();
        String tokenHash = hash(rawToken);

        InviteToken invite = InviteToken.create(
                caller.tenantId(),
                email,
                tokenHash,
                caller.userId(),
                INVITE_EXPIRATION_MS
        );

        inviteRepository.save(invite);

        return rawToken;
    }

    private String generateRaw() {
        byte[] bytes = new byte[64];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return Base64.getEncoder().encodeToString(
                    digest.digest(raw.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("Erro ao hashear token de convite", e);
        }
    }
}
