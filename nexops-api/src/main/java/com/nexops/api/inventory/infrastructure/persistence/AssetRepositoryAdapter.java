package com.nexops.api.inventory.infrastructure.persistence;

import com.nexops.api.inventory.domain.model.Asset;
import com.nexops.api.inventory.domain.model.AssetStatus;
import com.nexops.api.inventory.domain.ports.out.AssetRepository;
import com.nexops.api.inventory.infrastructure.persistence.mapper.InventoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AssetRepositoryAdapter implements AssetRepository {

    private final AssetJpaRepository jpaRepository;

    @Override
    public Asset save(Asset asset) {
        var entity = InventoryMapper.toEntity(asset);
        var saved = jpaRepository.save(entity);
        return InventoryMapper.toDomain(saved);
    }

    @Override
    public Optional<Asset> findById(UUID id) {
        return jpaRepository.findById(id).map(InventoryMapper::toDomain);
    }

    @Override
    public List<Asset> findAll() {
        return jpaRepository.findAll().stream()
                .map(InventoryMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Asset> findByStatus(AssetStatus status) {
        return jpaRepository.findByStatus(status).stream()
                .map(InventoryMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Asset> findByAssignedUserId(UUID userId) {
        return jpaRepository.findByAssignedUserId(userId).stream()
                .map(InventoryMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Asset> findByAssignedDepartmentId(UUID departmentId) {
        return jpaRepository.findByAssignedDepartmentId(departmentId).stream()
                .map(InventoryMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByPatrimonyNumber(String patrimonyNumber) {
        return jpaRepository.existsByPatrimonyNumber(patrimonyNumber);
    }
}
