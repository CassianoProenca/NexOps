package com.nexops.api.inventory.infrastructure.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AssetResponse(
    UUID id,
    String patrimonyNumber,
    String name,
    String description,
    String category,
    String status,
    String serialNumber,
    String model,
    String manufacturer,
    LocalDate purchaseDate,
    BigDecimal purchaseValue,
    LocalDate warrantyUntil,
    UUID assignedUserId,
    UUID assignedDepartmentId,
    String notes,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
