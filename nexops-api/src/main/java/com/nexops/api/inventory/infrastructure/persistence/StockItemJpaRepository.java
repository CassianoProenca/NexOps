package com.nexops.api.inventory.infrastructure.persistence;

import com.nexops.api.inventory.infrastructure.persistence.entity.StockItemJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface StockItemJpaRepository extends JpaRepository<StockItemJpaEntity, UUID> {
    List<StockItemJpaEntity> findByActiveTrue();

    @Query("SELECT s FROM StockItemJpaEntity s WHERE s.currentQuantity <= s.minimumQuantity AND s.active = TRUE")
    List<StockItemJpaEntity> findBelowMinimum();
}
