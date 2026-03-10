package com.nexops.api.shared.tenant.infrastructure.persistence;

import com.nexops.api.shared.tenant.domain.model.Tenant;
import com.nexops.api.shared.tenant.domain.ports.out.TenantRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class TenantRepositoryAdapter implements TenantRepository {

    private final TenantJpaRepository jpa;

    public TenantRepositoryAdapter(TenantJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Optional<Tenant> findBySlug(String slug) {
        return jpa.findBySlug(slug).map(TenantMapper::toDomain);
    }

    @Override
    public java.util.List<Tenant> findAll() {
        return jpa.findAll().stream().map(TenantMapper::toDomain).toList();
    }

    @Override
    public Tenant save(Tenant tenant) {
        return TenantMapper.toDomain(jpa.save(TenantMapper.toEntity(tenant)));
    }
}
