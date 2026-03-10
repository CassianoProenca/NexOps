package com.nexops.api.helpdesk.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TicketSummaryResponse(
    UUID id,
    String title,
    String status,
    String slaLevel,
    UUID departmentId,
    UUID problemTypeId,
    UUID requesterId,
    UUID assigneeId,
    OffsetDateTime openedAt,
    OffsetDateTime slaDeadline,
    boolean isSlaBreached
) {}
