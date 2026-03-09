package com.nexops.api.shared.security.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import lombok.Getter;
import lombok.Setter;

@Component
@ConfigurationProperties(prefix = "nexops.jwt")
@Getter @Setter
public class JwtProperties {
    private String secret;
    private long expirationMs = 900_000L;          // 15 minutos
    private long refreshExpirationMs = 604_800_000L; // 7 dias
}
