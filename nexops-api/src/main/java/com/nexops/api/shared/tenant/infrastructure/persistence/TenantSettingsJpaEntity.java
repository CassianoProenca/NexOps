package com.nexops.api.shared.tenant.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenant_settings")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TenantSettingsJpaEntity {
    @Id
    @Column(name = "tenant_id")
    private UUID tenantId;

    @Column(name = "smtp_host")
    private String smtpHost;

    @Column(name = "smtp_port")
    private Integer smtpPort;

    @Column(name = "smtp_username")
    private String smtpUsername;

    @Column(name = "smtp_password")
    private String smtpPassword;

    @Column(name = "smtp_from_email")
    private String smtpFromEmail;

    @Column(name = "smtp_from_name")
    private String smtpFromName;

    @Column(name = "smtp_use_tls")
    private Boolean smtpUseTls;

    @Column(name = "ai_provider")
    private String aiProvider;

    @Column(name = "ai_api_key")
    private String aiApiKey;

    @Column(name = "ai_model")
    private String aiModel;

    @Column(name = "ai_enabled")
    private Boolean aiEnabled;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
