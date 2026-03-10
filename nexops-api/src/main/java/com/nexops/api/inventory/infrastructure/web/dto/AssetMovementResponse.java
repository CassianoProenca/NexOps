package com.nexops.api.inventory.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AssetMovementResponse(
    UUID id,
    UUID assetId,
    String movementType,
    UUID fromUserId,
    UUID toUserId,
    UUID fromDepartmentId,
    UUID toDepartmentId,
    UUID performedById,
    String notes,
    OffsetDateTime createdAt
) {}
