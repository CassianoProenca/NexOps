package com.nexops.api.governance.infrastructure.persistence.entity;

import com.nexops.api.governance.domain.model.SlaBreachEvent;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sla_breach_events")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class SlaBreachEventJpaEntity {
    @Id
    private UUID id;
    @Column(name = "ticket_id")
    private UUID ticketId;
    @Enumerated(EnumType.STRING)
    private SlaBreachEvent.BreachType breachType;
    private OffsetDateTime breachedAt;
    private OffsetDateTime slaDeadline;
    private int minutesOverdue;
    private OffsetDateTime createdAt;
}
