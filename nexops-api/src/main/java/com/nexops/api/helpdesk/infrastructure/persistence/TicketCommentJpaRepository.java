package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.infrastructure.persistence.entity.TicketCommentJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TicketCommentJpaRepository extends JpaRepository<TicketCommentJpaEntity, UUID> {
    List<TicketCommentJpaEntity> findByTicketIdOrderByCreatedAtAsc(UUID ticketId);
}
