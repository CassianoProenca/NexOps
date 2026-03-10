package com.nexops.api.shared.iam.domain.model;

import java.time.OffsetDateTime;
import java.util.*;

public class Role {

    private UUID id;
    private String name;
    private String description;
    private boolean system;
    private OffsetDateTime createdAt;
    private Set<Permission> permissions;

    public Role() {
        this.permissions = new HashSet<>();
    }

    public Role(UUID id, String name, String description, boolean system,
                OffsetDateTime createdAt, Set<Permission> permissions) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.system = system;
        this.createdAt = createdAt;
        this.permissions = permissions != null ? permissions : new HashSet<>();
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public boolean isSystem() { return system; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public Set<Permission> getPermissions() { return Collections.unmodifiableSet(permissions); }
}
