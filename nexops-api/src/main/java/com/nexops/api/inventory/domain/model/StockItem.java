package com.nexops.api.inventory.domain.model;

import com.nexops.api.shared.exception.BusinessException;
import java.time.OffsetDateTime;
import java.util.UUID;

public class StockItem {
    private final UUID id;
    private String name;
    private String description;
    private final String category;
    private String unit;
    private int currentQuantity;
    private int minimumQuantity;
    private String location;
    private boolean active;
    private final OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public StockItem(UUID id, String name, String description, String category, String unit, int currentQuantity, int minimumQuantity, String location, boolean active, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.unit = unit;
        this.currentQuantity = currentQuantity;
        this.minimumQuantity = minimumQuantity;
        this.location = location;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static StockItem create(String name, String category, String unit, int minimumQuantity, String location) {
        return new StockItem(UUID.randomUUID(), name, null, category, unit, 0, minimumQuantity, location, true, OffsetDateTime.now(), OffsetDateTime.now());
    }

    public StockMovement addStock(int quantity, UUID performedById, String reason) {
        if (quantity <= 0) throw new BusinessException("Quantity must be positive");
        int prev = this.currentQuantity;
        this.currentQuantity += quantity;
        this.updatedAt = OffsetDateTime.now();
        return StockMovement.record(this.id, StockMovementType.IN, quantity, prev, this.currentQuantity, performedById, reason, null);
    }

    public StockMovement removeStock(int quantity, UUID performedById, String reason, UUID relatedTicketId) {
        if (quantity <= 0) throw new BusinessException("Quantity must be positive");
        if (quantity > this.currentQuantity) {
            throw new BusinessException("Insufficient stock");
        }
        int prev = this.currentQuantity;
        this.currentQuantity -= quantity;
        this.updatedAt = OffsetDateTime.now();
        return StockMovement.record(this.id, StockMovementType.OUT, quantity, prev, this.currentQuantity, performedById, reason, relatedTicketId);
    }

    public boolean isBelowMinimum() {
        return this.currentQuantity <= this.minimumQuantity;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getUnit() { return unit; }
    public int getCurrentQuantity() { return currentQuantity; }
    public int getMinimumQuantity() { return minimumQuantity; }
    public String getLocation() { return location; }
    public boolean isActive() { return active; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
