package com.nexops.api.helpdesk.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CommentResponse(
    UUID id,
    UUID ticketId,
    UUID authorId,
    String content,
    String type,
    OffsetDateTime createdAt
) {}
