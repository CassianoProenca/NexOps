package com.nexops.api.helpdesk.domain.model;

import com.nexops.api.shared.exception.BusinessException;
import java.time.OffsetDateTime;
import java.util.UUID;

public class Ticket {
    private final UUID id;
    private final UUID tenantId;
    private final String title;
    private final String description;
    private TicketStatus status;
    private TicketPriority internalPriority;
    private final SlaLevel slaLevel;
    private final UUID departmentId;
    private final UUID problemTypeId;
    private final UUID requesterId;
    private UUID assigneeId;
    private final UUID parentTicketId;
    private String pauseReason;
    private final OffsetDateTime openedAt;
    private OffsetDateTime assignedAt;
    private OffsetDateTime pausedAt;
    private OffsetDateTime closedAt;
    private OffsetDateTime slaDeadline;
    private final OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public Ticket(UUID id, UUID tenantId, String title, String description, TicketStatus status, TicketPriority internalPriority, SlaLevel slaLevel, UUID departmentId, UUID problemTypeId, UUID requesterId, UUID assigneeId, UUID parentTicketId, String pauseReason, OffsetDateTime openedAt, OffsetDateTime assignedAt, OffsetDateTime pausedAt, OffsetDateTime closedAt, OffsetDateTime slaDeadline, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.tenantId = tenantId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.internalPriority = internalPriority;
        this.slaLevel = slaLevel;
        this.departmentId = departmentId;
        this.problemTypeId = problemTypeId;
        this.requesterId = requesterId;
        this.assigneeId = assigneeId;
        this.parentTicketId = parentTicketId;
        this.pauseReason = pauseReason;
        this.openedAt = openedAt;
        this.assignedAt = assignedAt;
        this.pausedAt = pausedAt;
        this.closedAt = closedAt;
        this.slaDeadline = slaDeadline;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Ticket open(String title, String description, UUID departmentId, UUID problemTypeId, UUID requesterId, SlaLevel slaLevel, UUID tenantId) {
        OffsetDateTime now = OffsetDateTime.now();
        return new Ticket(
            UUID.randomUUID(),
            tenantId,
            title,
            description,
            TicketStatus.OPEN,
            TicketPriority.MEDIUM,
            slaLevel,
            departmentId,
            problemTypeId,
            requesterId,
            null,
            null,
            null,
            now,
            null,
            null,
            null,
            null,
            now,
            now
        );
    }

    public static Ticket child(UUID parentTicketId, String title, String description, UUID departmentId, UUID problemTypeId, UUID requesterId, SlaLevel slaLevel, UUID tenantId) {
        OffsetDateTime now = OffsetDateTime.now();
        return new Ticket(
            UUID.randomUUID(),
            tenantId,
            title,
            description,
            TicketStatus.OPEN,
            TicketPriority.MEDIUM,
            slaLevel,
            departmentId,
            problemTypeId,
            requesterId,
            null,
            parentTicketId,
            null,
            now,
            null,
            null,
            null,
            null,
            now,
            now
        );
    }

    public void assignTo(UUID technicianId) {
        if (this.status != TicketStatus.OPEN && this.status != TicketStatus.PAUSED) {
            throw new BusinessException("Ticket can only be assigned if it is OPEN or PAUSED. Current status: " + this.status);
        }
        this.assigneeId = technicianId;
        this.status = TicketStatus.IN_PROGRESS;
        this.assignedAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    public void pause(String reason) {
        if (this.status != TicketStatus.IN_PROGRESS) {
            throw new BusinessException("Ticket can only be paused if it is IN_PROGRESS. Current status: " + this.status);
        }
        this.status = TicketStatus.PAUSED;
        this.pauseReason = reason;
        this.pausedAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    public void resume() {
        if (this.status != TicketStatus.PAUSED) {
            throw new BusinessException("Ticket can only be resumed if it is PAUSED. Current status: " + this.status);
        }
        this.status = TicketStatus.IN_PROGRESS;
        this.pauseReason = null;
        this.pausedAt = null;
        this.updatedAt = OffsetDateTime.now();
    }

    public void close() {
        if (this.status != TicketStatus.IN_PROGRESS) {
            throw new BusinessException("Ticket can only be closed if it is IN_PROGRESS. Current status: " + this.status);
        }
        this.status = TicketStatus.CLOSED;
        this.closedAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    public void setSlaDeadline(OffsetDateTime deadline) {
        this.slaDeadline = deadline;
        this.updatedAt = OffsetDateTime.now();
    }

    public boolean isSlaBreached() {
        return slaDeadline != null
            && OffsetDateTime.now().isAfter(slaDeadline)
            && status != TicketStatus.CLOSED;
    }

    public boolean isChildTicket() {
        return parentTicketId != null;
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public TicketStatus getStatus() { return status; }
    public TicketPriority getInternalPriority() { return internalPriority; }
    public SlaLevel getSlaLevel() { return slaLevel; }
    public UUID getDepartmentId() { return departmentId; }
    public UUID getProblemTypeId() { return problemTypeId; }
    public UUID getRequesterId() { return requesterId; }
    public UUID getAssigneeId() { return assigneeId; }
    public UUID getParentTicketId() { return parentTicketId; }
    public String getPauseReason() { return pauseReason; }
    public OffsetDateTime getOpenedAt() { return openedAt; }
    public OffsetDateTime getAssignedAt() { return assignedAt; }
    public OffsetDateTime getPausedAt() { return pausedAt; }
    public OffsetDateTime getClosedAt() { return closedAt; }
    public OffsetDateTime getSlaDeadline() { return slaDeadline; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
