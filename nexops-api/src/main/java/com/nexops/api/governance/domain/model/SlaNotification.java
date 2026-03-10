package com.nexops.api.governance.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class SlaNotification {
    private final UUID id;
    private final UUID ticketId;
    private final UUID recipientId;
    private final NotificationType notificationType;
    private final NotificationChannel channel;
    private final OffsetDateTime sentAt;
    private OffsetDateTime readAt;

    public enum NotificationType { SLA_WARNING, SLA_BREACH, DAILY_SUMMARY }
    public enum NotificationChannel { IN_APP, EMAIL }

    public SlaNotification(UUID id, UUID ticketId, UUID recipientId, NotificationType notificationType, NotificationChannel channel, OffsetDateTime sentAt, OffsetDateTime readAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.recipientId = recipientId;
        this.notificationType = notificationType;
        this.channel = channel;
        this.sentAt = sentAt;
        this.readAt = readAt;
    }

    public static SlaNotification create(UUID ticketId, UUID recipientId, NotificationType type, NotificationChannel channel) {
        return new SlaNotification(UUID.randomUUID(), ticketId, recipientId, type, channel, OffsetDateTime.now(), null);
    }

    public void markRead() { this.readAt = OffsetDateTime.now(); }

    public UUID getId() { return id; }
    public UUID getTicketId() { return ticketId; }
    public UUID getRecipientId() { return recipientId; }
    public NotificationType getNotificationType() { return notificationType; }
    public NotificationChannel getChannel() { return channel; }
    public OffsetDateTime getSentAt() { return sentAt; }
    public OffsetDateTime getReadAt() { return readAt; }
}
