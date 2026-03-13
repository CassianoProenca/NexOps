package com.nexops.api.governance.domain.ports.in;

import com.nexops.api.governance.domain.ports.out.GovernanceTicketQueryPort.TicketSummary;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface GetTechnicianTicketsUseCase {
    List<TicketSummary> execute(UUID tenantId, UUID technicianId, OffsetDateTime from, OffsetDateTime to, int page, int size);
}
