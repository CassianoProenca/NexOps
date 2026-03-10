package com.nexops.api.shared.tenant.domain.service;

import com.nexops.api.shared.tenant.TenantContext;
import com.nexops.api.shared.tenant.domain.model.Tenant;
import com.nexops.api.shared.tenant.domain.ports.out.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Consumer;

@Service
@RequiredArgsConstructor
public class TenantRunner {

    private final TenantRepository tenantRepository;
    private final JdbcTemplate jdbcTemplate;

    public void runForAllTenants(Consumer<Tenant> task) {
        List<Tenant> tenants = tenantRepository.findAll();
        for (Tenant tenant : tenants) {
            runForTenant(tenant, task);
        }
    }

    public void runForTenant(Tenant tenant, Consumer<Tenant> task) {
        try {
            TenantContext.setSlug(tenant.getSlug());
            TenantContext.setSchema(tenant.getSchemaName());
            
            // Set search_path for the current connection context
            jdbcTemplate.execute("SET search_path TO " + tenant.getSchemaName() + ", public");
            
            task.accept(tenant);
        } finally {
            TenantContext.clear();
            // Reset to public for safety
            jdbcTemplate.execute("SET search_path TO public");
        }
    }
}
