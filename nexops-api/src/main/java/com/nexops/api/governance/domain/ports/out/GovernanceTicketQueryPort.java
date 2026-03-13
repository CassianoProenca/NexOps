package com.nexops.api.governance.domain.ports.out;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface GovernanceTicketQueryPort {

    record TicketSummary(UUID id, String title, String problemTypeName, String slaLevel,
                         OffsetDateTime openedAt, OffsetDateTime closedAt, OffsetDateTime slaDeadline) {}

    int countBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to);
    int countByStatusBetween(UUID tenantId, String status, OffsetDateTime from, OffsetDateTime to);
    int countByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to);
    int countByStatusAndAssigneeBetween(UUID tenantId, UUID assigneeId, String status, OffsetDateTime from, OffsetDateTime to);
    double avgResolutionMinutesBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to);
    double avgResolutionMinutesByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countByDateBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countGroupedByProblemTypeBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countGroupedByAssigneeBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countGroupedBySlaLevelBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countByDateByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countGroupedBySlaLevelByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countGroupedByProblemTypeByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to);
    Map<String, String> findTechnicianIdsByAssigneeBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to);
    List<TicketSummary> findClosedTicketsByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to, int page, int size);
    List<UUID> findTicketsNearingSlaDeadline(UUID tenantId, int withinMinutes);
    List<UUID> findBreachedTickets(UUID tenantId);
}
