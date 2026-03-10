package com.nexops.api.governance.infrastructure.persistence.entity;

import com.nexops.api.helpdesk.domain.model.SlaLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sla_configs")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class SlaConfigJpaEntity {
    @Id
    private UUID id;
    @Column(name = "problem_type_id")
    private UUID problemTypeId;
    @Enumerated(EnumType.STRING)
    private SlaLevel slaLevel;
    private int responseMinutes;
    private int resolutionMinutes;
    private int notifyManagerAtPercent;
    private boolean active;
    private OffsetDateTime createdAt;
}
