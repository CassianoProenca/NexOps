package com.nexops.api.inventory.infrastructure.web.dto;

import java.time.LocalDate;

public record UpdateAssetRequest(
    String name,
    String description,
    String notes,
    LocalDate warrantyUntil
) {}
