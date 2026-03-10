package com.nexops.api.inventory.infrastructure.persistence;

import com.nexops.api.inventory.domain.model.AssetStatus;
import com.nexops.api.inventory.infrastructure.persistence.entity.AssetJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssetJpaRepository extends JpaRepository<AssetJpaEntity, UUID> {
    List<AssetJpaEntity> findByStatus(AssetStatus status);
    List<AssetJpaEntity> findByAssignedUserId(UUID userId);
    List<AssetJpaEntity> findByAssignedDepartmentId(UUID departmentId);
    boolean existsByPatrimonyNumber(String patrimonyNumber);
}
