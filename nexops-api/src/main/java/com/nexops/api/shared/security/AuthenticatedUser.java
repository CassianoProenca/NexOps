package com.nexops.api.shared.security;

import java.util.Arrays;
import java.util.Set;
import java.util.UUID;

public record AuthenticatedUser(
    UUID userId,
    String nome,
    String email,
    UUID tenantId,
    Set<String> permissions
) {
    public boolean hasPermission(String permission) {
        return permissions.contains(permission);
    }

    public boolean hasAnyPermission(String... perms) {
        return Arrays.stream(perms).anyMatch(permissions::contains);
    }
}
