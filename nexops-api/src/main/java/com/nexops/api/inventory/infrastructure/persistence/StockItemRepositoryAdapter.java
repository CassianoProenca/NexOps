package com.nexops.api.inventory.infrastructure.persistence;

import com.nexops.api.inventory.domain.model.StockItem;
import com.nexops.api.inventory.domain.ports.out.StockItemRepository;
import com.nexops.api.inventory.infrastructure.persistence.mapper.InventoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class StockItemRepositoryAdapter implements StockItemRepository {

    private final StockItemJpaRepository jpaRepository;

    @Override
    public StockItem save(StockItem item) {
        var entity = InventoryMapper.toEntity(item);
        var saved = jpaRepository.save(entity);
        return InventoryMapper.toDomain(saved);
    }

    @Override
    public Optional<StockItem> findById(UUID id) {
        return jpaRepository.findById(id).map(InventoryMapper::toDomain);
    }

    @Override
    public List<StockItem> findAll() {
        return jpaRepository.findAll().stream()
                .map(InventoryMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<StockItem> findActive() {
        return jpaRepository.findByActiveTrue().stream()
                .map(InventoryMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<StockItem> findBelowMinimum() {
        return jpaRepository.findBelowMinimum().stream()
                .map(InventoryMapper::toDomain)
                .collect(Collectors.toList());
    }
}
