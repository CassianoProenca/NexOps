package com.nexops.api.governance.infrastructure.persistence;

import com.nexops.api.governance.domain.model.SlaBreachEvent;
import com.nexops.api.governance.domain.ports.out.SlaBreachEventRepository;
import com.nexops.api.governance.infrastructure.persistence.mapper.GovernanceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;
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
    public List<SlaBreachEvent> findByTicketId(UUID ticketId) {
        return jpaRepository.findByTicketId(ticketId).stream()
                .map(GovernanceMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public int countBreachesBetween(OffsetDateTime from, OffsetDateTime to) {
        return jpaRepository.countBreachesBetween(from, to);
    }

    @Override
    public int countBreachesByTechnicianBetween(UUID technicianId, OffsetDateTime from, OffsetDateTime to) {
        return jpaRepository.countBreachesByTechnicianBetween(technicianId, from, to);
    }
}
