package com.nexops.api.shared.iam.infrastructure.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InviteRequest(
    @NotBlank String name,
    @NotBlank @Email String email,
    @NotBlank String roleId,
    @NotBlank String password
) {}
