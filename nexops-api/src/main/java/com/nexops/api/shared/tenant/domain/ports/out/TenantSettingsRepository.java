package com.nexops.api.shared.tenant.domain.ports.out;

import com.nexops.api.shared.tenant.domain.model.TenantSettings;
import java.util.Optional;
import java.util.UUID;

public interface TenantSettingsRepository {
    Optional<TenantSettings> findByTenantId(UUID tenantId);
    TenantSettings save(TenantSettings settings);
}
