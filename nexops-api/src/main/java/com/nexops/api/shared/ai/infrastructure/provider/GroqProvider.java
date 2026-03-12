package com.nexops.api.shared.ai.infrastructure.provider;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nexops.api.shared.exception.BusinessException;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.List;

class GroqProvider {

    private static final String BASE_URL = "https://api.groq.com/openai/v1";

    String complete(String systemPrompt, String userPrompt, String model, String apiKey) {
        var resolvedModel = model != null && !model.isBlank() ? model : "llama-3.3-70b-versatile";
        var client = RestClient.builder()
                .baseUrl(BASE_URL)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();

        var request = new ChatRequest(
                resolvedModel,
                List.of(
                        new Message("system", systemPrompt),
                        new Message("user", userPrompt)
                ),
                0.7
        );

        try {
            var response = client.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), (req, res) -> {
                        throw new BusinessException("Erro na API Groq (" + res.getStatusCode() + "): " + new String(res.getBody().readAllBytes()));
                    })
                    .body(ChatResponse.class);

            if (response == null || response.choices() == null || response.choices().isEmpty()) {
                throw new BusinessException("Resposta vazia do Groq");
            }
            return response.choices().get(0).message().content();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Erro ao chamar Groq: " + e.getMessage());
        }
    }

    record ChatRequest(String model, List<Message> messages, double temperature) {}
    record Message(String role, String content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record ChatResponse(List<Choice> choices) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Choice(Message message) {}
}
