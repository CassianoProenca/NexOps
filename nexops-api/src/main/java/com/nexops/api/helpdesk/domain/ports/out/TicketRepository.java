package com.nexops.api.helpdesk.domain.ports.out;

import com.nexops.api.helpdesk.domain.model.Ticket;
import com.nexops.api.helpdesk.domain.model.TicketStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketRepository {
    Ticket save(Ticket ticket);
    Optional<Ticket> findById(UUID id);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByAssigneeId(UUID assigneeId);
    List<Ticket> findByRequesterId(UUID requesterId);
    List<Ticket> findByProblemTypeIdAndStatus(UUID problemTypeId, TicketStatus status);
    List<Ticket> findOpenByProblemTypeOrderByPriorityAndAge(UUID problemTypeId);
    List<Ticket> findAll();
    List<Ticket> findChildTickets(UUID parentTicketId);
}
