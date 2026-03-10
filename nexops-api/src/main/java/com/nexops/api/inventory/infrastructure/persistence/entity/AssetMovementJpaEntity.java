package com.nexops.api.inventory.infrastructure.persistence.entity;

import com.nexops.api.inventory.domain.model.AssetMovementType;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "asset_movements")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class AssetMovementJpaEntity {
    @Id
    private UUID id;
    @Column(name = "asset_id")
    private UUID assetId;
    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type")
    private AssetMovementType movementType;
    @Column(name = "from_user_id")
    private UUID fromUserId;
    @Column(name = "to_user_id")
    private UUID toUserId;
    @Column(name = "from_department_id")
    private UUID fromDepartmentId;
    @Column(name = "to_department_id")
    private UUID toDepartmentId;
    @Column(name = "performed_by_id")
    private UUID performedById;
    private String notes;
    private OffsetDateTime createdAt;
}
