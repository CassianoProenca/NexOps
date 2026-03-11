package com.nexops.api.shared.tenant.domain.ports.in;

import com.nexops.api.shared.tenant.domain.model.Tenant;

public interface UpdateTenantSettingsUseCase {
    Tenant update(String nomeFantasia);
}
