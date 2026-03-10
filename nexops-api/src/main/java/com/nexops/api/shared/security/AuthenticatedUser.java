package com.nexops.api.shared.security;

import java.util.Set;
import java.util.UUID;

public record AuthenticatedUser(
    UUID userId,
    String email,
    String tenantSlug,
    String tenantSchema,
    Set<String> permissions
) {
    public boolean hasPermission(String permission) {
        return permissions.contains(permission);
    }

    public boolean hasAnyPermission(String... perms) {
        for (String p : perms) {
            if (permissions.contains(p)) return true;
        }
        return false;
    }
}
