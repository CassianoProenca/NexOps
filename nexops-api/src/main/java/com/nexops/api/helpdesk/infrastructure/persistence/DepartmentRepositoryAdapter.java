package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.domain.model.Department;
import com.nexops.api.helpdesk.domain.ports.out.DepartmentRepository;
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
public class DepartmentRepositoryAdapter implements DepartmentRepository {

    private final DepartmentJpaRepository jpa;

    @Override
    public List<Department> findAllActive() {
        var caller = SecurityContext.get();
        if (caller == null) throw new RuntimeException("Não autenticado");
        
        return jpa.findAllByTenantIdAndActiveTrue(caller.tenantId()).stream()
                .map(HelpdeskMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Department> findById(UUID id) {
        return jpa.findById(id).map(HelpdeskMapper::toDomain);
    }

    @Override
    public Department save(Department department) {
        var entity = HelpdeskMapper.toEntity(department);
        return HelpdeskMapper.toDomain(jpa.save(entity));
    }

    @Override
    public List<Department> findAll() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findAll'");
    }
}
