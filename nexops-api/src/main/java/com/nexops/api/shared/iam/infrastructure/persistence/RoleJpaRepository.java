package com.nexops.api.shared.iam.infrastructure.persistence;

import com.nexops.api.shared.iam.infrastructure.persistence.entity.RoleJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoleJpaRepository extends JpaRepository<RoleJpaEntity, UUID> {
    Optional<RoleJpaEntity> findByNameAndTenantId(String name, UUID tenantId);
    List<RoleJpaEntity> findAllByTenantId(UUID tenantId);
}
