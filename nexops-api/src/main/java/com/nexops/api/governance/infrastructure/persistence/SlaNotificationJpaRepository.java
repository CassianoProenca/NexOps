package com.nexops.api.governance.infrastructure.persistence;

import com.nexops.api.governance.infrastructure.persistence.entity.SlaNotificationJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SlaNotificationJpaRepository extends JpaRepository<SlaNotificationJpaEntity, UUID> {
    List<SlaNotificationJpaEntity> findByRecipientId(UUID recipientId);
    List<SlaNotificationJpaEntity> findByRecipientIdAndReadAtIsNull(UUID recipientId);
}
