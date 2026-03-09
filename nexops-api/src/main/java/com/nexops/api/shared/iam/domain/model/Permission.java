package com.nexops.api.shared.iam.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "permissions")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    @Column(nullable = false)
    private String module;
}
