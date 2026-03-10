package com.nexops.api.helpdesk.domain.ports.in;

import com.nexops.api.helpdesk.domain.model.Ticket;
import java.util.UUID;

public interface AssignTicketUseCase {
    Ticket assignTicket(UUID ticketId, UUID technicianId);
}
