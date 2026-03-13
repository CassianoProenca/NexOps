package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.domain.model.ProblemType;
import com.nexops.api.helpdesk.domain.ports.out.ProblemTypeRepository;
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
public class ProblemTypeRepositoryAdapter implements ProblemTypeRepository {

    private final ProblemTypeJpaRepository jpa;

    @Override
    public List<ProblemType> findAllActive() {
        var caller = SecurityContext.get();
        if (caller == null) throw new RuntimeException("Não autenticado");

        return jpa.findAllByTenantIdAndActiveTrue(caller.tenantId()).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ProblemType> findById(UUID id) {
        return jpa.findById(id).map(HelpdeskMapper::toDomain);
    }

    @Override
    public ProblemType save(ProblemType problemType) {
        var entity = HelpdeskMapper.toEntity(problemType);
        return HelpdeskMapper.toDomain(jpa.save(entity));
    }

    @Override
    public List<ProblemType> findAll() {
        var caller = SecurityContext.get();
        if (caller == null) throw new RuntimeException("Não autenticado");
        return jpa.findAllByTenantId(caller.tenantId()).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }
}
