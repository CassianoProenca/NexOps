package com.nexops.api.shared.iam.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String name,
    String email,
    String status,
    OffsetDateTime createdAt,
    OffsetDateTime lastLoginAt,
    List<String> roles
) {}
