package com.nexops.api.inventory.domain.ports.in;

import com.nexops.api.inventory.domain.model.Asset;
import com.nexops.api.inventory.domain.model.AssetCategory;
import java.util.UUID;

public interface RegisterAssetUseCase {
    Asset registerAsset(String patrimonyNumber, String name, AssetCategory category,
        String serialNumber, String model, String manufacturer,
        UUID departmentId, UUID performedById);
}
