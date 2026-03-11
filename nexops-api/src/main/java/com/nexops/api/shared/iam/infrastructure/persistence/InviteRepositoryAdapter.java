package com.nexops.api.shared.iam.infrastructure.persistence;

import com.nexops.api.shared.iam.domain.model.InviteToken;
import com.nexops.api.shared.iam.domain.ports.out.InviteRepository;
import com.nexops.api.shared.iam.infrastructure.persistence.mapper.IamMapper;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class InviteRepositoryAdapter implements InviteRepository {

    private final InviteTokenJpaRepository jpa;

    public InviteRepositoryAdapter(InviteTokenJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public InviteToken save(InviteToken invite) {
        return IamMapper.toDomain(jpa.save(IamMapper.toEntity(invite)));
    }

    @Override
    public Optional<InviteToken> findByTokenHash(String tokenHash) {
        return jpa.findByTokenHash(tokenHash).map(IamMapper::toDomain);
    }
}
