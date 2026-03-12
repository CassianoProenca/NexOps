package com.nexops.api.shared.ai.domain.ports.out;

public interface AiProviderPort {
    /**
     * Delegates a completion request to the appropriate external AI provider.
     *
     * @param provider     provider name: "openai", "gemini", or "anthropic"
     * @param systemPrompt instructions for the model
     * @param userPrompt   the user's input
     * @param model        model identifier (e.g. "gpt-4o", "gemini-1.5-pro")
     * @param apiKey       the tenant's API key for the provider
     * @return the model's response text
     */
    String complete(String provider, String systemPrompt, String userPrompt, String model, String apiKey);
}
