package com.nexops.api.governance.infrastructure.persistence;

import com.nexops.api.governance.domain.model.SlaNotification;
import com.nexops.api.governance.domain.ports.out.SlaNotificationRepository;
import com.nexops.api.governance.infrastructure.persistence.mapper.GovernanceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SlaNotificationRepositoryAdapter implements SlaNotificationRepository {

    private final SlaNotificationJpaRepository jpaRepository;

    @Override
    public SlaNotification save(SlaNotification notification) {
        var entity = GovernanceMapper.toEntity(notification);
        var saved = jpaRepository.save(entity);
        return GovernanceMapper.toDomain(saved);
    }

    @Override
    public List<SlaNotification> findByRecipientId(UUID recipientId) {
        return jpaRepository.findByRecipientId(recipientId).stream()
                .map(GovernanceMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<SlaNotification> findUnreadByRecipientId(UUID recipientId) {
        return jpaRepository.findByRecipientIdAndReadAtIsNull(recipientId).stream()
                .map(GovernanceMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<SlaNotification> findById(UUID id) {
        return jpaRepository.findById(id).map(GovernanceMapper::toDomain);
    }
}
