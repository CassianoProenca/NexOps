package com.nexops.api.shared.tenant.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TenantResponse(
    UUID id,
    String name,
    String slug,
    String schemaName,
    String status,
    String plan,
    Integer maxUsers,
    OffsetDateTime createdAt
) {}
