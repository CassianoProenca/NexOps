package com.nexops.api.shared.iam.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "permissions")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class PermissionJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    @Column(nullable = false)
    private String module;
}
