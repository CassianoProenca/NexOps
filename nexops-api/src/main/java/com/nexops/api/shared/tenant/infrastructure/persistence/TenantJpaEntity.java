package com.nexops.api.shared.tenant.infrastructure.persistence;

import com.nexops.api.shared.tenant.domain.model.TenantStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TenantJpaEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;

    @Column(name = "nome_fantasia", nullable = false)
    private String nomeFantasia;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TenantStatus status;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
