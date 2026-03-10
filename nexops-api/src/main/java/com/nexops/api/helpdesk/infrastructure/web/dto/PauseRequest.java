package com.nexops.api.helpdesk.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;

public record PauseRequest(
    @NotBlank String reason
) {}
