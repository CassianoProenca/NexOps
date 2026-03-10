package com.nexops.api.inventory.infrastructure.persistence;

import com.nexops.api.inventory.domain.model.AssetMovement;
import com.nexops.api.inventory.domain.ports.out.AssetMovementRepository;
import com.nexops.api.inventory.infrastructure.persistence.mapper.InventoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AssetMovementRepositoryAdapter implements AssetMovementRepository {

    private final AssetMovementJpaRepository jpaRepository;

    @Override
    public AssetMovement save(AssetMovement movement) {
        var entity = InventoryMapper.toEntity(movement);
        var saved = jpaRepository.save(entity);
        return InventoryMapper.toDomain(saved);
    }

    @Override
    public List<AssetMovement> findByAssetId(UUID assetId) {
        return jpaRepository.findByAssetIdOrderByCreatedAtAsc(assetId).stream()
                .map(InventoryMapper::toDomain)
                .collect(Collectors.toList());
    }
}
