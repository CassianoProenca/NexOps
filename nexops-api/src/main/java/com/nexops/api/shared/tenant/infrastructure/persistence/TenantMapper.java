package com.nexops.api.shared.tenant.infrastructure.persistence;

import com.nexops.api.shared.tenant.domain.model.Tenant;

public class TenantMapper {

    public static Tenant toDomain(TenantJpaEntity e) {
        return new Tenant(
                e.getId(), e.getName(), e.getSlug(), e.getSchemaName(),
                e.getStatus(), e.getPlan(), e.getMaxUsers(),
                e.getCreatedAt(), e.getUpdatedAt()
        );
    }

    public static TenantJpaEntity toEntity(Tenant t) {
        return TenantJpaEntity.builder()
                .id(t.getId())
                .name(t.getName())
                .slug(t.getSlug())
                .schemaName(t.getSchemaName())
                .status(t.getStatus())
                .plan(t.getPlan())
                .maxUsers(t.getMaxUsers())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
