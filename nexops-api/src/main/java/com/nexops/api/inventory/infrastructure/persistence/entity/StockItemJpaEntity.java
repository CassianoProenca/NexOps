package com.nexops.api.inventory.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_items")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class StockItemJpaEntity {
    @Id
    private UUID id;
    private String name;
    private String description;
    private String category;
    private String unit;
    @Column(name = "current_quantity")
    private int currentQuantity;
    @Column(name = "minimum_quantity")
    private int minimumQuantity;
    private String location;
    private boolean active;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
