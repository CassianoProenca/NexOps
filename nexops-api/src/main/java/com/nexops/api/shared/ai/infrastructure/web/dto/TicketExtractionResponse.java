package com.nexops.api.shared.ai.infrastructure.web.dto;

import java.util.List;

public record TicketExtractionResponse(
    String suggestedTitle,
    String suggestedDepartmentId,
    String suggestedProblemTypeId,
    List<String> suggestedSolutions,
    String nextQuestion
) {}
