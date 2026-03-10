package com.nexops.api.helpdesk.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TicketQueueItem(
    UUID id,
    String title,
    String status,
    String problemTypeName,
    String departmentName,
    String assigneeName,   // null if OPEN
    OffsetDateTime openedAt,
    long minutesOpen,
    boolean isSlaBreached
) {}
