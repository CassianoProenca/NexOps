package com.nexops.api.inventory.infrastructure.persistence;

import com.nexops.api.inventory.infrastructure.persistence.entity.AssetMovementJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssetMovementJpaRepository extends JpaRepository<AssetMovementJpaEntity, UUID> {
    List<AssetMovementJpaEntity> findByAssetIdOrderByCreatedAtAsc(UUID assetId);
}
