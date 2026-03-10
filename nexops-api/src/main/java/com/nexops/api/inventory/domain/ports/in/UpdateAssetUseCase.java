package com.nexops.api.inventory.domain.ports.in;

import com.nexops.api.inventory.domain.model.Asset;
import java.time.LocalDate;
import java.util.UUID;

public interface UpdateAssetUseCase {
    Asset updateAsset(UUID assetId, String name, String description,
        String notes, LocalDate warrantyUntil);
}
