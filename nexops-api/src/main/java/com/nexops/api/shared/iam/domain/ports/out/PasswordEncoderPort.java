package com.nexops.api.shared.iam.domain.ports.out;

public interface PasswordEncoderPort {
    String encode(String raw);
    boolean matches(String raw, String encoded);
}
