package com.nexops.api.shared.iam.domain.ports.in;

import com.nexops.api.shared.iam.domain.model.TokenPair;
import java.util.Optional;

public interface RefreshTokenUseCase {
    Optional<TokenPair> execute(String rawRefreshToken);
}
