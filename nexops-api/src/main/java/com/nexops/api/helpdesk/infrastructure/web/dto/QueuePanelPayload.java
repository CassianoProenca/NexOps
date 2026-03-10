package com.nexops.api.helpdesk.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record QueuePanelPayload(
    List<TicketQueueItem> openTickets,
    List<TicketQueueItem> inProgressTickets,
    OffsetDateTime updatedAt
) {}
