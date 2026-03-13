package com.nexops.api.helpdesk.domain.ports.out;

import com.nexops.api.helpdesk.domain.model.TicketAttachment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketAttachmentRepository {
    TicketAttachment save(TicketAttachment attachment);
    List<TicketAttachment> findByTicketId(UUID ticketId);
    Optional<TicketAttachment> findById(UUID id);
}
