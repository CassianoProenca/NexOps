package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.domain.model.TicketComment;
import com.nexops.api.helpdesk.domain.ports.out.TicketCommentRepository;
import com.nexops.api.helpdesk.infrastructure.persistence.mapper.HelpdeskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class TicketCommentRepositoryAdapter implements TicketCommentRepository {

    private final TicketCommentJpaRepository jpaRepository;

    @Override
    public TicketComment save(TicketComment comment) {
        var entity = HelpdeskMapper.toEntity(comment);
        var saved = jpaRepository.save(entity);
        return HelpdeskMapper.toDomain(saved);
    }

    @Override
    public List<TicketComment> findByTicketId(UUID ticketId) {
        return jpaRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }
}
