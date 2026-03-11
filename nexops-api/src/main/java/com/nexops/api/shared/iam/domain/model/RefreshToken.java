package com.nexops.api.shared.iam.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class RefreshToken {

    private UUID id;
    private UUID userId;
    private UUID tenantId;
    private String tokenHash;
    private OffsetDateTime expiresAt;
    private boolean revoked;
    private OffsetDateTime createdAt;

    public RefreshToken() {}

    public RefreshToken(UUID id, UUID userId, UUID tenantId, String tokenHash,
                        OffsetDateTime expiresAt, boolean revoked,
                        OffsetDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.tenantId = tenantId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.revoked = revoked;
        this.createdAt = createdAt;
    }

    public static RefreshToken create(UUID userId, String tokenHash, long expirationMs, UUID tenantId) {
        RefreshToken t = new RefreshToken();
        t.id = UUID.randomUUID();
        t.userId = userId;
        t.tenantId = tenantId;
        t.tokenHash = tokenHash;
        t.expiresAt = OffsetDateTime.now().plusNanos(expirationMs * 1_000_000L);
        t.revoked = false;
        t.createdAt = OffsetDateTime.now();
        return t;
    }

    public boolean isExpired() {
        return OffsetDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !revoked && !isExpired();
    }

    public void revoke() {
        this.revoked = true;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getTenantId() { return tenantId; }
    public String getTokenHash() { return tokenHash; }
    public OffsetDateTime getExpiresAt() { return expiresAt; }
    public boolean isRevoked() { return revoked; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
