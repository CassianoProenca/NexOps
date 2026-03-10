package com.nexops.api.governance.infrastructure.persistence;

import com.nexops.api.governance.domain.ports.out.GovernanceTicketQueryPort;
import com.nexops.api.helpdesk.infrastructure.persistence.TicketJpaRepository;
import com.nexops.api.helpdesk.infrastructure.persistence.entity.TicketJpaEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Duration;
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
    public int countBetween(OffsetDateTime from, OffsetDateTime to) {
        return (int) ticketJpaRepository.findAll().stream()
                .filter(t -> t.getCreatedAt().isAfter(from) && t.getCreatedAt().isBefore(to))
                .count();
    }

    @Override
    public int countByStatusBetween(String status, OffsetDateTime from, OffsetDateTime to) {
        return (int) ticketJpaRepository.findAll().stream()
                .filter(t -> t.getStatus().name().equals(status) && t.getCreatedAt().isAfter(from) && t.getCreatedAt().isBefore(to))
                .count();
    }

    @Override
    public int countByAssigneeBetween(UUID assigneeId, OffsetDateTime from, OffsetDateTime to) {
        return (int) ticketJpaRepository.findAll().stream()
                .filter(t -> assigneeId.equals(t.getAssigneeId()) && t.getCreatedAt().isAfter(from) && t.getCreatedAt().isBefore(to))
                .count();
    }

    @Override
    public double avgResolutionMinutesBetween(OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.findAll().stream()
                .filter(t -> t.getClosedAt() != null && t.getCreatedAt().isAfter(from) && t.getCreatedAt().isBefore(to))
                .mapToLong(t -> Duration.between(t.getOpenedAt(), t.getClosedAt()).toMinutes())
                .average()
                .orElse(0.0);
    }

    @Override
    public double avgResolutionMinutesByAssigneeBetween(UUID assigneeId, OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.findAll().stream()
                .filter(t -> assigneeId.equals(t.getAssigneeId()) && t.getClosedAt() != null && t.getCreatedAt().isAfter(from) && t.getCreatedAt().isBefore(to))
                .mapToLong(t -> Duration.between(t.getOpenedAt(), t.getClosedAt()).toMinutes())
                .average()
                .orElse(0.0);
    }

    @Override
    public Map<String, Integer> countGroupedByProblemTypeBetween(OffsetDateTime from, OffsetDateTime to) {
        // This is a placeholder since we don't have problem type names in TicketJpaEntity directly
        // In a real scenario, we'd join with ProblemType table
        return ticketJpaRepository.findAll().stream()
                .filter(t -> t.getCreatedAt().isAfter(from) && t.getCreatedAt().isBefore(to))
                .collect(Collectors.groupingBy(t -> t.getProblemTypeId().toString(), Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));
    }

    @Override
    public Map<String, Integer> countGroupedByAssigneeBetween(OffsetDateTime from, OffsetDateTime to) {
        return ticketJpaRepository.findAll().stream()
                .filter(t -> t.getAssigneeId() != null && t.getCreatedAt().isAfter(from) && t.getCreatedAt().isBefore(to))
                .collect(Collectors.groupingBy(t -> t.getAssigneeId().toString(), Collectors.collectingAndThen(Collectors.counting(), Long::intValue)));
    }

    @Override
    public List<UUID> findTicketsNearingSlaDeadline(int withinMinutes) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime threshold = now.plusMinutes(withinMinutes);
        return ticketJpaRepository.findAll().stream()
                .filter(t -> t.getSlaDeadline() != null
                        && t.getSlaDeadline().isAfter(now)
                        && t.getSlaDeadline().isBefore(threshold)
                        && !t.getStatus().name().equals("CLOSED"))
                .map(TicketJpaEntity::getId)
                .toList();
    }

    @Override
    public List<UUID> findBreachedTickets() {
        OffsetDateTime now = OffsetDateTime.now();
        return ticketJpaRepository.findAll().stream()
                .filter(t -> t.getSlaDeadline() != null
                        && t.getSlaDeadline().isBefore(now)
                        && !t.getStatus().name().equals("CLOSED"))
                .map(TicketJpaEntity::getId)
                .toList();
    }
}
