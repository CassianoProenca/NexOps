package com.nexops.api.inventory.domain.ports.out;

import com.nexops.api.inventory.domain.model.StockItem;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StockItemRepository {
    StockItem save(StockItem item);
    Optional<StockItem> findById(UUID id);
    List<StockItem> findAll();
    List<StockItem> findActive();
    List<StockItem> findBelowMinimum();
}
