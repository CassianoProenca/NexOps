package com.nexops.api.governance.domain.ports.out;

import com.nexops.api.governance.domain.model.SlaNotification;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SlaNotificationRepository {
    SlaNotification save(SlaNotification notification);
    List<SlaNotification> findByRecipientId(UUID recipientId);
    List<SlaNotification> findUnreadByRecipientId(UUID recipientId);
    Optional<SlaNotification> findById(UUID id);
}
