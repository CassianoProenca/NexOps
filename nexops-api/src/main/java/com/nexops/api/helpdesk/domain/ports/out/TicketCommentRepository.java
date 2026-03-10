package com.nexops.api.helpdesk.domain.ports.out;

import com.nexops.api.helpdesk.domain.model.TicketComment;

import java.util.List;
import java.util.UUID;

public interface TicketCommentRepository {
    TicketComment save(TicketComment comment);
    List<TicketComment> findByTicketId(UUID ticketId);
}
