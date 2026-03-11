package com.nexops.api.shared.iam.domain.ports.out;

import java.util.Set;
import java.util.UUID;

public interface TenantSeedPort {
    /**
     * Seeds the default roles (ADMIN, TECH, USER) for a new tenant.
     * Returns the permission codes granted to the ADMIN role for JWT embedding.
     */
    Set<String> seedTenantRoles(UUID tenantId);

    /**
     * Assigns the ADMIN role to a user within a tenant.
     */
    void assignAdminRole(UUID userId, UUID tenantId);

    /**
     * Assigns the USER role to a user within a tenant.
     */
    void assignUserRole(UUID userId, UUID tenantId);
}
