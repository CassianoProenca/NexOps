package com.nexops.api.helpdesk.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TicketResponse(
    UUID id,
    String title,
    String description,
    String status,
    String internalPriority,
    String slaLevel,
    UUID departmentId,
    UUID problemTypeId,
    UUID requesterId,
    UUID assigneeId,
    UUID parentTicketId,
    String pauseReason,
    String resolution,
    OffsetDateTime openedAt,
    OffsetDateTime assignedAt,
    OffsetDateTime pausedAt,
    OffsetDateTime closedAt,
    OffsetDateTime slaDeadline,
    boolean isSlaBreached,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
