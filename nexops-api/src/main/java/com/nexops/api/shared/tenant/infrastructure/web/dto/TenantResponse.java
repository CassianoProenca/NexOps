package com.nexops.api.shared.tenant.infrastructure.web.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record TenantResponse(
    UUID id,
    String cnpj,
    String nomeFantasia,
    String email,
    String status,
    OffsetDateTime createdAt
) {}
