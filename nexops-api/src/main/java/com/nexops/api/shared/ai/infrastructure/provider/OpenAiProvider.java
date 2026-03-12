package com.nexops.api.shared.ai.infrastructure.provider;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nexops.api.shared.exception.BusinessException;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.List;

class OpenAiProvider {

    private static final String BASE_URL = "https://api.openai.com";

    String complete(String systemPrompt, String userPrompt, String model, String apiKey) {
        var client = RestClient.builder()
                .baseUrl(BASE_URL)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();

        var request = new ChatRequest(
                model != null ? model : "gpt-4o",
                List.of(
                        new Message("system", systemPrompt),
                        new Message("user", userPrompt)
                )
        );

        try {
            var response = client.post()
                    .uri("/v1/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(ChatResponse.class);

            if (response == null || response.choices() == null || response.choices().isEmpty()) {
                throw new BusinessException("Resposta vazia do OpenAI");
            }
            return response.choices().get(0).message().content();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Erro ao chamar OpenAI: " + e.getMessage());
        }
    }

    // ── Request / Response records ──────────────────────────────────────────────

    record ChatRequest(String model, List<Message> messages) {}
    record Message(String role, String content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ChatResponse(List<Choice> choices) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Choice(Message message) {}
}
