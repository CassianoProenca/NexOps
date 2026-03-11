package com.nexops.api.shared.iam.domain.ports.in;

import com.nexops.api.shared.iam.domain.model.Role;
import java.util.List;

public interface GetRolesUseCase {
    List<Role> execute();
}
