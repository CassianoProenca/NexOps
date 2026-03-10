package com.nexops.api.inventory.domain.ports.out;

import com.nexops.api.inventory.domain.model.StockMovement;
import java.util.List;
import java.util.UUID;

public interface StockMovementRepository {
    StockMovement save(StockMovement movement);
    List<StockMovement> findByStockItemId(UUID stockItemId);
}
