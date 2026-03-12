package com.nexops.api.shared.ai.infrastructure.provider;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nexops.api.shared.exception.BusinessException;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.List;

class AnthropicProvider {

    private static final String BASE_URL = "https://api.anthropic.com";
    private static final String API_VERSION = "2023-06-01";

    String complete(String systemPrompt, String userPrompt, String model, String apiKey) {
        var client = RestClient.builder()
                .baseUrl(BASE_URL)
                .defaultHeader("x-api-key", apiKey)
                .defaultHeader("anthropic-version", API_VERSION)
                .build();

        var request = new MessageRequest(
                model != null ? model : "claude-sonnet-4-6",
                1024,
                systemPrompt,
                List.of(new Message("user", userPrompt))
        );

        try {
            var response = client.post()
                    .uri("/v1/messages")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(MessageResponse.class);

            if (response == null || response.content() == null || response.content().isEmpty()) {
                throw new BusinessException("Resposta vazia do Anthropic");
            }
            return response.content().get(0).text();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Erro ao chamar Anthropic: " + e.getMessage());
        }
    }

    // ── Request / Response records ──────────────────────────────────────────────

    record MessageRequest(String model, int max_tokens, String system, List<Message> messages) {}
    record Message(String role, String content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record MessageResponse(List<ContentBlock> content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ContentBlock(String type, String text) {}
}
