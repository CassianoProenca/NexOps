package com.nexops.api.inventory.domain.ports.out;

import com.nexops.api.inventory.domain.model.AssetMovement;
import java.util.List;
import java.util.UUID;

public interface AssetMovementRepository {
    AssetMovement save(AssetMovement movement);
    List<AssetMovement> findByAssetId(UUID assetId);
}
