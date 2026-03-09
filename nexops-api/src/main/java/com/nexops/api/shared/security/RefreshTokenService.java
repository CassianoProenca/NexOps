package com.nexops.api.shared.security;

import com.nexops.api.shared.iam.domain.model.RefreshToken;
import com.nexops.api.shared.iam.domain.model.User;
import com.nexops.api.shared.iam.infrastructure.persistence.RefreshTokenRepository;
import com.nexops.api.shared.security.config.JwtProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Optional;

@Service @RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final JwtProperties props;
    private static final SecureRandom RANDOM = new SecureRandom();

    public String generate(User user) {
        String rawToken = generateRaw();
        String hash = hash(rawToken);

        RefreshToken entity = RefreshToken.builder()
                .user(user)
                .tokenHash(hash)
                .expiresAt(OffsetDateTime.now().plusNanos(
                        props.getRefreshExpirationMs() * 1_000_000L))
                .revoked(false)
                .build();

        repository.save(entity);
        return rawToken;
    }

    @Transactional
    public Optional<RefreshToken> validate(String rawToken) {
        String hash = hash(rawToken);
        return repository.findByTokenHash(hash)
                .filter(t -> !t.isRevoked() && !t.isExpired());
    }

    @Transactional
    public void revoke(String rawToken) {
        String hash = hash(rawToken);
        repository.findByTokenHash(hash).ifPresent(t -> {
            t.setRevoked(true);
            repository.save(t);
        });
    }

    @Transactional
    public void revokeAllForUser(User user) {
        repository.revokeAllByUser(user);
    }

    private String generateRaw() {
        byte[] bytes = new byte[64];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encoded = digest.digest(raw.getBytes());
            return Base64.getEncoder().encodeToString(encoded);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao hashear refresh token", e);
        }
    }
}
