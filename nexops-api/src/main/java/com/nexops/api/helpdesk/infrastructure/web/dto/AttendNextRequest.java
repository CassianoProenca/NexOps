package com.nexops.api.helpdesk.infrastructure.web.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AttendNextRequest(
    @NotNull UUID problemTypeId
) {}
