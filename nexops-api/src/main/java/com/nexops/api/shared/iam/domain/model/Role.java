package com.nexops.api.shared.iam.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.*;

@Entity
@Table(name = "roles")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(name = "is_system", nullable = false)
    private boolean system;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();

    @PrePersist
    void prePersist() {
        createdAt = OffsetDateTime.now();
    }
}
