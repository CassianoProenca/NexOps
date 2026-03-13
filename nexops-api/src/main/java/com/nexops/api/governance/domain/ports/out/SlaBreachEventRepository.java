package com.nexops.api.governance.domain.ports.out;

import com.nexops.api.governance.domain.model.SlaBreachEvent;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface SlaBreachEventRepository {
    SlaBreachEvent save(SlaBreachEvent event);
    List<SlaBreachEvent> findByTicketId(UUID tenantId, UUID ticketId);
    int countBreachesBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to);
    int countBreachesByTechnicianBetween(UUID tenantId, UUID technicianId, OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countBreachesByDateBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countBreachesGroupedByProblemTypeBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countBreachesGroupedByTechnicianBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countBreachesByDateByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countBreachesGroupedByProblemTypeByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to);
}
