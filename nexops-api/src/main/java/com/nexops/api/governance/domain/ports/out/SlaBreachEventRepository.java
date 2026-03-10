package com.nexops.api.governance.domain.ports.out;

import com.nexops.api.governance.domain.model.SlaBreachEvent;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface SlaBreachEventRepository {
    SlaBreachEvent save(SlaBreachEvent event);
    List<SlaBreachEvent> findByTicketId(UUID ticketId);
    int countBreachesBetween(OffsetDateTime from, OffsetDateTime to);
    int countBreachesByTechnicianBetween(UUID technicianId, OffsetDateTime from, OffsetDateTime to);
}
