package com.nexops.api.helpdesk.infrastructure.persistence.entity;

import com.nexops.api.helpdesk.domain.model.SlaLevel;
import com.nexops.api.helpdesk.domain.model.TicketPriority;
import com.nexops.api.helpdesk.domain.model.TicketStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TicketJpaEntity {
    @Id
    private UUID id;
    @Column(name = "tenant_id")
    private UUID tenantId;
    private String title;
    private String description;
    @Enumerated(EnumType.STRING)
    private TicketStatus status;
    @Enumerated(EnumType.STRING)
    private TicketPriority internalPriority;
    @Enumerated(EnumType.STRING)
    private SlaLevel slaLevel;
    @Column(name = "department_id")
    private UUID departmentId;
    @Column(name = "problem_type_id")
    private UUID problemTypeId;
    @Column(name = "requester_id")
    private UUID requesterId;
    @Column(name = "assignee_id")
    private UUID assigneeId;
    @Column(name = "parent_ticket_id")
    private UUID parentTicketId;
    private String pauseReason;
    private OffsetDateTime openedAt;
    private OffsetDateTime assignedAt;
    private OffsetDateTime pausedAt;
    private OffsetDateTime closedAt;
    private OffsetDateTime slaDeadline;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
