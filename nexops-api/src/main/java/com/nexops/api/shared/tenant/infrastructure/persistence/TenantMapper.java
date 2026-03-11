package com.nexops.api.shared.tenant.infrastructure.persistence;

import com.nexops.api.shared.tenant.domain.model.Tenant;

public class TenantMapper {

    public static Tenant toDomain(TenantJpaEntity e) {
        return new Tenant(
                e.getId(), e.getCnpj(), e.getNomeFantasia(), e.getEmail(),
                e.getStatus(), e.getCreatedAt()
        );
    }

    public static TenantJpaEntity toEntity(Tenant t) {
        return TenantJpaEntity.builder()
                .id(t.getId())
                .cnpj(t.getCnpj())
                .nomeFantasia(t.getNomeFantasia())
                .email(t.getEmail())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
