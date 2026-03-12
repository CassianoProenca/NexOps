package com.nexops.api.governance.domain.model;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;

public class SlaBreachEvent {
    private final UUID id;
    private final UUID ticketId;
    private final BreachType breachType;
    private final OffsetDateTime breachedAt;
    private final OffsetDateTime slaDeadline;
    private final int minutesOverdue;
    private final OffsetDateTime createdAt;

    public enum BreachType { RESPONSE_BREACH, RESOLUTION_BREACH, SLA_WARNING }

    public SlaBreachEvent(UUID id, UUID ticketId, BreachType breachType, OffsetDateTime breachedAt, OffsetDateTime slaDeadline, int minutesOverdue, OffsetDateTime createdAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.breachType = breachType;
        this.breachedAt = breachedAt;
        this.slaDeadline = slaDeadline;
        this.minutesOverdue = minutesOverdue;
        this.createdAt = createdAt;
    }

    public static SlaBreachEvent record(UUID ticketId, BreachType type, OffsetDateTime deadline) {
        OffsetDateTime now = OffsetDateTime.now();
        int overdue = (int) Duration.between(deadline, now).toMinutes();
        return new SlaBreachEvent(UUID.randomUUID(), ticketId, type, now, deadline, overdue, now);
    }

    public UUID getId() { return id; }
    public UUID getTicketId() { return ticketId; }
    public BreachType getBreachType() { return breachType; }
    public OffsetDateTime getBreachedAt() { return breachedAt; }
    public OffsetDateTime getSlaDeadline() { return slaDeadline; }
    public int getMinutesOverdue() { return minutesOverdue; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
