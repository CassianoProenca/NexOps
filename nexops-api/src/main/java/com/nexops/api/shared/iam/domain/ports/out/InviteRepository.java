package com.nexops.api.shared.iam.domain.ports.out;

import com.nexops.api.shared.iam.domain.model.InviteToken;
import java.util.Optional;

public interface InviteRepository {
    InviteToken save(InviteToken invite);
    Optional<InviteToken> findByTokenHash(String tokenHash);
}
