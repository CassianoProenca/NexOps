package com.nexops.api.shared.iam.infrastructure.web.dto;

public record DevBootstrapResponse(
        String tenantSlug,
        String tenantSchema,
        String adminEmail,
        String adminPassword,
        String accessToken
) {}
