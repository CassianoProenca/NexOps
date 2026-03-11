package com.nexops.api.shared.iam.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ActivateAccountRequest(
    @NotBlank @Size(min = 8) String newPassword
) {}
