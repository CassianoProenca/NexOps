package com.nexops.api.inventory.infrastructure.persistence;

import com.nexops.api.inventory.infrastructure.persistence.entity.StockMovementJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StockMovementJpaRepository extends JpaRepository<StockMovementJpaEntity, UUID> {
    List<StockMovementJpaEntity> findByStockItemIdOrderByCreatedAtAsc(UUID stockItemId);
}
