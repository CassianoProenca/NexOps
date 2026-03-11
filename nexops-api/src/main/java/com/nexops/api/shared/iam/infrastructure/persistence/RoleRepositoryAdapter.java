package com.nexops.api.shared.iam.infrastructure.persistence;

import com.nexops.api.shared.iam.domain.model.Role;
import com.nexops.api.shared.iam.domain.ports.out.RoleRepository;
import com.nexops.api.shared.iam.infrastructure.persistence.mapper.IamMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class RoleRepositoryAdapter implements RoleRepository {

    private final RoleJpaRepository roleJpaRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public List<Role> findAllByTenantId(UUID tenantId) {
        return roleJpaRepository.findAllByTenantId(tenantId).stream()
                .map(IamMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Role> findById(UUID id) {
        return roleJpaRepository.findById(id).map(IamMapper::toDomain);
    }

    @Override
    public Role save(Role role) {
        var entity = IamMapper.toEntity(role);
        return IamMapper.toDomain(roleJpaRepository.save(entity));
    }

    @Override
    public void delete(UUID id) {
        roleJpaRepository.deleteById(id);
    }

    @Override
    public boolean existsByNameAndTenantId(String name, UUID tenantId) {
        // We'll add this to JpaRepository
        return roleJpaRepository.findByNameAndTenantId(name, tenantId).isPresent();
    }
}
