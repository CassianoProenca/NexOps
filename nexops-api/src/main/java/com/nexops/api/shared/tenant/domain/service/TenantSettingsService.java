package com.nexops.api.shared.tenant.domain.service;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.security.SecurityContext;
import com.nexops.api.shared.tenant.domain.model.Tenant;
import com.nexops.api.shared.tenant.domain.model.TenantSettings;
import com.nexops.api.shared.tenant.domain.ports.in.*;
import com.nexops.api.shared.tenant.domain.ports.out.TenantRepository;
import com.nexops.api.shared.tenant.domain.ports.out.TenantSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TenantSettingsService implements GetTenantSettingsUseCase, UpdateTenantSettingsUseCase, UpdateSmtpSettingsUseCase, UpdateAiSettingsUseCase, GetExtraSettingsUseCase {

    private final TenantRepository tenantRepository;
    private final TenantSettingsRepository settingsRepository;

    @Override
    public Tenant get() {
        var caller = SecurityContext.get();
        if (caller == null) throw new BusinessException("Não autenticado");

        return tenantRepository.findById(caller.tenantId())
                .orElseThrow(() -> new BusinessException("Tenant não encontrado"));
    }

    @Override
    public TenantSettings getExtra() {
        var caller = SecurityContext.get();
        if (caller == null) throw new BusinessException("Não autenticado");

        return settingsRepository.findByTenantId(caller.tenantId())
                .orElseGet(() -> createDefaultSettings(caller.tenantId()));
    }

    @Override
    @Transactional
    public Tenant update(String nomeFantasia) {
        var caller = SecurityContext.get();
        if (caller == null) throw new BusinessException("Não autenticado");

        if (!caller.hasPermission("SETTINGS_EDIT")) {
            throw new BusinessException("Sem permissão para alterar configurações");
        }

        Tenant tenant = tenantRepository.findById(caller.tenantId())
                .orElseThrow(() -> new BusinessException("Tenant não encontrado"));

        tenant.update(nomeFantasia);
        return tenantRepository.save(tenant);
    }

    @Override
    @Transactional
    public TenantSettings updateSmtp(String host, Integer port, String user, String pass, String fromEmail, String fromName, Boolean useTls) {
        var caller = SecurityContext.get();
        if (caller == null) throw new BusinessException("Não autenticado");

        if (!caller.hasPermission("SETTINGS_EDIT")) {
            throw new BusinessException("Sem permissão para alterar configurações de e-mail");
        }

        TenantSettings settings = settingsRepository.findByTenantId(caller.tenantId())
                .orElseGet(() -> createDefaultSettings(caller.tenantId()));

        settings.updateSmtp(host, port, user, pass, fromEmail, fromName, useTls);
        return settingsRepository.save(settings);
    }

    @Override
    @Transactional
    public TenantSettings updateAi(String provider, String apiKey, String model, Boolean enabled) {
        var caller = SecurityContext.get();
        if (caller == null) throw new BusinessException("Não autenticado");

        if (!caller.hasPermission("AI_CONFIG")) {
            throw new BusinessException("Sem permissão para alterar configurações de IA");
        }

        TenantSettings settings = settingsRepository.findByTenantId(caller.tenantId())
                .orElseGet(() -> createDefaultSettings(caller.tenantId()));

        settings.updateAi(provider, apiKey, model, enabled);
        return settingsRepository.save(settings);
    }

    private TenantSettings createDefaultSettings(UUID tenantId) {
        return TenantSettings.builder()
                .tenantId(tenantId)
                .smtpUseTls(true)
                .aiEnabled(false)
                .updatedAt(OffsetDateTime.now())
                .build();
    }
}
