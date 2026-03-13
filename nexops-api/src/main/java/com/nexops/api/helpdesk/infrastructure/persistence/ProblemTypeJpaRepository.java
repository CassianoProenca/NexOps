package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.infrastructure.persistence.entity.ProblemTypeJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProblemTypeJpaRepository extends JpaRepository<ProblemTypeJpaEntity, UUID> {
    List<ProblemTypeJpaEntity> findAllByTenantIdAndActiveTrue(UUID tenantId);
    List<ProblemTypeJpaEntity> findAllByTenantId(UUID tenantId);
}
