package com.nexops.api.shared.iam.domain.ports.in;

import com.nexops.api.shared.iam.domain.model.Role;
import java.util.List;
import java.util.UUID;

public interface SaveRoleUseCase {
    Role create(String name, String description, List<String> permissions);
    Role update(UUID id, String name, String description, List<String> permissions);
}
