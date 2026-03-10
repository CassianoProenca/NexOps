package com.nexops.api.shared.tenant.infrastructure.persistence;

import com.nexops.api.shared.tenant.domain.model.TenantStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants", schema = "public")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TenantJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "schema_name", nullable = false, unique = true)
    private String schemaName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TenantStatus status;

    @Column(nullable = false)
    private String plan;

    @Column(name = "max_users", nullable = false)
    private Integer maxUsers;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
