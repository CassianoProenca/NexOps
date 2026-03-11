package com.nexops.api.shared.tenant.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class TenantSettings {
    private final UUID tenantId;

    // SMTP
    private String smtpHost;
    private Integer smtpPort;
    private String smtpUsername;
    private String smtpPassword;
    private String smtpFromEmail;
    private String smtpFromName;
    private Boolean smtpUseTls;

    // AI
    private String aiProvider;
    private String aiApiKey;
    private String aiModel;
    private Boolean aiEnabled;

    private OffsetDateTime updatedAt;

    public void updateSmtp(String host, Integer port, String user, String pass, String fromEmail, String fromName, Boolean useTls) {
        this.smtpHost = host;
        this.smtpPort = port;
        this.smtpUsername = user;
        this.smtpPassword = pass;
        this.smtpFromEmail = fromEmail;
        this.smtpFromName = fromName;
        this.smtpUseTls = useTls;
        this.updatedAt = OffsetDateTime.now();
    }

    public void updateAi(String provider, String apiKey, String model, Boolean enabled) {
        this.aiProvider = provider;
        this.aiApiKey = apiKey;
        this.aiModel = model;
        this.aiEnabled = enabled;
        this.updatedAt = OffsetDateTime.now();
    }
}
