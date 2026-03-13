package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.domain.model.TicketAttachment;
import com.nexops.api.helpdesk.domain.ports.out.TicketAttachmentRepository;
import com.nexops.api.helpdesk.infrastructure.persistence.entity.TicketAttachmentJpaEntity;
import com.nexops.api.shared.security.SecurityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TicketAttachmentRepositoryAdapter implements TicketAttachmentRepository {

    private final TicketAttachmentJpaRepository jpaRepository;

    @Override
    public TicketAttachment save(TicketAttachment attachment) {
        var caller = SecurityContext.get();
        UUID tenantId = caller != null ? caller.tenantId() : null;

        var entity = TicketAttachmentJpaEntity.builder()
                .id(attachment.getId())
                .ticketId(attachment.getTicketId())
                .tenantId(tenantId)
                .uploaderId(attachment.getUploaderId())
                .filename(attachment.getFilename())
                .storageKey(attachment.getStorageKey())
                .sizeBytes(attachment.getSizeBytes())
                .contentType(attachment.getContentType())
                .createdAt(attachment.getCreatedAt())
                .build();
        return toDomain(jpaRepository.save(entity));
    }

    @Override
    public List<TicketAttachment> findByTicketId(UUID ticketId) {
        return jpaRepository.findByTicketId(ticketId).stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<TicketAttachment> findById(UUID id) {
        return jpaRepository.findById(id).map(this::toDomain);
    }

    private TicketAttachment toDomain(TicketAttachmentJpaEntity e) {
        return new TicketAttachment(
                e.getId(), e.getTicketId(), e.getUploaderId(),
                e.getFilename(), e.getStorageKey(),
                e.getSizeBytes(), e.getContentType(), e.getCreatedAt()
        );
    }
}
