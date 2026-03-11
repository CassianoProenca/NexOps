package com.nexops.api.helpdesk.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "departments")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class DepartmentJpaEntity {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    private String name;
    private String description;
    private boolean active;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
