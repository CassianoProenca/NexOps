package com.nexops.api.shared.tenant.infrastructure.persistence;

import com.nexops.api.shared.tenant.domain.model.Tenant;
import com.nexops.api.shared.tenant.domain.ports.out.TenantRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class TenantRepositoryAdapter implements TenantRepository {

    private final TenantJpaRepository jpa;

    public TenantRepositoryAdapter(TenantJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Tenant save(Tenant tenant) {
        return TenantMapper.toDomain(jpa.saveAndFlush(TenantMapper.toEntity(tenant)));
    }

    @Override
    public Optional<Tenant> findById(UUID id) {
        return jpa.findById(id).map(TenantMapper::toDomain);
    }

    @Override
    public Optional<Tenant> findByEmail(String email) {
        return jpa.findByEmail(email).map(TenantMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpa.existsByEmail(email);
    }

    @Override
    public boolean existsByCnpj(String cnpj) {
        return jpa.existsByCnpj(cnpj);
    }

    @Override
    public List<Tenant> findAll() {
        return jpa.findAll().stream().map(TenantMapper::toDomain).toList();
    }
}
