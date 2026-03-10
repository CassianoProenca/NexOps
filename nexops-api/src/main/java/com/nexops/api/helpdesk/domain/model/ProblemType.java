package com.nexops.api.helpdesk.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class ProblemType {
    private final UUID id;
    private final String name;
    private final String description;
    private final SlaLevel slaLevel;
    private boolean active;
    private final OffsetDateTime createdAt;

    public ProblemType(UUID id, String name, String description, SlaLevel slaLevel, boolean active, OffsetDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.slaLevel = slaLevel;
        this.active = active;
        this.createdAt = createdAt;
    }

    public static ProblemType create(String name, String description, SlaLevel slaLevel) {
        return new ProblemType(
            UUID.randomUUID(),
            name,
            description,
            slaLevel,
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
    public SlaLevel getSlaLevel() { return slaLevel; }
    public boolean isActive() { return active; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
