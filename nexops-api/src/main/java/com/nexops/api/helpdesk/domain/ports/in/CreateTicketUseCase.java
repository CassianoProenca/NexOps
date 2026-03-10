package com.nexops.api.helpdesk.domain.ports.in;

import com.nexops.api.helpdesk.domain.model.Ticket;
import java.util.UUID;

public interface CreateTicketUseCase {
    Ticket createTicket(String title, String description, UUID departmentId,
                   UUID problemTypeId, UUID requesterId);
}
