package com.nexops.api.shared.tenant.domain.ports.in;

import com.nexops.api.shared.tenant.domain.model.TenantSettings;

public interface UpdateSmtpSettingsUseCase {
    TenantSettings updateSmtp(String host, Integer port, String user, String pass, String fromEmail, String fromName, Boolean useTls);
}
