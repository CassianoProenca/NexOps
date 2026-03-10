package com.nexops.api.inventory.domain.ports.in;

import com.nexops.api.inventory.domain.model.Asset;
import java.util.UUID;

public interface UnassignAssetUseCase {
    Asset unassignAsset(UUID assetId, UUID performedById);
}
