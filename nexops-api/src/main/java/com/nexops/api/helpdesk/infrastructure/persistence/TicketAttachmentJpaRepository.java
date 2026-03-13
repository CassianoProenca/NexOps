package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.infrastructure.persistence.entity.TicketAttachmentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TicketAttachmentJpaRepository extends JpaRepository<TicketAttachmentJpaEntity, UUID> {
    List<TicketAttachmentJpaEntity> findByTicketId(UUID ticketId);
}
