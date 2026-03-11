package com.nexops.api.shared.tenant.domain.ports.in;

import com.nexops.api.shared.tenant.domain.model.TenantSettings;

public interface GetExtraSettingsUseCase {
    TenantSettings getExtra();
}
