package com.nexops.api.governance.infrastructure.persistence;

import com.nexops.api.governance.infrastructure.persistence.entity.SlaConfigJpaEntity;
import com.nexops.api.helpdesk.domain.model.SlaLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SlaConfigJpaRepository extends JpaRepository<SlaConfigJpaEntity, UUID> {
    Optional<SlaConfigJpaEntity> findByProblemTypeIdAndSlaLevel(UUID problemTypeId, SlaLevel slaLevel);
}
