package com.nexops.api.shared.iam.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record RoleRequest(
    @NotBlank String name,
    String description,
    List<String> permissions
) {}
