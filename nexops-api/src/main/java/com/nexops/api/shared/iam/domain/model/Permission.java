package com.nexops.api.shared.iam.domain.model;

import java.util.UUID;

public class Permission {

    private UUID id;
    private String code;
    private String description;
    private String module;

    public Permission() {}

    public Permission(UUID id, String code, String description, String module) {
        this.id = id;
        this.code = code;
        this.description = description;
        this.module = module;
    }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public String getDescription() { return description; }
    public String getModule() { return module; }
}
