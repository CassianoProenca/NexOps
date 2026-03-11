package com.nexops.api.helpdesk.infrastructure.web.dto;

import com.nexops.api.helpdesk.domain.model.SlaLevel;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ProblemTypeResponse(
    UUID id,
    String name,
    String description,
    SlaLevel slaLevel,
    boolean active,
    OffsetDateTime createdAt
) {}
