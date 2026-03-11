package com.nexops.api.shared.iam.domain.ports.out;

import com.nexops.api.shared.iam.domain.model.Permission;
import java.util.List;
import java.util.Set;

public interface PermissionRepository {
    List<Permission> findAll();
    Set<Permission> findAllByCodes(List<String> codes);
}
