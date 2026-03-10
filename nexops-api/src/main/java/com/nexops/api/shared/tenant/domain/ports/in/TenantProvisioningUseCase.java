package com.nexops.api.shared.tenant.domain.ports.in;

import com.nexops.api.shared.tenant.domain.model.Tenant;

public interface TenantProvisioningUseCase {
    Tenant provision(String name, String slug, String plan, Integer maxUsers);
}
