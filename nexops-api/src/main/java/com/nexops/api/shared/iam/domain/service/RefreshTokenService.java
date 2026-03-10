package com.nexops.api.shared.iam.domain.service;

import com.nexops.api.shared.iam.domain.model.RefreshToken;
import com.nexops.api.shared.iam.domain.ports.out.RefreshTokenRepository;
import com.nexops.api.shared.security.config.JwtProperties;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final JwtProperties props;
    private static final SecureRandom RANDOM = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository repository, JwtProperties props) {
        this.repository = repository;
        this.props = props;
    }

    public String generate(UUID userId) {
        String rawToken = generateRaw();
        String hash = hash(rawToken);
        RefreshToken token = RefreshToken.create(userId, hash, props.getRefreshExpirationMs());
        repository.save(token);
        return rawToken;
    }

    public Optional<RefreshToken> validate(String rawToken) {
        return repository.findByTokenHash(hash(rawToken))
                .filter(RefreshToken::isValid);
    }

    public void revoke(String rawToken) {
        repository.findByTokenHash(hash(rawToken)).ifPresent(t -> {
            t.revoke();
            repository.save(t);
        });
    }

    public void revokeAllForUser(UUID userId) {
        repository.revokeAllByUserId(userId);
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
            throw new RuntimeException("Erro ao hashear refresh token", e);
        }
    }
}
