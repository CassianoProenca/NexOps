package com.nexops.api.helpdesk.domain.ports.in;

import com.nexops.api.helpdesk.domain.model.Ticket;
import java.util.UUID;

public interface CreateChildTicketUseCase {
    Ticket createChildTicket(UUID parentTicketId, String title, String description,
                   UUID problemTypeId, UUID requesterId);
}
