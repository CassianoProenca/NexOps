package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.domain.model.Department;
import com.nexops.api.helpdesk.domain.ports.out.DepartmentRepository;
import com.nexops.api.helpdesk.infrastructure.persistence.mapper.HelpdeskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DepartmentRepositoryAdapter implements DepartmentRepository {

    private final DepartmentJpaRepository jpaRepository;

    @Override
    public Department save(Department department) {
        var entity = HelpdeskMapper.toEntity(department);
        var saved = jpaRepository.save(entity);
        return HelpdeskMapper.toDomain(saved);
    }

    @Override
    public Optional<Department> findById(UUID id) {
        return jpaRepository.findById(id).map(HelpdeskMapper::toDomain);
    }

    @Override
    public List<Department> findAll() {
        return jpaRepository.findAll().stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Department> findAllActive() {
        return jpaRepository.findByActiveTrue().stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }
}
