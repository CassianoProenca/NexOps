package com.nexops.api.governance.infrastructure.web.dto;

import java.util.UUID;

public record TechnicianTicketItem(
    UUID id,
    String title,
    String problemTypeName,
    String slaLevel,
    String openedAt,
    String closedAt,
    boolean onSla
) {}
