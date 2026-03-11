package com.nexops.api.shared.tenant.domain.service;

import com.nexops.api.shared.tenant.domain.model.Tenant;
import com.nexops.api.shared.tenant.domain.ports.in.TenantProvisioningUseCase;
import com.nexops.api.shared.tenant.domain.ports.out.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * @deprecated Use RegisterTenantUseCase (IAM flow) for new tenant registration.
 * Kept for compatibility.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Deprecated
public class TenantProvisioningService implements TenantProvisioningUseCase {

    private final TenantRepository tenantRepository;

    @Override
    @Transactional
    public Tenant provision(String cnpj, String nomeFantasia, String email) {
        Tenant tenant = Tenant.create(cnpj, nomeFantasia, email);
        Tenant savedTenant = tenantRepository.save(tenant);
        log.info("Tenant provisioned: cnpj={}", cnpj);
        return savedTenant;
    }
}
