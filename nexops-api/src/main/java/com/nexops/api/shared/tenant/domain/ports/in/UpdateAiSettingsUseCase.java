package com.nexops.api.shared.tenant.domain.ports.in;

import com.nexops.api.shared.tenant.domain.model.TenantSettings;

public interface UpdateAiSettingsUseCase {
    TenantSettings updateAi(String provider, String apiKey, String model, Boolean enabled);
}
