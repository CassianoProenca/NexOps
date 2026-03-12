package com.nexops.api.shared.ai.infrastructure.provider;

import com.nexops.api.shared.exception.BusinessException;

class NullAiProvider {

    String complete(String systemPrompt, String userPrompt) {
        throw new BusinessException("Provedor de IA desconhecido ou não suportado");
    }
}
