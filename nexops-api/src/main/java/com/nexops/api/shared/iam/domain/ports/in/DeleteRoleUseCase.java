package com.nexops.api.shared.iam.domain.ports.in;

import java.util.UUID;

public interface DeleteRoleUseCase {
    void execute(UUID id);
}
