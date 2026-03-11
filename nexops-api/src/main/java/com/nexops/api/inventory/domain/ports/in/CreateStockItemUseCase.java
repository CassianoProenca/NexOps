package com.nexops.api.inventory.domain.ports.in;

import com.nexops.api.inventory.domain.model.StockItem;

public interface CreateStockItemUseCase {
    StockItem createStockItem(String name, String category, String unit,
        int minimumQuantity, String location);
}
