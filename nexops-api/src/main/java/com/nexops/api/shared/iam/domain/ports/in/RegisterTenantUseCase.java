package com.nexops.api.shared.iam.domain.ports.in;

import com.nexops.api.shared.iam.domain.model.TokenPair;

public interface RegisterTenantUseCase {
    TokenPair execute(String cnpj, String nomeFantasia, String email, String senha);
}
