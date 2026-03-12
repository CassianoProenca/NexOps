package com.nexops.api.shared.tenant.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ExtraSettingsResponse(
    UUID tenantId,
    String smtpHost,
    Integer smtpPort,
    String smtpUsername,
    String smtpFromEmail,
    String smtpFromName,
    Boolean smtpUseTls,
    String aiProvider,
    String aiModel,
    Boolean aiEnabled,
    OffsetDateTime updatedAt,
    boolean hasSmtpPassword,
    boolean hasAiApiKey
) {}
