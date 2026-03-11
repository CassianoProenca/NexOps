package com.nexops.api.shared.iam.domain.ports.out;

import com.nexops.api.shared.iam.domain.model.Role;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoleRepository {
    List<Role> findAllByTenantId(UUID tenantId);
    Optional<Role> findById(UUID id);
    Role save(Role role);
    void delete(UUID id);
    boolean existsByNameAndTenantId(String name, UUID tenantId);
}
