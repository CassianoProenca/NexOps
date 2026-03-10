package com.nexops.api.inventory.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateStockItemRequest(
    @NotBlank String name,
    @NotBlank String category,
    @NotBlank String unit,
    @NotNull Integer minimumQuantity,
    String location
) {}
