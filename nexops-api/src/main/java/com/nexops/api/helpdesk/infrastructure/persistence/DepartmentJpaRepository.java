package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.infrastructure.persistence.entity.DepartmentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DepartmentJpaRepository extends JpaRepository<DepartmentJpaEntity, UUID> {
    List<DepartmentJpaEntity> findAllByTenantIdAndActiveTrue(UUID tenantId);
}
