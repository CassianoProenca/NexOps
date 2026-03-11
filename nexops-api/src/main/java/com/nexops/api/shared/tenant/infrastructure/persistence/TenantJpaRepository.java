package com.nexops.api.shared.tenant.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface TenantJpaRepository extends JpaRepository<TenantJpaEntity, UUID> {
    Optional<TenantJpaEntity> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByCnpj(String cnpj);
}
