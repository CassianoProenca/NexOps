package com.nexops.api.shared.tenant.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TenantSettingsJpaRepository extends JpaRepository<TenantSettingsJpaEntity, UUID> {
}
