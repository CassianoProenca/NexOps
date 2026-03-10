package com.nexops.api.inventory.domain.ports.in;

import com.nexops.api.inventory.domain.model.Asset;
import java.util.UUID;

public interface AssignAssetUseCase {
    Asset assignAsset(UUID assetId, UUID userId, UUID departmentId, UUID performedById);
}
