package com.nexops.api.inventory.domain.model;

import com.nexops.api.shared.exception.BusinessException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class Asset {
    private final UUID id;
    private final String patrimonyNumber;
    private String name;
    private String description;
    private final AssetCategory category;
    private AssetStatus status;
    private String serialNumber;
    private String model;
    private String manufacturer;
    private LocalDate purchaseDate;
    private BigDecimal purchaseValue;
    private LocalDate warrantyUntil;
    private UUID assignedUserId;
    private UUID assignedDepartmentId;
    private String notes;
    private final OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public Asset(UUID id, String patrimonyNumber, String name, String description, AssetCategory category, AssetStatus status, String serialNumber, String model, String manufacturer, LocalDate purchaseDate, BigDecimal purchaseValue, LocalDate warrantyUntil, UUID assignedUserId, UUID assignedDepartmentId, String notes, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.patrimonyNumber = patrimonyNumber;
        this.name = name;
        this.description = description;
        this.category = category;
        this.status = status;
        this.serialNumber = serialNumber;
        this.model = model;
        this.manufacturer = manufacturer;
        this.purchaseDate = purchaseDate;
        this.purchaseValue = purchaseValue;
        this.warrantyUntil = warrantyUntil;
        this.assignedUserId = assignedUserId;
        this.assignedDepartmentId = assignedDepartmentId;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Asset register(String patrimonyNumber, String name, AssetCategory category, String serialNumber, String model, String manufacturer, UUID assignedDepartmentId) {
        return new Asset(UUID.randomUUID(), patrimonyNumber, name, null, category, AssetStatus.REGISTERED, serialNumber, model, manufacturer, null, null, null, null, assignedDepartmentId, null, OffsetDateTime.now(), OffsetDateTime.now());
    }

    public AssetMovement makeAvailable(UUID performedById) {
        if (this.status != AssetStatus.REGISTERED && this.status != AssetStatus.IN_MAINTENANCE) {
            throw new BusinessException("Asset cannot transition to AVAILABLE from " + status);
        }
        AssetMovementType type = this.status == AssetStatus.IN_MAINTENANCE ? AssetMovementType.RETURNED_FROM_MAINTENANCE : AssetMovementType.REGISTERED;
        this.status = AssetStatus.AVAILABLE;
        this.updatedAt = OffsetDateTime.now();
        return AssetMovement.record(this.id, type, null, null, this.assignedDepartmentId, this.assignedDepartmentId, performedById, null);
    }

    public AssetMovement assignTo(UUID userId, UUID departmentId, UUID performedById) {
        if (this.status != AssetStatus.AVAILABLE) {
            throw new BusinessException("Only AVAILABLE assets can be assigned");
        }
        UUID prevUser = this.assignedUserId;
        UUID prevDept = this.assignedDepartmentId;
        this.assignedUserId = userId;
        this.assignedDepartmentId = departmentId;
        this.status = AssetStatus.IN_USE;
        this.updatedAt = OffsetDateTime.now();
        return AssetMovement.record(this.id, AssetMovementType.ASSIGNED, prevUser, userId, prevDept, departmentId, performedById, null);
    }

    public AssetMovement unassign(UUID performedById) {
        if (this.status != AssetStatus.IN_USE) {
            throw new BusinessException("Only IN_USE assets can be unassigned");
        }
        UUID prevUser = this.assignedUserId;
        this.assignedUserId = null;
        this.status = AssetStatus.AVAILABLE;
        this.updatedAt = OffsetDateTime.now();
        return AssetMovement.record(this.id, AssetMovementType.UNASSIGNED, prevUser, null, this.assignedDepartmentId, this.assignedDepartmentId, performedById, null);
    }

    public AssetMovement sendToMaintenance(UUID performedById, String notes) {
        if (this.status == AssetStatus.DISCARDED || this.status == AssetStatus.IN_MAINTENANCE) {
            throw new BusinessException("Asset cannot be sent to maintenance from " + status);
        }
        UUID prevUser = this.assignedUserId;
        this.assignedUserId = null;
        this.status = AssetStatus.IN_MAINTENANCE;
        this.updatedAt = OffsetDateTime.now();
        return AssetMovement.record(this.id, AssetMovementType.SENT_TO_MAINTENANCE, prevUser, null, this.assignedDepartmentId, this.assignedDepartmentId, performedById, notes);
    }

    public AssetMovement discard(UUID performedById, String notes) {
        if (this.status == AssetStatus.DISCARDED) {
            throw new BusinessException("Asset is already discarded");
        }
        this.status = AssetStatus.DISCARDED;
        this.assignedUserId = null;
        this.updatedAt = OffsetDateTime.now();
        return AssetMovement.record(this.id, AssetMovementType.DISCARDED, this.assignedUserId, null, this.assignedDepartmentId, null, performedById, notes);
    }

    public void update(String name, String description, String notes, LocalDate warrantyUntil) {
        this.name = name;
        this.description = description;
        this.notes = notes;
        this.warrantyUntil = warrantyUntil;
        this.updatedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public String getPatrimonyNumber() { return patrimonyNumber; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public AssetCategory getCategory() { return category; }
    public AssetStatus getStatus() { return status; }
    public String getSerialNumber() { return serialNumber; }
    public String getModel() { return model; }
    public String getManufacturer() { return manufacturer; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public BigDecimal getPurchaseValue() { return purchaseValue; }
    public LocalDate getWarrantyUntil() { return warrantyUntil; }
    public UUID getAssignedUserId() { return assignedUserId; }
    public UUID getAssignedDepartmentId() { return assignedDepartmentId; }
    public String getNotes() { return notes; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
