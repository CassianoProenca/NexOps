package com.nexops.api.shared.iam.infrastructure.persistence;

import com.nexops.api.shared.iam.domain.model.Permission;
import com.nexops.api.shared.iam.domain.ports.out.PermissionRepository;
import com.nexops.api.shared.iam.infrastructure.persistence.mapper.IamMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PermissionRepositoryAdapter implements PermissionRepository {

    private final PermissionJpaRepository permissionJpaRepository;

    @Override
    public List<Permission> findAll() {
        return permissionJpaRepository.findAll().stream()
                .map(IamMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Set<Permission> findAllByCodes(List<String> codes) {
        return permissionJpaRepository.findByCodeIn(codes).stream()
                .map(IamMapper::toDomain)
                .collect(Collectors.toSet());
    }
}
