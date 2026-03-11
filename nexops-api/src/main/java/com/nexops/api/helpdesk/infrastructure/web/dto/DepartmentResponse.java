package com.nexops.api.helpdesk.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record DepartmentResponse(
    UUID id,
    String name,
    String description,
    boolean active,
    OffsetDateTime createdAt
) {}
