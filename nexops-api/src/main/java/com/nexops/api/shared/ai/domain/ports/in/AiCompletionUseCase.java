package com.nexops.api.shared.ai.domain.ports.in;

import java.util.UUID;

public interface AiCompletionUseCase {
    /**
     * Executes an AI completion using the tenant's configured provider and API key.
     *
     * @param tenantId     the tenant making the request
     * @param systemPrompt instructions for the model
     * @param userPrompt   the user's input
     * @return the model's response text
     */
    String complete(UUID tenantId, String systemPrompt, String userPrompt);
}
