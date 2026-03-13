package com.nexops.api.governance.infrastructure.persistence;

import com.nexops.api.governance.domain.model.SlaBreachEvent;
import com.nexops.api.governance.domain.ports.out.SlaBreachEventRepository;
import com.nexops.api.governance.infrastructure.persistence.mapper.GovernanceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SlaBreachEventRepositoryAdapter implements SlaBreachEventRepository {

    private final SlaBreachEventJpaRepository jpaRepository;

    @Override
    public SlaBreachEvent save(SlaBreachEvent event) {
        var entity = GovernanceMapper.toEntity(event);
        var saved = jpaRepository.save(entity);
        return GovernanceMapper.toDomain(saved);
    }

    @Override
    public List<SlaBreachEvent> findByTicketId(UUID tenantId, UUID ticketId) {
        return jpaRepository.findByTicketIdAndTenantId(tenantId, ticketId).stream()
                .map(GovernanceMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public int countBreachesBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to) {
        return jpaRepository.countBreachesBetween(tenantId, from, to);
    }

    @Override
    public int countBreachesByTechnicianBetween(UUID tenantId, UUID technicianId, OffsetDateTime from, OffsetDateTime to) {
        return jpaRepository.countBreachesByTechnicianBetween(tenantId, technicianId, from, to);
    }

    @Override
    public Map<String, Integer> countBreachesByDateBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to) {
        return jpaRepository.countBreachesByDateBetween(tenantId, from, to).stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> ((Long) row[1]).intValue()
                ));
    }

    @Override
    public Map<String, Integer> countBreachesGroupedByProblemTypeBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to) {
        return jpaRepository.countBreachesGroupedByProblemTypeBetween(tenantId, from, to).stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> ((Long) row[1]).intValue()
                ));
    }

    @Override
    public Map<String, Integer> countBreachesGroupedByTechnicianBetween(UUID tenantId, OffsetDateTime from, OffsetDateTime to) {
        return jpaRepository.countBreachesGroupedByTechnicianBetween(tenantId, from, to).stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> ((Long) row[1]).intValue()
                ));
    }

    @Override
    public Map<String, Integer> countBreachesByDateByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to) {
        return jpaRepository.countBreachesByDateByAssigneeBetween(tenantId, assigneeId, from, to).stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> ((Long) row[1]).intValue()
                ));
    }

    @Override
    public Map<String, Integer> countBreachesGroupedByProblemTypeByAssigneeBetween(UUID tenantId, UUID assigneeId, OffsetDateTime from, OffsetDateTime to) {
        return jpaRepository.countBreachesGroupedByProblemTypeByAssigneeBetween(tenantId, assigneeId, from, to).stream()
                .collect(Collectors.toMap(
                    row -> row[0].toString(),
                    row -> ((Long) row[1]).intValue()
                ));
    }
}
