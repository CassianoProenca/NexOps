package com.nexops.api.shared.iam.domain.ports.in;

import java.util.List;
import java.util.UUID;

public interface UpdateUserUseCase {
    void execute(UUID userId, UUID roleId, List<String> permissions);
}
