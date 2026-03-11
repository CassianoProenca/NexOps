package com.nexops.api.shared.tenant.infrastructure.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateTenantRequest(
    @NotBlank String cnpj,
    @NotBlank String nomeFantasia,
    @NotBlank @Email String email
) {}
