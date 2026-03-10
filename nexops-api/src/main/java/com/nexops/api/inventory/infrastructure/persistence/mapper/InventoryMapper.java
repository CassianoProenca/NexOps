package com.nexops.api.inventory.infrastructure.persistence.mapper;

import com.nexops.api.inventory.domain.model.*;
import com.nexops.api.inventory.infrastructure.persistence.entity.*;

public class InventoryMapper {

    public static Asset toDomain(AssetJpaEntity e) {
        return new Asset(e.getId(), e.getPatrimonyNumber(), e.getName(), e.getDescription(),
                e.getCategory(), e.getStatus(), e.getSerialNumber(), e.getModel(),
                e.getManufacturer(), e.getPurchaseDate(), e.getPurchaseValue(),
                e.getWarrantyUntil(), e.getAssignedUserId(), e.getAssignedDepartmentId(),
                e.getNotes(), e.getCreatedAt(), e.getUpdatedAt());
    }

    public static AssetJpaEntity toEntity(Asset d) {
        return AssetJpaEntity.builder()
                .id(d.getId()).patrimonyNumber(d.getPatrimonyNumber()).name(d.getName())
                .description(d.getDescription()).category(d.getCategory()).status(d.getStatus())
                .serialNumber(d.getSerialNumber()).model(d.getModel()).manufacturer(d.getManufacturer())
                .purchaseDate(d.getPurchaseDate()).purchaseValue(d.getPurchaseValue())
                .warrantyUntil(d.getWarrantyUntil()).assignedUserId(d.getAssignedUserId())
                .assignedDepartmentId(d.getAssignedDepartmentId()).notes(d.getNotes())
                .createdAt(d.getCreatedAt()).updatedAt(d.getUpdatedAt()).build();
    }

    public static AssetMovement toDomain(AssetMovementJpaEntity e) {
        return new AssetMovement(e.getId(), e.getAssetId(), e.getMovementType(),
                e.getFromUserId(), e.getToUserId(), e.getFromDepartmentId(),
                e.getToDepartmentId(), e.getPerformedById(), e.getNotes(), e.getCreatedAt());
    }

    public static AssetMovementJpaEntity toEntity(AssetMovement d) {
        return AssetMovementJpaEntity.builder()
                .id(d.getId()).assetId(d.getAssetId()).movementType(d.getMovementType())
                .fromUserId(d.getFromUserId()).toUserId(d.getToUserId())
                .fromDepartmentId(d.getFromDepartmentId()).toDepartmentId(d.getToDepartmentId())
                .performedById(d.getPerformedById()).notes(d.getNotes())
                .createdAt(d.getCreatedAt()).build();
    }

    public static StockItem toDomain(StockItemJpaEntity e) {
        return new StockItem(e.getId(), e.getName(), e.getDescription(), e.getCategory(),
                e.getUnit(), e.getCurrentQuantity(), e.getMinimumQuantity(),
                e.getLocation(), e.isActive(), e.getCreatedAt(), e.getUpdatedAt());
    }

    public static StockItemJpaEntity toEntity(StockItem d) {
        return StockItemJpaEntity.builder()
                .id(d.getId()).name(d.getName()).description(d.getDescription())
                .category(d.getCategory()).unit(d.getUnit())
                .currentQuantity(d.getCurrentQuantity()).minimumQuantity(d.getMinimumQuantity())
                .location(d.getLocation()).active(d.isActive())
                .createdAt(d.getCreatedAt()).updatedAt(d.getUpdatedAt()).build();
    }

    public static StockMovement toDomain(StockMovementJpaEntity e) {
        return new StockMovement(e.getId(), e.getStockItemId(), e.getMovementType(),
                e.getQuantity(), e.getPreviousQuantity(), e.getNewQuantity(),
                e.getReason(), e.getPerformedById(), e.getRelatedTicketId(), e.getCreatedAt());
    }

    public static StockMovementJpaEntity toEntity(StockMovement d) {
        return StockMovementJpaEntity.builder()
                .id(d.getId()).stockItemId(d.getStockItemId()).movementType(d.getMovementType())
                .quantity(d.getQuantity()).previousQuantity(d.getPreviousQuantity())
                .newQuantity(d.getNewQuantity()).reason(d.getReason())
                .performedById(d.getPerformedById()).relatedTicketId(d.getRelatedTicketId())
                .createdAt(d.getCreatedAt()).build();
    }
}
