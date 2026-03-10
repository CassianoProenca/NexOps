package com.nexops.api.inventory.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class StockMovement {
    private final UUID id;
    private final UUID stockItemId;
    private final StockMovementType movementType;
    private final int quantity;
    private final int previousQuantity;
    private final int newQuantity;
    private final String reason;
    private final UUID performedById;
    private final UUID relatedTicketId;
    private final OffsetDateTime createdAt;

    public StockMovement(UUID id, UUID stockItemId, StockMovementType movementType, int quantity, int previousQuantity, int newQuantity, String reason, UUID performedById, UUID relatedTicketId, OffsetDateTime createdAt) {
        this.id = id;
        this.stockItemId = stockItemId;
        this.movementType = movementType;
        this.quantity = quantity;
        this.previousQuantity = previousQuantity;
        this.newQuantity = newQuantity;
        this.reason = reason;
        this.performedById = performedById;
        this.relatedTicketId = relatedTicketId;
        this.createdAt = createdAt;
    }

    public static StockMovement record(UUID stockItemId, StockMovementType type, int quantity, int prev, int next, UUID performedBy, String reason, UUID relatedTicketId) {
        return new StockMovement(UUID.randomUUID(), stockItemId, type, quantity, prev, next, reason, performedBy, relatedTicketId, OffsetDateTime.now());
    }

    public UUID getId() { return id; }
    public UUID getStockItemId() { return stockItemId; }
    public StockMovementType getMovementType() { return movementType; }
    public int getQuantity() { return quantity; }
    public int getPreviousQuantity() { return previousQuantity; }
    public int getNewQuantity() { return newQuantity; }
    public String getReason() { return reason; }
    public UUID getPerformedById() { return performedById; }
    public UUID getRelatedTicketId() { return relatedTicketId; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
