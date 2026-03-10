package com.nexops.api.inventory.infrastructure.persistence.entity;

import com.nexops.api.inventory.domain.model.AssetCategory;
import com.nexops.api.inventory.domain.model.AssetStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "assets")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class AssetJpaEntity {
    @Id
    private UUID id;
    @Column(name = "patrimony_number", unique = true, nullable = false)
    private String patrimonyNumber;
    private String name;
    private String description;
    @Enumerated(EnumType.STRING)
    private AssetCategory category;
    @Enumerated(EnumType.STRING)
    private AssetStatus status;
    @Column(name = "serial_number")
    private String serialNumber;
    private String model;
    private String manufacturer;
    @Column(name = "purchase_date")
    private LocalDate purchaseDate;
    @Column(name = "purchase_value")
    private BigDecimal purchaseValue;
    @Column(name = "warranty_until")
    private LocalDate warrantyUntil;
    @Column(name = "assigned_user_id")
    private UUID assignedUserId;
    @Column(name = "assigned_department_id")
    private UUID assignedDepartmentId;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
