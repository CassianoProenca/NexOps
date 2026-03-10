package com.nexops.api.shared.iam.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank String email,
    @NotBlank String password,
    @NotBlank String tenantSlug
) {}
