package com.nexops.api.shared.iam.infrastructure.persistence.mapper;

import com.nexops.api.shared.iam.domain.model.*;
import com.nexops.api.shared.iam.infrastructure.persistence.entity.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

public class IamMapper {

    public static Permission toDomain(PermissionJpaEntity e) {
        return new Permission(e.getId(), e.getCode(), e.getDescription(), e.getModule());
    }

    public static PermissionJpaEntity toEntity(Permission p) {
        return PermissionJpaEntity.builder()
                .id(p.getId()).code(p.getCode())
                .description(p.getDescription()).module(p.getModule())
                .build();
    }

    public static Role toDomain(RoleJpaEntity e) {
        var perms = e.getPermissions().stream()
                .map(IamMapper::toDomain)
                .collect(Collectors.toSet());
        return new Role(e.getId(), e.getName(), e.getDescription(),
                e.isSystem(), e.getCreatedAt(), perms);
    }

    public static User toDomain(UserJpaEntity e) {
        var roles = e.getRoles().stream()
                .map(IamMapper::toDomain)
                .collect(Collectors.toSet());
        Map<Permission, Boolean> overrides = new HashMap<>();
        e.getPermissionOverrides().forEach(p -> overrides.put(toDomain(p), true));
        return new User(e.getId(), e.getName(), e.getEmail(), e.getPasswordHash(),
                e.getStatus(), e.getCreatedAt(), e.getUpdatedAt(),
                e.getLastLoginAt(), roles, overrides);
    }

    public static UserJpaEntity toEntity(User u) {
        return UserJpaEntity.builder()
                .id(u.getId()).name(u.getName()).email(u.getEmail())
                .passwordHash(u.getPasswordHash()).status(u.getStatus())
                .createdAt(u.getCreatedAt()).updatedAt(u.getUpdatedAt())
                .lastLoginAt(u.getLastLoginAt())
                .build();
    }

    public static RefreshToken toDomain(RefreshTokenJpaEntity e) {
        return new RefreshToken(e.getId(), e.getUserId(), e.getTokenHash(),
                e.getExpiresAt(), e.isRevoked(), e.getCreatedAt());
    }

    public static RefreshTokenJpaEntity toEntity(RefreshToken t) {
        return RefreshTokenJpaEntity.builder()
                .id(t.getId()).userId(t.getUserId())
                .tokenHash(t.getTokenHash()).expiresAt(t.getExpiresAt())
                .revoked(t.isRevoked()).createdAt(t.getCreatedAt())
                .build();
    }
}
