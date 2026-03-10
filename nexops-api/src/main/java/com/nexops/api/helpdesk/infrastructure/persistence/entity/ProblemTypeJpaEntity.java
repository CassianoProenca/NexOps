package com.nexops.api.helpdesk.infrastructure.persistence.entity;

import com.nexops.api.helpdesk.domain.model.SlaLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "problem_types")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class ProblemTypeJpaEntity {
    @Id
    private UUID id;
    private String name;
    private String description;
    @Enumerated(EnumType.STRING)
    private SlaLevel slaLevel;
    private boolean active;
    private OffsetDateTime createdAt;
}
