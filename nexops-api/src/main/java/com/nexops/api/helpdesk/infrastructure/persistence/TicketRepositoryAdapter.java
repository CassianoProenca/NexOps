package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.domain.model.Ticket;
import com.nexops.api.helpdesk.domain.model.TicketStatus;
import com.nexops.api.helpdesk.domain.ports.out.TicketRepository;
import com.nexops.api.helpdesk.infrastructure.persistence.mapper.HelpdeskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TicketRepositoryAdapter implements TicketRepository {

    private final TicketJpaRepository jpaRepository;

    @Override
    public Ticket save(Ticket ticket) {
        var entity = HelpdeskMapper.toEntity(ticket);
        var saved = jpaRepository.save(entity);
        return HelpdeskMapper.toDomain(saved);
    }

    @Override
    public Optional<Ticket> findById(UUID id) {
        return jpaRepository.findById(id).map(HelpdeskMapper::toDomain);
    }

    @Override
    public List<Ticket> findByStatus(TicketStatus status) {
        return jpaRepository.findByStatus(status).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ticket> findByAssigneeId(UUID assigneeId) {
        return jpaRepository.findByAssigneeId(assigneeId).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ticket> findByRequesterId(UUID requesterId) {
        return jpaRepository.findByRequesterId(requesterId).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ticket> findByProblemTypeIdAndStatus(UUID problemTypeId, TicketStatus status) {
        return jpaRepository.findByProblemTypeIdAndStatus(problemTypeId, status).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ticket> findOpenByProblemTypeOrderByPriorityAndAge(UUID problemTypeId) {
        return jpaRepository.findOpenByProblemTypeOrderByPriorityAndAge(problemTypeId).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ticket> findAll() {
        return jpaRepository.findAll().stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ticket> findChildTickets(UUID parentTicketId) {
        return jpaRepository.findByParentTicketId(parentTicketId).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }
}
