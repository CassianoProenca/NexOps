package com.nexops.api.shared.iam.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.*;

@Entity
@Table(name = "roles")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class RoleJpaEntity {

    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "system_role", nullable = false)
    private boolean systemRole;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    @Builder.Default
    private Set<PermissionJpaEntity> permissions = new HashSet<>();
}
