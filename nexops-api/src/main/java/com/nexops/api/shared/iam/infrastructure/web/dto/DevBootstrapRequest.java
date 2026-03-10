package com.nexops.api.shared.iam.infrastructure.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record DevBootstrapRequest(
        @NotBlank String tenantName,
        @NotBlank @Pattern(regexp = "^[a-z0-9-]+$", message = "slug deve conter apenas letras minúsculas, números e hífens")
        String tenantSlug,
        @NotBlank @Email String adminEmail,
        String password  // opcional — default "nexops123" se não informado
) {
    public String resolvedPassword() {
        return (password != null && !password.isBlank()) ? password : "nexops123";
    }
}
