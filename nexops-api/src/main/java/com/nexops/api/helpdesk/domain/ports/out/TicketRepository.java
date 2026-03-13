package com.nexops.api.helpdesk.domain.ports.out;

import com.nexops.api.helpdesk.domain.model.Ticket;
import com.nexops.api.helpdesk.domain.model.TicketStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketRepository {
    Ticket save(Ticket ticket);
    Optional<Ticket> findById(UUID id);
    List<Ticket> findByStatus(UUID tenantId, TicketStatus status);
    List<Ticket> findByAssigneeId(UUID tenantId, UUID assigneeId);
    List<Ticket> findByRequesterId(UUID tenantId, UUID requesterId);
    List<Ticket> findByProblemTypeIdAndStatus(UUID tenantId, UUID problemTypeId, TicketStatus status);
    List<Ticket> findOpenByProblemTypeOrderByPriorityAndAge(UUID tenantId, UUID problemTypeId);
    List<Ticket> findAll();
    List<Ticket> findChildTickets(UUID parentTicketId);
}
