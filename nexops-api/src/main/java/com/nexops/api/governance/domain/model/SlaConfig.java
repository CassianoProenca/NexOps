package com.nexops.api.governance.domain.model;

import com.nexops.api.helpdesk.domain.model.SlaLevel;
import java.time.OffsetDateTime;
import java.util.UUID;

public class SlaConfig {
    private final UUID id;
    private final UUID problemTypeId;
    private final SlaLevel slaLevel;
    private int responseMinutes;
    private int resolutionMinutes;
    private int notifyManagerAtPercent;
    private boolean active;
    private final OffsetDateTime createdAt;

    public SlaConfig(UUID id, UUID problemTypeId, SlaLevel slaLevel, int responseMinutes, int resolutionMinutes, int notifyManagerAtPercent, boolean active, OffsetDateTime createdAt) {
        this.id = id;
        this.problemTypeId = problemTypeId;
        this.slaLevel = slaLevel;
        this.responseMinutes = responseMinutes;
        this.resolutionMinutes = resolutionMinutes;
        this.notifyManagerAtPercent = notifyManagerAtPercent;
        this.active = active;
        this.createdAt = createdAt;
    }

    public static SlaConfig create(UUID problemTypeId, SlaLevel slaLevel, int responseMinutes, int resolutionMinutes, int notifyManagerAtPercent) {
        return new SlaConfig(UUID.randomUUID(), problemTypeId, slaLevel, responseMinutes, resolutionMinutes, notifyManagerAtPercent, true, OffsetDateTime.now());
    }

    public void update(int responseMinutes, int resolutionMinutes, int notifyManagerAtPercent) {
        this.responseMinutes = responseMinutes;
        this.resolutionMinutes = resolutionMinutes;
        this.notifyManagerAtPercent = notifyManagerAtPercent;
    }

    public void deactivate() { this.active = false; }

    public UUID getId() { return id; }
    public UUID getProblemTypeId() { return problemTypeId; }
    public SlaLevel getSlaLevel() { return slaLevel; }
    public int getResponseMinutes() { return responseMinutes; }
    public int getResolutionMinutes() { return resolutionMinutes; }
    public int getNotifyManagerAtPercent() { return notifyManagerAtPercent; }
    public boolean isActive() { return active; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
