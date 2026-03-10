package com.nexops.api.inventory.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;

public record DiscardRequest(
    @NotBlank String notes
) {}
