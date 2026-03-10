package com.nexops.api.inventory.infrastructure.persistence;

import com.nexops.api.inventory.domain.model.StockMovement;
import com.nexops.api.inventory.domain.ports.out.StockMovementRepository;
import com.nexops.api.inventory.infrastructure.persistence.mapper.InventoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class StockMovementRepositoryAdapter implements StockMovementRepository {

    private final StockMovementJpaRepository jpaRepository;

    @Override
    public StockMovement save(StockMovement movement) {
        var entity = InventoryMapper.toEntity(movement);
        var saved = jpaRepository.save(entity);
        return InventoryMapper.toDomain(saved);
    }

    @Override
    public List<StockMovement> findByStockItemId(UUID stockItemId) {
        return jpaRepository.findByStockItemIdOrderByCreatedAtAsc(stockItemId).stream()
                .map(InventoryMapper::toDomain)
                .collect(Collectors.toList());
    }
}
