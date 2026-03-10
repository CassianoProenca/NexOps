package com.nexops.api.inventory.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record StockMovementResponse(
    UUID id,
    UUID stockItemId,
    String movementType,
    int quantity,
    int previousQuantity,
    int newQuantity,
    String reason,
    UUID performedById,
    UUID relatedTicketId,
    OffsetDateTime createdAt
) {}
