package com.nexops.api.shared.tenant.infrastructure.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateTenantRequest(
    @NotBlank String name,
    @NotBlank @Pattern(regexp="^[a-z0-9-]+$") String slug,
    @NotBlank String plan,
    @NotNull @Min(1) Integer maxUsers
) {}
