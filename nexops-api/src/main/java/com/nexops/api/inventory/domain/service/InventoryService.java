package com.nexops.api.inventory.domain.service;

import com.nexops.api.inventory.domain.model.*;
import com.nexops.api.inventory.domain.ports.in.*;
import com.nexops.api.inventory.domain.ports.out.*;
import com.nexops.api.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService implements 
    RegisterAssetUseCase, UpdateAssetUseCase, AssignAssetUseCase, 
    UnassignAssetUseCase, SendAssetToMaintenanceUseCase, DiscardAssetUseCase,
    CreateStockItemUseCase, AddStockUseCase, RemoveStockUseCase {

    private final AssetRepository assetRepository;
    private final AssetMovementRepository assetMovementRepository;
    private final StockItemRepository stockItemRepository;
    private final StockMovementRepository stockMovementRepository;

    @Override
    @Transactional
    public Asset registerAsset(String patrimonyNumber, String name, AssetCategory category, String serialNumber, String model, String manufacturer, UUID departmentId, UUID performedById) {
        if (assetRepository.existsByPatrimonyNumber(patrimonyNumber)) {
            throw new BusinessException("Patrimônio já cadastrado: " + patrimonyNumber);
        }
        Asset asset = Asset.register(patrimonyNumber, name, category, serialNumber, model, manufacturer, departmentId);
        Asset saved = assetRepository.save(asset);
        
        AssetMovement movement = AssetMovement.record(saved.getId(), AssetMovementType.REGISTERED, null, null, null, departmentId, performedById, "Registro inicial");
        assetMovementRepository.save(movement);
        
        return saved;
    }

    @Override
    @Transactional
    public Asset updateAsset(UUID assetId, String name, String description, String notes, LocalDate warrantyUntil) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new BusinessException("Ativo não encontrado"));
        asset.update(name, description, notes, warrantyUntil);
        return assetRepository.save(asset);
    }

    @Override
    @Transactional
    public Asset assignAsset(UUID assetId, UUID userId, UUID departmentId, UUID performedById) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new BusinessException("Ativo não encontrado"));
        
        if (asset.getStatus() == AssetStatus.REGISTERED || asset.getStatus() == AssetStatus.IN_MAINTENANCE) {
            asset.makeAvailable(performedById);
        }

        AssetMovement movement = asset.assignTo(userId, departmentId, performedById);
        assetMovementRepository.save(movement);
        return assetRepository.save(asset);
    }

    @Override
    @Transactional
    public Asset unassignAsset(UUID assetId, UUID performedById) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new BusinessException("Ativo não encontrado"));
        AssetMovement movement = asset.unassign(performedById);
        assetMovementRepository.save(movement);
        return assetRepository.save(asset);
    }

    @Override
    @Transactional
    public Asset sendToMaintenance(UUID assetId, UUID performedById, String notes) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new BusinessException("Ativo não encontrado"));
        AssetMovement movement = asset.sendToMaintenance(performedById, notes);
        assetMovementRepository.save(movement);
        return assetRepository.save(asset);
    }

    @Override
    @Transactional
    public Asset discardAsset(UUID assetId, UUID performedById, String notes) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new BusinessException("Ativo não encontrado"));
        AssetMovement movement = asset.discard(performedById, notes);
        assetMovementRepository.save(movement);
        return assetRepository.save(asset);
    }

    @Override
    @Transactional
    public StockItem createStockItem(String name, String category, String unit, int minimumQuantity, String location) {
        StockItem item = StockItem.create(name, category, unit, minimumQuantity, location);
        return stockItemRepository.save(item);
    }

    @Override
    @Transactional
    public StockItem addStock(UUID stockItemId, int quantity, UUID performedById, String reason) {
        StockItem item = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new BusinessException("Item de estoque não encontrado"));
        StockMovement movement = item.addStock(quantity, performedById, reason);
        stockMovementRepository.save(movement);
        return stockItemRepository.save(item);
    }

    @Override
    @Transactional
    public StockItem removeStock(UUID stockItemId, int quantity, UUID performedById, String reason, UUID relatedTicketId) {
        StockItem item = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new BusinessException("Item de estoque não encontrado"));
        StockMovement movement = item.removeStock(quantity, performedById, reason, relatedTicketId);
        stockMovementRepository.save(movement);
        return stockItemRepository.save(item);
    }
}
