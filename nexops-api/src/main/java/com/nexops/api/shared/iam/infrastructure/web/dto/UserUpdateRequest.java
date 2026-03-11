package com.nexops.api.shared.iam.infrastructure.web.dto;

import java.util.List;
import java.util.UUID;

public record UserUpdateRequest(
    UUID roleId,
    List<String> permissions
) {}
