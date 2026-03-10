package com.nexops.api.shared.iam.domain.ports.in;

import com.nexops.api.shared.iam.domain.model.TokenPair;
import java.util.Optional;

public interface LoginUseCase {
    Optional<TokenPair> execute(String email, String password, String tenantSlug);
}
