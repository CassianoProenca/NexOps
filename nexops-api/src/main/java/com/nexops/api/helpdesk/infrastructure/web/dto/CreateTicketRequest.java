package com.nexops.api.helpdesk.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateTicketRequest(
    @NotBlank String title,
    @NotBlank String description,
    @NotNull UUID departmentId,
    @NotNull UUID problemTypeId
) {}
