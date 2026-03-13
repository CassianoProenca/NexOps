package com.nexops.api.helpdesk.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AttachmentResponse(
        UUID id,
        UUID ticketId,
        String filename,
        String contentType,
        Long sizeBytes,
        OffsetDateTime createdAt
) {}
