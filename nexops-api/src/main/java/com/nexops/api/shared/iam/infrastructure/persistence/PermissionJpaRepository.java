package com.nexops.api.shared.iam.infrastructure.persistence;

import com.nexops.api.shared.iam.infrastructure.persistence.entity.PermissionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface PermissionJpaRepository extends JpaRepository<PermissionJpaEntity, UUID> {
    Set<PermissionJpaEntity> findByCodeIn(List<String> codes);
}
