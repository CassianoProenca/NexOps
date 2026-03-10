package com.nexops.api.inventory.infrastructure.web.dto;

import com.nexops.api.inventory.domain.model.AssetCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RegisterAssetRequest(
    @NotBlank String patrimonyNumber,
    @NotBlank String name,
    @NotNull AssetCategory category,
    String serialNumber,
    String model,
    String manufacturer,
    @NotNull UUID departmentId
) {}
