package com.nexops.api.shared.tenant.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class Tenant {

    private UUID id;
    private String name;
    private String slug;
    private String schemaName;
    private TenantStatus status;
    private String plan;
    private Integer maxUsers;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public Tenant() {}

    public Tenant(UUID id, String name, String slug, String schemaName,
                  TenantStatus status, String plan, Integer maxUsers,
                  OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.schemaName = schemaName;
        this.status = status;
        this.plan = plan;
        this.maxUsers = maxUsers;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Tenant create(String name, String slug, String plan, Integer maxUsers) {
        Tenant t = new Tenant();
        t.id = UUID.randomUUID();
        t.name = name;
        t.slug = slug;
        t.schemaName = "tenant_" + slug.replace("-", "_");
        t.status = TenantStatus.ACTIVE;
        t.plan = plan;
        t.maxUsers = maxUsers;
        t.createdAt = OffsetDateTime.now();
        t.updatedAt = OffsetDateTime.now();
        return t;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getSlug() { return slug; }
    public String getSchemaName() { return schemaName; }
    public TenantStatus getStatus() { return status; }
    public String getPlan() { return plan; }
    public Integer getMaxUsers() { return maxUsers; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public void suspend() {
        this.status = TenantStatus.SUSPENDED;
        this.updatedAt = OffsetDateTime.now();
    }

    public void activate() {
        this.status = TenantStatus.ACTIVE;
        this.updatedAt = OffsetDateTime.now();
    }
}
