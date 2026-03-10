package com.nexops.api.inventory.infrastructure.web.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record StockAdjustmentRequest(
    @NotNull Integer quantity,
    String reason,
    UUID relatedTicketId
) {}
