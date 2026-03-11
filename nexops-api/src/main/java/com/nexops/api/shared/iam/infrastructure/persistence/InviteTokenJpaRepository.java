package com.nexops.api.shared.iam.infrastructure.persistence;

import com.nexops.api.shared.iam.infrastructure.persistence.entity.InviteTokenJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface InviteTokenJpaRepository extends JpaRepository<InviteTokenJpaEntity, UUID> {
    Optional<InviteTokenJpaEntity> findByTokenHash(String tokenHash);
}
