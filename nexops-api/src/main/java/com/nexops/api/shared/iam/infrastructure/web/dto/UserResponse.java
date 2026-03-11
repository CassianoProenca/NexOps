package com.nexops.api.shared.iam.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String nome,
    String email,
    UUID tenantId,
    String status,
    OffsetDateTime createdAt
) {}
