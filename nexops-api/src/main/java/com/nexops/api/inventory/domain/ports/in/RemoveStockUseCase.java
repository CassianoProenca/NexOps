package com.nexops.api.inventory.domain.ports.in;

import com.nexops.api.inventory.domain.model.StockItem;
import java.util.UUID;

public interface RemoveStockUseCase {
    StockItem removeStock(UUID stockItemId, int quantity,
        UUID performedById, String reason, UUID relatedTicketId);
}
