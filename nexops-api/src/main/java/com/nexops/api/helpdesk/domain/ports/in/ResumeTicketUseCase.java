package com.nexops.api.helpdesk.domain.ports.in;

import com.nexops.api.helpdesk.domain.model.Ticket;
import java.util.UUID;

public interface ResumeTicketUseCase {
    Ticket resumeTicket(UUID ticketId);
}
