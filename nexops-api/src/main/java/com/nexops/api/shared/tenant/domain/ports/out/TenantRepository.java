package com.nexops.api.shared.tenant.domain.ports.out;

import com.nexops.api.shared.tenant.domain.model.Tenant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantRepository {
    Tenant save(Tenant tenant);
    Optional<Tenant> findById(UUID id);
    Optional<Tenant> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByCnpj(String cnpj);
    List<Tenant> findAll();
}
