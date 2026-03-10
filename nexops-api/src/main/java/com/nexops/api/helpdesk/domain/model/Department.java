package com.nexops.api.helpdesk.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class Department {
    private final UUID id;
    private final String name;
    private final String description;
    private boolean active;
    private final OffsetDateTime createdAt;

    public Department(UUID id, String name, String description, boolean active, OffsetDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.active = active;
        this.createdAt = createdAt;
    }

    public static Department create(String name, String description) {
        return new Department(
            UUID.randomUUID(),
            name,
            description,
            true,
            OffsetDateTime.now()
        );
    }

    public void deactivate() {
        this.active = false;
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public boolean isActive() { return active; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
