package com.nexops.api.governance.domain.ports.out;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface GovernanceTicketQueryPort {
    int countBetween(OffsetDateTime from, OffsetDateTime to);
    int countByStatusBetween(String status, OffsetDateTime from, OffsetDateTime to);
    int countByAssigneeBetween(UUID assigneeId, OffsetDateTime from, OffsetDateTime to);
    double avgResolutionMinutesBetween(OffsetDateTime from, OffsetDateTime to);
    double avgResolutionMinutesByAssigneeBetween(UUID assigneeId, OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countGroupedByProblemTypeBetween(OffsetDateTime from, OffsetDateTime to);
    Map<String, Integer> countGroupedByAssigneeBetween(OffsetDateTime from, OffsetDateTime to);
    List<UUID> findTicketsNearingSlaDeadline(int withinMinutes);
    List<UUID> findBreachedTickets();
}
