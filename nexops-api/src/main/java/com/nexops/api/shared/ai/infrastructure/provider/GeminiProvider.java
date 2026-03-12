package com.nexops.api.shared.ai.infrastructure.provider;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nexops.api.shared.exception.BusinessException;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.util.List;

class GeminiProvider {

    private static final String BASE_URL = "https://generativelanguage.googleapis.com";

    String complete(String systemPrompt, String userPrompt, String model, String apiKey) {
        var resolvedModel = model != null ? model : "gemini-1.5-flash";
        var client = RestClient.builder()
                .baseUrl(BASE_URL)
                .build();

        // Gemini doesn't have a separate system role in basic API — prepend to user content
        var fullPrompt = systemPrompt != null && !systemPrompt.isBlank()
                ? systemPrompt + "\n\n" + userPrompt
                : userPrompt;

        var request = new GenerateRequest(
                List.of(new Content(List.of(new Part(fullPrompt))))
        );

        try {
            var response = client.post()
                    .uri("/v1beta/models/{model}:generateContent?key={key}", resolvedModel, apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(GenerateResponse.class);

            if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
                throw new BusinessException("Resposta vazia do Gemini");
            }
            var parts = response.candidates().get(0).content().parts();
            if (parts == null || parts.isEmpty()) {
                throw new BusinessException("Conteúdo vazio na resposta do Gemini");
            }
            return parts.get(0).text();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Erro ao chamar Gemini: " + e.getMessage());
        }
    }

    // ── Request / Response records ──────────────────────────────────────────────

    record GenerateRequest(List<Content> contents) {}
    record Content(List<Part> parts) {}
    record Part(String text) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GenerateResponse(List<Candidate> candidates) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Candidate(Content content) {}
}
