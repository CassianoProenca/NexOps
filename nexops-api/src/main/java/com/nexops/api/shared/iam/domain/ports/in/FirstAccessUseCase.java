package com.nexops.api.shared.iam.domain.ports.in;

import com.nexops.api.shared.iam.domain.model.TokenPair;

public interface FirstAccessUseCase {
    TokenPair execute(String token, String nome, String email, String senha);
}
