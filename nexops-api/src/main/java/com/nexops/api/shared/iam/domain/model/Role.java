package com.nexops.api.shared.iam.domain.model;

import java.time.OffsetDateTime;
import java.util.*;

public class Role {

    private UUID id;
    private UUID tenantId;
    private String name;
    private String description;
    private boolean systemRole;
    private OffsetDateTime createdAt;
    private Set<Permission> permissions;

    public Role() {
        this.permissions = new HashSet<>();
    }

    public Role(UUID id, UUID tenantId, String name, String description, boolean systemRole,
                OffsetDateTime createdAt, Set<Permission> permissions) {
        this.id = id;
        this.tenantId = tenantId;
        this.name = name;
        this.description = description;
        this.systemRole = systemRole;
        this.createdAt = createdAt;
        this.permissions = permissions != null ? permissions : new HashSet<>();
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public boolean isSystem() { return systemRole; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public Set<Permission> getPermissions() { return Collections.unmodifiableSet(permissions); }
}
