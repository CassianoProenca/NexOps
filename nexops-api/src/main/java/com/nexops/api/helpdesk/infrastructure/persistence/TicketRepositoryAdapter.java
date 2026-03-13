package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.domain.model.Ticket;
import com.nexops.api.helpdesk.domain.model.TicketStatus;
import com.nexops.api.helpdesk.domain.ports.out.TicketRepository;
import com.nexops.api.helpdesk.infrastructure.persistence.mapper.HelpdeskMapper;
import com.nexops.api.shared.security.SecurityContext;
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
    public List<Ticket> findByStatus(UUID tenantId, TicketStatus status) {
        return jpaRepository.findByTenantIdAndStatus(tenantId, status).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ticket> findByAssigneeId(UUID tenantId, UUID assigneeId) {
        return jpaRepository.findByTenantIdAndAssigneeId(tenantId, assigneeId).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ticket> findByRequesterId(UUID tenantId, UUID requesterId) {
        return jpaRepository.findByTenantIdAndRequesterId(tenantId, requesterId).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ticket> findByProblemTypeIdAndStatus(UUID tenantId, UUID problemTypeId, TicketStatus status) {
        return jpaRepository.findByTenantIdAndProblemTypeIdAndStatus(tenantId, problemTypeId, status).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ticket> findOpenByProblemTypeOrderByPriorityAndAge(UUID tenantId, UUID problemTypeId) {
        return jpaRepository.findOpenByProblemTypeOrderByPriorityAndAge(tenantId, problemTypeId).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Ticket> findAll() {
        var caller = SecurityContext.get();
        if (caller == null) throw new RuntimeException("Não autenticado");
        return jpaRepository.findAllByTenantId(caller.tenantId()).stream()
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
