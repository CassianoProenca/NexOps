package com.nexops.api.shared.tenant.domain.ports.in;

import java.util.UUID;

public interface SendEmailUseCase {
    void send(UUID tenantId, String to, String subject, String htmlBody);
}
