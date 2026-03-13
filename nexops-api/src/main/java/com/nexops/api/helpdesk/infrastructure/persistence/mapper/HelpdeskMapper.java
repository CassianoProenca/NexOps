package com.nexops.api.helpdesk.infrastructure.persistence.mapper;

import com.nexops.api.helpdesk.domain.model.*;
import com.nexops.api.helpdesk.infrastructure.persistence.entity.*;

public class HelpdeskMapper {

    public static Department toDomain(DepartmentJpaEntity e) {
        return new Department(e.getId(), e.getTenantId(), e.getName(), e.getDescription(), e.isActive(), e.getCreatedAt());
    }

    public static DepartmentJpaEntity toEntity(Department d) {
        return DepartmentJpaEntity.builder()
                .id(d.getId()).tenantId(d.getTenantId()).name(d.getName())
                .description(d.getDescription()).active(d.isActive())
                .createdAt(d.getCreatedAt()).build();
    }

    public static ProblemType toDomain(ProblemTypeJpaEntity e) {
        return new ProblemType(e.getId(), e.getTenantId(), e.getName(), e.getDescription(), e.getSlaLevel(), e.isActive(), e.getCreatedAt());
    }

    public static ProblemTypeJpaEntity toEntity(ProblemType p) {
        return ProblemTypeJpaEntity.builder()
                .id(p.getId()).tenantId(p.getTenantId()).name(p.getName())
                .description(p.getDescription()).slaLevel(p.getSlaLevel())
                .active(p.isActive()).createdAt(p.getCreatedAt()).build();
    }

    public static Ticket toDomain(TicketJpaEntity e) {
        return new Ticket(
                e.getId(), e.getTenantId(), e.getTitle(), e.getDescription(), e.getStatus(),
                e.getInternalPriority(), e.getSlaLevel(), e.getDepartmentId(),
                e.getProblemTypeId(), e.getRequesterId(), e.getAssigneeId(),
                e.getParentTicketId(), e.getPauseReason(), e.getOpenedAt(),
                e.getAssignedAt(), e.getPausedAt(), e.getClosedAt(),
                e.getSlaDeadline(), e.getCreatedAt(), e.getUpdatedAt()
        );
    }

    public static TicketJpaEntity toEntity(Ticket t) {
        return TicketJpaEntity.builder()
                .id(t.getId()).tenantId(t.getTenantId()).title(t.getTitle()).description(t.getDescription())
                .status(t.getStatus()).internalPriority(t.getInternalPriority())
                .slaLevel(t.getSlaLevel()).departmentId(t.getDepartmentId())
                .problemTypeId(t.getProblemTypeId()).requesterId(t.getRequesterId())
                .assigneeId(t.getAssigneeId()).parentTicketId(t.getParentTicketId())
                .pauseReason(t.getPauseReason()).openedAt(t.getOpenedAt())
                .assignedAt(t.getAssignedAt()).pausedAt(t.getPausedAt())
                .closedAt(t.getClosedAt()).slaDeadline(t.getSlaDeadline())
                .createdAt(t.getCreatedAt()).updatedAt(t.getUpdatedAt())
                .build();
    }

    public static TicketComment toDomain(TicketCommentJpaEntity e) {
        return new TicketComment(e.getId(), e.getTicketId(), e.getAuthorId(), e.getContent(), e.getType(), e.getCreatedAt());
    }

    public static TicketCommentJpaEntity toEntity(TicketComment c) {
        return TicketCommentJpaEntity.builder()
                .id(c.getId()).ticketId(c.getTicketId()).authorId(c.getAuthorId())
                .content(c.getContent()).type(c.getType())
                .createdAt(c.getCreatedAt()).build();
    }

    public static TicketAttachment toDomain(TicketAttachmentJpaEntity e) {
        return new TicketAttachment(e.getId(), e.getTicketId(), e.getUploaderId(), e.getFilename(), e.getStorageKey(), e.getSizeBytes(), e.getContentType(), e.getCreatedAt());
    }

    public static TicketAttachmentJpaEntity toEntity(TicketAttachment a) {
        return TicketAttachmentJpaEntity.builder()
                .id(a.getId()).ticketId(a.getTicketId()).uploaderId(a.getUploaderId())
                .filename(a.getFilename()).storageKey(a.getStorageKey())
                .sizeBytes(a.getSizeBytes()).contentType(a.getContentType())
                .createdAt(a.getCreatedAt()).build();
    }
}
