package com.nexops.api.inventory.infrastructure.web;

import com.nexops.api.inventory.domain.model.StockItem;
import com.nexops.api.inventory.domain.model.StockMovement;
import com.nexops.api.inventory.domain.ports.in.*;
import com.nexops.api.inventory.domain.ports.out.StockItemRepository;
import com.nexops.api.inventory.domain.ports.out.StockMovementRepository;
import com.nexops.api.inventory.infrastructure.web.dto.*;
import com.nexops.api.shared.security.AuthenticatedUser;
import com.nexops.api.shared.security.SecurityContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/stock")
@RequiredArgsConstructor
@Tag(name = "Stock", description = "Inventory stock management")
public class StockController {

    private final CreateStockItemUseCase createStockItemUseCase;
    private final AddStockUseCase addStockUseCase;
    private final RemoveStockUseCase removeStockUseCase;
    private final StockItemRepository stockItemRepository;
    private final StockMovementRepository movementRepository;

    @Operation(summary = "List all stock items", description = "Retrieve a list of all active items in stock")
    @GetMapping
    public List<StockItemResponse> listAll() {
        checkPermission("INVENTORY_VIEW");
        return stockItemRepository.findActive().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Operation(summary = "Get stock item by ID", description = "Retrieve details of a specific stock item")
    @GetMapping("/{id}")
    public StockItemResponse getById(@PathVariable UUID id) {
        checkPermission("INVENTORY_VIEW");
        return stockItemRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Item de estoque não encontrado"));
    }

    @Operation(summary = "List stock movements", description = "Retrieve the history of stock movements for a specific item")
    @GetMapping("/{id}/movements")
    public List<StockMovementResponse> listMovements(@PathVariable UUID id) {
        checkPermission("INVENTORY_VIEW");
        return movementRepository.findByStockItemId(id).stream()
                .map(this::toMovementResponse)
                .collect(Collectors.toList());
    }

    @Operation(summary = "List stock alerts", description = "Retrieve items that are below the minimum required quantity")
    @GetMapping("/alerts")
    public List<StockItemResponse> listAlerts() {
        checkPermission("INVENTORY_VIEW");
        return stockItemRepository.findBelowMinimum().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Operation(summary = "Create stock item", description = "Register a new item type in the stock")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StockItemResponse create(@RequestBody @Valid CreateStockItemRequest request) {
        checkPermission("INVENTORY_WRITE");
        StockItem item = createStockItemUseCase.createStockItem(
                request.name(), request.category(), request.unit(),
                request.minimumQuantity(), request.location());
        return toResponse(item);
    }

    @Operation(summary = "Add stock", description = "Increase the current quantity of a stock item")
    @PostMapping("/{id}/add")
    public StockItemResponse addStock(@PathVariable UUID id, @RequestBody @Valid StockAdjustmentRequest request) {
        checkPermission("INVENTORY_WRITE");
        AuthenticatedUser user = SecurityContext.get();
        StockItem item = addStockUseCase.addStock(id, request.quantity(), user.userId(), request.reason());
        return toResponse(item);
    }

    @Operation(summary = "Remove stock", description = "Decrease the current quantity of a stock item")
    @PostMapping("/{id}/remove")
    public StockItemResponse removeStock(@PathVariable UUID id, @RequestBody @Valid StockAdjustmentRequest request) {
        checkPermission("INVENTORY_WRITE");
        AuthenticatedUser user = SecurityContext.get();
        StockItem item = removeStockUseCase.removeStock(id, request.quantity(), user.userId(), request.reason(), request.relatedTicketId());
        return toResponse(item);
    }

    private void checkPermission(String permission) {
        if (!SecurityContext.get().hasPermission(permission)) {
            throw new AccessDeniedException("Sem permissão para esta operação");
        }
    }

    private StockItemResponse toResponse(StockItem i) {
        return new StockItemResponse(
                i.getId(), i.getName(), i.getDescription(), i.getCategory(),
                i.getUnit(), i.getCurrentQuantity(), i.getMinimumQuantity(),
                i.getLocation(), i.isActive(), i.isBelowMinimum(),
                i.getCreatedAt(), i.getUpdatedAt());
    }

    private StockMovementResponse toMovementResponse(StockMovement m) {
        return new StockMovementResponse(
                m.getId(), m.getStockItemId(), m.getMovementType().name(),
                m.getQuantity(), m.getPreviousQuantity(), m.getNewQuantity(),
                m.getReason(), m.getPerformedById(), m.getRelatedTicketId(), m.getCreatedAt());
    }
}
