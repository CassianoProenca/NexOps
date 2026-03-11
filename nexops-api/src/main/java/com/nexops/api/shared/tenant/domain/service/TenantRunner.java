package com.nexops.api.shared.tenant.domain.service;

import com.nexops.api.shared.tenant.domain.model.Tenant;
import com.nexops.api.shared.tenant.domain.ports.out.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
public class TenantRunner {

    private final TenantRepository tenantRepository;

    public void runForAllTenants(Consumer<Tenant> task) {
        List<Tenant> tenants = tenantRepository.findAll();
        for (Tenant tenant : tenants) {
            task.accept(tenant);
        }
    }
}
