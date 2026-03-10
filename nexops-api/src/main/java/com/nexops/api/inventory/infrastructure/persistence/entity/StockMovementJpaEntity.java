package com.nexops.api.inventory.infrastructure.persistence.entity;

import com.nexops.api.inventory.domain.model.StockMovementType;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_movements")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class StockMovementJpaEntity {
    @Id
    private UUID id;
    @Column(name = "stock_item_id")
    private UUID stockItemId;
    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type")
    private StockMovementType movementType;
    private int quantity;
    @Column(name = "previous_quantity")
    private int previousQuantity;
    @Column(name = "new_quantity")
    private int newQuantity;
    private String reason;
    @Column(name = "performed_by_id")
    private UUID performedById;
    @Column(name = "related_ticket_id")
    private UUID relatedTicketId;
    private OffsetDateTime createdAt;
}
