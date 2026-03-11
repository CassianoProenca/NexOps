package com.nexops.api.shared.iam.domain.model;

import java.time.Instant;
import java.util.UUID;

public class InviteToken {

    private UUID id;
    private UUID tenantId;
    private String email;
    private String tokenHash;
    private Instant expiresAt;
    private Instant usedAt;
    private UUID createdBy;
    private Instant createdAt;

    public InviteToken() {}

    public boolean isExpired() { return Instant.now().isAfter(expiresAt); }
    public boolean isUsed() { return usedAt != null; }
    public boolean isValid() { return !isExpired() && !isUsed(); }
    public void markUsed() { this.usedAt = Instant.now(); }

    public static InviteToken create(UUID tenantId, String email, String tokenHash, UUID createdBy, long expirationMs) {
        InviteToken t = new InviteToken();
        t.id = UUID.randomUUID();
        t.tenantId = tenantId;
        t.email = email;
        t.tokenHash = tokenHash;
        t.expiresAt = Instant.now().plusMillis(expirationMs);
        t.createdBy = createdBy;
        t.createdAt = Instant.now();
        return t;
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public String getEmail() { return email; }
    public String getTokenHash() { return tokenHash; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getUsedAt() { return usedAt; }
    public UUID getCreatedBy() { return createdBy; }
    public Instant getCreatedAt() { return createdAt; }

    // For mapper reconstruction
    public void setId(UUID id) { this.id = id; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }
    public void setEmail(String email) { this.email = email; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public void setUsedAt(Instant usedAt) { this.usedAt = usedAt; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
