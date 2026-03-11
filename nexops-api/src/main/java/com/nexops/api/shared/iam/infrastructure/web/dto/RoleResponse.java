package com.nexops.api.shared.iam.infrastructure.web.dto;

import java.util.List;
import java.util.UUID;

public record RoleResponse(
    UUID id,
    String name,
    String description,
    boolean builtIn,
    int userCount,
    List<String> permissions
) {}
