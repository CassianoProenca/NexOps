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
    @Column(name = "ticket_id")
    private UUID ticketId;
    @Column(name = "author_id")
    private UUID authorId;
    private String content;
    @Enumerated(EnumType.STRING)
    private CommentType type;
    private OffsetDateTime createdAt;
}
