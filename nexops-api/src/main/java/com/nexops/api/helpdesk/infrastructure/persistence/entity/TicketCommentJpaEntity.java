package com.nexops.api.helpdesk.infrastructure.persistence.entity;

import com.nexops.api.helpdesk.domain.model.CommentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ticket_comments")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TicketCommentJpaEntity {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "ticket_id", nullable = false)
    private UUID ticketId;

    @Column(name = "author_id", nullable = true)
    private UUID authorId;

    @Column(nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommentType type;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
