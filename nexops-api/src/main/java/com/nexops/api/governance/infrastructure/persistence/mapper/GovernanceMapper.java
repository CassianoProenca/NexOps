package com.nexops.api.governance.infrastructure.persistence.mapper;

import com.nexops.api.governance.domain.model.*;
import com.nexops.api.governance.infrastructure.persistence.entity.*;

public class GovernanceMapper {

    public static SlaConfig toDomain(SlaConfigJpaEntity e) {
        return new SlaConfig(e.getId(), e.getProblemTypeId(), e.getSlaLevel(), e.getResponseMinutes(), e.getResolutionMinutes(), e.getNotifyManagerAtPercent(), e.isActive(), e.getCreatedAt());
    }

    public static SlaConfigJpaEntity toEntity(SlaConfig d) {
        return SlaConfigJpaEntity.builder()
                .id(d.getId()).problemTypeId(d.getProblemTypeId())
                .slaLevel(d.getSlaLevel()).responseMinutes(d.getResponseMinutes())
                .resolutionMinutes(d.getResolutionMinutes())
                .notifyManagerAtPercent(d.getNotifyManagerAtPercent())
                .active(d.isActive()).createdAt(d.getCreatedAt()).build();
    }

    public static SlaBreachEvent toDomain(SlaBreachEventJpaEntity e) {
        return new SlaBreachEvent(e.getId(), e.getTicketId(), e.getBreachType(), e.getBreachedAt(), e.getSlaDeadline(), e.getMinutesOverdue(), e.getCreatedAt());
    }

    public static SlaBreachEventJpaEntity toEntity(SlaBreachEvent d) {
        return SlaBreachEventJpaEntity.builder()
                .id(d.getId()).ticketId(d.getTicketId()).breachType(d.getBreachType())
                .breachedAt(d.getBreachedAt()).slaDeadline(d.getSlaDeadline())
                .minutesOverdue(d.getMinutesOverdue()).createdAt(d.getCreatedAt()).build();
    }

    public static SlaNotification toDomain(SlaNotificationJpaEntity e) {
        return new SlaNotification(e.getId(), e.getTicketId(), e.getRecipientId(), e.getNotificationType(), e.getChannel(), e.getSentAt(), e.getReadAt());
    }

    public static SlaNotificationJpaEntity toEntity(SlaNotification d) {
        return SlaNotificationJpaEntity.builder()
                .id(d.getId()).ticketId(d.getTicketId()).recipientId(d.getRecipientId())
                .notificationType(d.getNotificationType()).channel(d.getChannel())
                .sentAt(d.getSentAt()).readAt(d.getReadAt()).build();
    }
}
