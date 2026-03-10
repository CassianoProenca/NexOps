package com.nexops.api.inventory.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class AssetMovement {
    private final UUID id;
    private final UUID assetId;
    private final AssetMovementType movementType;
    private final UUID fromUserId;
    private final UUID toUserId;
    private final UUID fromDepartmentId;
    private final UUID toDepartmentId;
    private final UUID performedById;
    private final String notes;
    private final OffsetDateTime createdAt;

    public AssetMovement(UUID id, UUID assetId, AssetMovementType movementType, UUID fromUserId, UUID toUserId, UUID fromDepartmentId, UUID toDepartmentId, UUID performedById, String notes, OffsetDateTime createdAt) {
        this.id = id;
        this.assetId = assetId;
        this.movementType = movementType;
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.fromDepartmentId = fromDepartmentId;
        this.toDepartmentId = toDepartmentId;
        this.performedById = performedById;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    public static AssetMovement record(UUID assetId, AssetMovementType type, UUID fromUser, UUID toUser, UUID fromDept, UUID toDept, UUID performedBy, String notes) {
        return new AssetMovement(UUID.randomUUID(), assetId, type, fromUser, toUser, fromDept, toDept, performedBy, notes, OffsetDateTime.now());
    }

    public UUID getId() { return id; }
    public UUID getAssetId() { return assetId; }
    public AssetMovementType getMovementType() { return movementType; }
    public UUID getFromUserId() { return fromUserId; }
    public UUID getToUserId() { return toUserId; }
    public UUID getFromDepartmentId() { return fromDepartmentId; }
    public UUID getToDepartmentId() { return toDepartmentId; }
    public UUID getPerformedById() { return performedById; }
    public String getNotes() { return notes; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
