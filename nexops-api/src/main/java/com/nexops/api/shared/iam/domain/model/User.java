package com.nexops.api.shared.iam.domain.model;

import java.time.OffsetDateTime;
import java.util.*;

public class User {

    private UUID id;
    private UUID tenantId;
    private String name;
    private String email;
    private String passwordHash;
    private UserStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime lastLoginAt;
    private Set<Role> roles;
    private Map<Permission, Boolean> permissionOverrides;

    public User() {
        this.roles = new HashSet<>();
        this.permissionOverrides = new HashMap<>();
    }

    public User(UUID id, UUID tenantId, String name, String email, String passwordHash,
                UserStatus status, OffsetDateTime createdAt, OffsetDateTime updatedAt,
                OffsetDateTime lastLoginAt, Set<Role> roles,
                Map<Permission, Boolean> permissionOverrides) {
        this.id = id;
        this.tenantId = tenantId;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLoginAt = lastLoginAt;
        this.roles = roles != null ? roles : new HashSet<>();
        this.permissionOverrides = permissionOverrides != null ? permissionOverrides : new HashMap<>();
    }

    public static User create(String name, String email, String passwordHash, UUID tenantId) {
        User u = new User();
        u.id = UUID.randomUUID();
        u.tenantId = tenantId;
        u.name = name;
        u.email = email;
        u.passwordHash = passwordHash;
        u.status = UserStatus.ACTIVE;
        u.createdAt = OffsetDateTime.now();
        u.updatedAt = OffsetDateTime.now();
        return u;
    }

    public Set<String> resolvedPermissions() {
        Set<String> perms = new HashSet<>();
        roles.forEach(r -> r.getPermissions().forEach(p -> perms.add(p.getCode())));
        permissionOverrides.forEach((permission, granted) -> {
            if (granted) perms.add(permission.getCode());
            else perms.remove(permission.getCode());
        });
        return Collections.unmodifiableSet(perms);
    }

    public void activate() {
        this.status = UserStatus.ACTIVE;
        this.updatedAt = OffsetDateTime.now();
    }

    public void recordLogin() {
        this.lastLoginAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public UserStatus getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public OffsetDateTime getLastLoginAt() { return lastLoginAt; }
    public Set<Role> getRoles() { return Collections.unmodifiableSet(roles); }
    public Map<Permission, Boolean> getPermissionOverrides() { return Collections.unmodifiableMap(permissionOverrides); }
}
