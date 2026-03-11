package com.nexops.api.shared.tenant.infrastructure.persistence;

import com.nexops.api.shared.tenant.domain.model.TenantSettings;
import com.nexops.api.shared.tenant.domain.ports.out.TenantSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TenantSettingsRepositoryAdapter implements TenantSettingsRepository {

    private final TenantSettingsJpaRepository jpa;

    @Override
    public Optional<TenantSettings> findByTenantId(UUID tenantId) {
        return jpa.findById(tenantId).map(this::toDomain);
    }

    @Override
    public TenantSettings save(TenantSettings settings) {
        var entity = toEntity(settings);
        return toDomain(jpa.save(entity));
    }

    private TenantSettings toDomain(TenantSettingsJpaEntity e) {
        return TenantSettings.builder()
                .tenantId(e.getTenantId())
                .smtpHost(e.getSmtpHost())
                .smtpPort(e.getSmtpPort())
                .smtpUsername(e.getSmtpUsername())
                .smtpPassword(e.getSmtpPassword())
                .smtpFromEmail(e.getSmtpFromEmail())
                .smtpFromName(e.getSmtpFromName())
                .smtpUseTls(e.getSmtpUseTls())
                .aiProvider(e.getAiProvider())
                .aiApiKey(e.getAiApiKey())
                .aiModel(e.getAiModel())
                .aiEnabled(e.getAiEnabled())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private TenantSettingsJpaEntity toEntity(TenantSettings d) {
        return TenantSettingsJpaEntity.builder()
                .tenantId(d.getTenantId())
                .smtpHost(d.getSmtpHost())
                .smtpPort(d.getSmtpPort())
                .smtpUsername(d.getSmtpUsername())
                .smtpPassword(d.getSmtpPassword())
                .smtpFromEmail(d.getSmtpFromEmail())
                .smtpFromName(d.getSmtpFromName())
                .smtpUseTls(d.getSmtpUseTls())
                .aiProvider(d.getAiProvider())
                .aiApiKey(d.getAiApiKey())
                .aiModel(d.getAiModel())
                .aiEnabled(d.getAiEnabled())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
