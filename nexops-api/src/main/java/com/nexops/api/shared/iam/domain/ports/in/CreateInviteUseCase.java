package com.nexops.api.shared.iam.domain.ports.in;

import java.util.UUID;

public interface CreateInviteUseCase {
    void execute(String name, String email, UUID roleId, String password);
}
