package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.domain.model.ProblemType;
import com.nexops.api.helpdesk.domain.ports.out.ProblemTypeRepository;
import com.nexops.api.helpdesk.infrastructure.persistence.mapper.HelpdeskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ProblemTypeRepositoryAdapter implements ProblemTypeRepository {

    private final ProblemTypeJpaRepository jpaRepository;

    @Override
    public ProblemType save(ProblemType problemType) {
        var entity = HelpdeskMapper.toEntity(problemType);
        var saved = jpaRepository.save(entity);
        return HelpdeskMapper.toDomain(saved);
    }

    @Override
    public Optional<ProblemType> findById(UUID id) {
        return jpaRepository.findById(id).map(HelpdeskMapper::toDomain);
    }

    @Override
    public List<ProblemType> findAll() {
        return jpaRepository.findAll().stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProblemType> findAllActive() {
        return jpaRepository.findByActiveTrue().stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }
}
