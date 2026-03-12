package com.nexops.api.shared.tenant.domain.ports.in;

import java.util.UUID;

public interface TestSmtpConnectionUseCase {
    void test(UUID tenantId);
}
