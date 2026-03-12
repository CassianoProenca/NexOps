package com.nexops.api.shared.ai.infrastructure.provider;

import com.nexops.api.shared.ai.domain.ports.out.AiProviderPort;
import org.springframework.stereotype.Component;

@Component
public class AiProviderAdapter implements AiProviderPort {

    private final OpenAiProvider openAi = new OpenAiProvider();
    private final AnthropicProvider anthropic = new AnthropicProvider();
    private final GeminiProvider gemini = new GeminiProvider();
    private final NullAiProvider nullProvider = new NullAiProvider();

    @Override
    public String complete(String provider, String systemPrompt, String userPrompt, String model, String apiKey) {
        if (provider == null) return nullProvider.complete(systemPrompt, userPrompt);
        return switch (provider.toLowerCase()) {
            case "openai"               -> openAi.complete(systemPrompt, userPrompt, model, apiKey);
            case "anthropic"            -> anthropic.complete(systemPrompt, userPrompt, model, apiKey);
            case "gemini", "google"     -> gemini.complete(systemPrompt, userPrompt, model, apiKey);
            default                     -> nullProvider.complete(systemPrompt, userPrompt);
        };
    }
}
