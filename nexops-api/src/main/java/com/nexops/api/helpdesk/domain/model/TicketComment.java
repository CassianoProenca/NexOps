package com.nexops.api.helpdesk.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class TicketComment {
    private final UUID id;
    private final UUID tenantId;
    private final UUID ticketId;
    private final UUID authorId;
    private final String content;
    private final CommentType type;
    private final OffsetDateTime createdAt;

    public TicketComment(UUID id, UUID tenantId, UUID ticketId, UUID authorId, String content, CommentType type, OffsetDateTime createdAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.ticketId = ticketId;
        this.authorId = authorId;
        this.content = content;
        this.type = type;
        this.createdAt = createdAt;
    }

    public static TicketComment message(UUID tenantId, UUID ticketId, UUID authorId, String content) {
        return new TicketComment(
            UUID.randomUUID(),
            tenantId,
            ticketId,
            authorId,
            content,
            CommentType.MESSAGE,
            OffsetDateTime.now()
        );
    }

    public static TicketComment systemEvent(UUID tenantId, UUID ticketId, UUID authorId, String content, CommentType type) {
        return new TicketComment(
            UUID.randomUUID(),
            tenantId,
            ticketId,
            authorId,
            content,
            type,
            OffsetDateTime.now()
        );
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public UUID getTicketId() { return ticketId; }
    public UUID getAuthorId() { return authorId; }
    public String getContent() { return content; }
    public CommentType getType() { return type; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
