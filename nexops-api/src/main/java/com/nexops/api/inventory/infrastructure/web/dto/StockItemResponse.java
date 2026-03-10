package com.nexops.api.inventory.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record StockItemResponse(
    UUID id,
    String name,
    String description,
    String category,
    String unit,
    int currentQuantity,
    int minimumQuantity,
    String location,
    boolean active,
    boolean isBelowMinimum,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
