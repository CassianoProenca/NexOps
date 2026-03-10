package com.nexops.api.shared.tenant.domain.ports.out;

import com.nexops.api.shared.tenant.domain.model.Tenant;
import java.util.Optional;

public interface TenantRepository {
    Optional<Tenant> findBySlug(String slug);
    java.util.List<Tenant> findAll();
    Tenant save(Tenant tenant);
}
