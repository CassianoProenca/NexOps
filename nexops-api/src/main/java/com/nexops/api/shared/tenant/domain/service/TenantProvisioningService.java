package com.nexops.api.shared.tenant.domain.service;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.tenant.domain.model.Tenant;
import com.nexops.api.shared.tenant.domain.ports.in.TenantProvisioningUseCase;
import com.nexops.api.shared.tenant.domain.ports.out.TenantRepository;
import com.nexops.api.shared.tenant.infrastructure.TenantMigrationRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantProvisioningService implements TenantProvisioningUseCase {

    private final TenantRepository tenantRepository;
    private final TenantMigrationRunner migrationRunner;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public Tenant provision(String name, String slug, String plan, Integer maxUsers) {
        tenantRepository.findBySlug(slug).ifPresent(t -> {
            throw new BusinessException("Slug already in use: " + slug);
        });

        Tenant tenant = Tenant.create(name, slug, plan, maxUsers);

        jdbcTemplate.execute("CREATE SCHEMA IF NOT EXISTS " + tenant.getSchemaName());
        
        migrationRunner.migrate(tenant.getSchemaName());
        
        Tenant savedTenant = tenantRepository.save(tenant);
        
        log.info("Tenant provisioned: slug={}, schema={}", slug, tenant.getSchemaName());
        
        return savedTenant;
    }
}
