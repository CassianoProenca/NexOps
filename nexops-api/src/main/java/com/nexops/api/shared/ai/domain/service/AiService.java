package com.nexops.api.shared.ai.domain.service;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.ai.domain.ports.in.AiCompletionUseCase;
import com.nexops.api.shared.ai.domain.ports.out.AiProviderPort;
import com.nexops.api.shared.tenant.domain.ports.out.TenantSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiService implements AiCompletionUseCase {

    private final TenantSettingsRepository settingsRepository;
    private final AiProviderPort aiProviderPort;

    @Override
    public String complete(UUID tenantId, String systemPrompt, String userPrompt) {
        var settings = settingsRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new BusinessException("Configurações não encontradas para este tenant"));

        if (!Boolean.TRUE.equals(settings.getAiEnabled())) {
            throw new BusinessException("IA não habilitada para este tenant");
        }
        if (settings.getAiProvider() == null || settings.getAiProvider().isBlank()) {
            throw new BusinessException("Provedor de IA não configurado");
        }
        if (settings.getAiApiKey() == null || settings.getAiApiKey().isBlank()) {
            throw new BusinessException("Chave de API de IA não configurada");
        }

        return aiProviderPort.complete(
                settings.getAiProvider(),
                systemPrompt,
                userPrompt,
                settings.getAiModel(),
                settings.getAiApiKey()
        );
    }
}
