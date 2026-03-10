package com.nexops.api.shared.iam.infrastructure.persistence;

import com.nexops.api.shared.iam.domain.model.RefreshToken;
import com.nexops.api.shared.iam.domain.ports.out.RefreshTokenRepository;
import com.nexops.api.shared.iam.infrastructure.persistence.mapper.IamMapper;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Component
public class RefreshTokenRepositoryAdapter implements RefreshTokenRepository {

    private final RefreshTokenJpaRepository jpa;

    public RefreshTokenRepositoryAdapter(RefreshTokenJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public RefreshToken save(RefreshToken token) {
        return IamMapper.toDomain(jpa.save(IamMapper.toEntity(token)));
    }

    @Override
    public Optional<RefreshToken> findByTokenHash(String tokenHash) {
        return jpa.findByTokenHash(tokenHash).map(IamMapper::toDomain);
    }

    @Override
    @Transactional
    public void revokeAllByUserId(UUID userId) {
        jpa.revokeAllByUserId(userId);
    }
}
