package com.nexops.api.shared.tenant.domain.ports.in;


public interface TestSmtpConnectionUseCase {
    void test(String host, Integer port, String user, String pass, Boolean useTls);
}
