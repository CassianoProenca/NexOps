package com.nexops.api.inventory.domain.ports.in;

import com.nexops.api.inventory.domain.model.Asset;
import java.util.UUID;

public interface DiscardAssetUseCase {
    Asset discardAsset(UUID assetId, UUID performedById, String notes);
}
