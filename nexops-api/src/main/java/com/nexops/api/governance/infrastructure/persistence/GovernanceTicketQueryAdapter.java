package com.nexops.api.governance.infrastructure.persistence;

import com.nexops.api.governance.domain.ports.out.GovernanceTicketQueryPort;
import com.nexops.api.helpdesk.domain.model.TicketStatus;
import com.nexops.api.helpdesk.infrastructure.persistence.TicketJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class GovernanceTicketQueryAdapter implements GovernanceTicketQueryPort {

    private final TicketJpaRepository ticketJpaRepository;

    @Override
    public int countBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.countBetween(tenantId, from, to);
    }

    @Override
    public int countByStatusBetween(UUID tenantId, String status, OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.countByStatusBetween(tenantId, TicketStatus.valueOf(status), from, to);
    }

    @Override
    public int countByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.countByAssigneeBetween(tenantId, assigneeId, from, to);
    }

    @Override
    public int countByStatusAndAssigneeBetween(UUID tenantId, UUID assigneeId, String status, OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.countByStatusAndAssigneeBetween(tenantId, assigneeId, TicketStatus.valueOf(status), from, to);
    }

    @Override
    public double avgResolutionMinutesBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to) {
        Double result = ticketJpaRepository.avgResolutionMinutesBetween(tenantId, from, to);
        return result != null ? result : 0.0;
    }

    @Override
    public double avgResolutionMinutesByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to) {
        Double result = ticketJpaRepository.avgResolutionMinutesByAssigneeBetween(tenantId, assigneeId, from, to);
        return result != null ? result : 0.0;
    }

    @Override
    public Map<String, Integer> countByDateBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.countByDateBetween(tenantId, from, to).stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> ((Long) row[1]).intValue()
                ));
    }

    @Override
    public Map<String, Integer> countGroupedByProblemTypeBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.countGroupedByProblemTypeBetween(tenantId, from, to).stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> ((Long) row[1]).intValue()
                ));
    }

    @Override
    public Map<String, Integer> countGroupedByAssigneeBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.countGroupedByAssigneeBetween(tenantId, from, to).stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> ((Long) row[1]).intValue()
                ));
    }

    @Override
    public Map<String, Integer> countGroupedBySlaLevelBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.countGroupedBySlaLevelBetween(tenantId, from, to).stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> ((Long) row[1]).intValue()
                ));
    }

    @Override
    public Map<String, Integer> countByDateByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.countByDateByAssigneeBetween(tenantId, assigneeId, from, to).stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> ((Long) row[1]).intValue()
                ));
    }

    @Override
    public Map<String, Integer> countGroupedBySlaLevelByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.countGroupedBySlaLevelByAssigneeBetween(tenantId, assigneeId, from, to).stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> ((Long) row[1]).intValue()
                ));
    }

    @Override
    public Map<String, Integer> countGroupedByProblemTypeByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.countGroupedByProblemTypeByAssigneeBetween(tenantId, assigneeId, from, to).stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> ((Long) row[1]).intValue()
                ));
    }

    @Override
    public Map<String, String> findTechnicianIdsByAssigneeBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.findTechniciansByAssigneeBetween(tenantId, from, to).stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> row[1].toString()
                ));
    }

    @Override
    public List<TicketSummary> findClosedTicketsByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to, int page, int size) {
        return ticketJpaRepository.findClosedByAssigneeBetween(tenantId, assigneeId, from, to, PageRequest.of(page, size))
                .stream()
                .map(row -> new TicketSummary(
                    (UUID) row[0],
                    (String) row[1],
                    (String) row[2],
                    row[3].toString(),
                    (OffsetDateTime) row[4],
                    (OffsetDateTime) row[5],
                    (OffsetDateTime) row[6]
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<UUID> findTicketsNearingSlaDeadline(UUID tenantId, int withinMinutes) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime threshold = now.plusMinutes(withinMinutes);
        return ticketJpaRepository.findTicketsNearingSlaDeadline(tenantId, now, threshold);
    }

    @Override
    public List<UUID> findBreachedTickets(UUID tenantId) {
        return ticketJpaRepository.findBreachedTickets(tenantId, OffsetDateTime.now());
    }
}
