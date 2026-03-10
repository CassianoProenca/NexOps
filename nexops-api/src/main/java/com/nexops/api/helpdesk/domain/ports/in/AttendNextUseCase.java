package com.nexops.api.helpdesk.domain.ports.in;

import com.nexops.api.helpdesk.domain.model.Ticket;
import java.util.Optional;
import java.util.UUID;

public interface AttendNextUseCase {
    Optional<Ticket> attendNext(UUID technicianId, UUID problemTypeId);
}
