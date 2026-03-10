package com.nexops.api.governance.infrastructure.persistence;

import com.nexops.api.governance.domain.model.SlaConfig;
import com.nexops.api.governance.domain.ports.out.SlaConfigRepository;
import com.nexops.api.governance.infrastructure.persistence.mapper.GovernanceMapper;
import com.nexops.api.helpdesk.domain.model.SlaLevel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class SlaConfigRepositoryAdapter implements SlaConfigRepository {

    private final SlaConfigJpaRepository jpaRepository;

    @Override
    public List<SlaConfig> findAll() {
        return jpaRepository.findAll().stream()
                .map(GovernanceMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<SlaConfig> findById(UUID id) {
        return jpaRepository.findById(id).map(GovernanceMapper::toDomain);
    }

    @Override
    public Optional<SlaConfig> findByProblemTypeIdAndSlaLevel(UUID problemTypeId, SlaLevel slaLevel) {
        return jpaRepository.findByProblemTypeIdAndSlaLevel(problemTypeId, slaLevel)
                .map(GovernanceMapper::toDomain);
    }

    @Override
    public SlaConfig save(SlaConfig config) {
        var entity = GovernanceMapper.toEntity(config);
        var saved = jpaRepository.save(entity);
        return GovernanceMapper.toDomain(saved);
    }
}
