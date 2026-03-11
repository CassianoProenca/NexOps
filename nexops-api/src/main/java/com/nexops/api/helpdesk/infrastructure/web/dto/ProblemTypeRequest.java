package com.nexops.api.helpdesk.infrastructure.web.dto;

import com.nexops.api.helpdesk.domain.model.SlaLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProblemTypeRequest(
    @NotBlank String name,
    String description,
    @NotNull SlaLevel slaLevel
) {}
