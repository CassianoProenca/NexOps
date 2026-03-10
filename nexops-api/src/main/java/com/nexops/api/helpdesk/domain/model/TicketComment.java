package com.nexops.api.helpdesk.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class TicketComment {
    private final UUID id;
    private final UUID ticketId;
    private final UUID authorId;
    private final String content;
    private final CommentType type;
    private final OffsetDateTime createdAt;

    public TicketComment(UUID id, UUID ticketId, UUID authorId, String content, CommentType type, OffsetDateTime createdAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.authorId = authorId;
        this.content = content;
        this.type = type;
        this.createdAt = createdAt;
    }

    public static TicketComment message(UUID ticketId, UUID authorId, String content) {
        return new TicketComment(
            UUID.randomUUID(),
            ticketId,
            authorId,
            content,
            CommentType.MESSAGE,
            OffsetDateTime.now()
        );
    }

    public static TicketComment systemEvent(UUID ticketId, UUID authorId, String content, CommentType type) {
        return new TicketComment(
            UUID.randomUUID(),
            ticketId,
            authorId,
            content,
            type,
            OffsetDateTime.now()
        );
    }

    public UUID getId() { return id; }
    public UUID getTicketId() { return ticketId; }
    public UUID getAuthorId() { return authorId; }
    public String getContent() { return content; }
    public CommentType getType() { return type; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
