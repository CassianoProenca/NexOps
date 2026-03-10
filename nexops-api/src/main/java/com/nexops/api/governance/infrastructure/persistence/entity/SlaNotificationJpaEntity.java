package com.nexops.api.governance.infrastructure.persistence.entity;

import com.nexops.api.governance.domain.model.SlaNotification;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sla_notifications")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class SlaNotificationJpaEntity {
    @Id
    private UUID id;
    @Column(name = "ticket_id")
    private UUID ticketId;
    @Column(name = "recipient_id")
    private UUID recipientId;
    @Enumerated(EnumType.STRING)
    private SlaNotification.NotificationType notificationType;
    @Enumerated(EnumType.STRING)
    private SlaNotification.NotificationChannel channel;
    private OffsetDateTime sentAt;
    private OffsetDateTime readAt;
}
