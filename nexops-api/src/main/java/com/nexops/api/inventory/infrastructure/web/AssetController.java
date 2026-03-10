package com.nexops.api.inventory.infrastructure.web;

import com.nexops.api.inventory.domain.model.Asset;
import com.nexops.api.inventory.domain.model.AssetMovement;
import com.nexops.api.inventory.domain.ports.in.*;
import com.nexops.api.inventory.domain.ports.out.AssetMovementRepository;
import com.nexops.api.inventory.domain.ports.out.AssetRepository;
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
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
@Tag(name = "Assets", description = "IT Asset management")
public class AssetController {

    private final RegisterAssetUseCase registerAssetUseCase;
    private final UpdateAssetUseCase updateAssetUseCase;
    private final AssignAssetUseCase assignAssetUseCase;
    private final UnassignAssetUseCase unassignAssetUseCase;
    private final SendAssetToMaintenanceUseCase sendAssetToMaintenanceUseCase;
    private final DiscardAssetUseCase discardAssetUseCase;
    private final AssetRepository assetRepository;
    private final AssetMovementRepository movementRepository;

    @Operation(summary = "List all assets", description = "Retrieve a list of all registered assets")
    @GetMapping
    public List<AssetResponse> listAll() {
        checkPermission("INVENTORY_VIEW");
        return assetRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Operation(summary = "Get asset by ID", description = "Retrieve full details of a specific asset")
    @GetMapping("/{id}")
    public AssetResponse getById(@PathVariable UUID id) {
        checkPermission("INVENTORY_VIEW");
        return assetRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new RuntimeException("Ativo não encontrado"));
    }

    @Operation(summary = "List asset movements", description = "Retrieve the movement history of a specific asset")
    @GetMapping("/{id}/movements")
    public List<AssetMovementResponse> listMovements(@PathVariable UUID id) {
        checkPermission("INVENTORY_VIEW");
        return movementRepository.findByAssetId(id).stream()
                .map(this::toMovementResponse)
                .collect(Collectors.toList());
    }

    @Operation(summary = "Register asset", description = "Register a new asset in the system")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AssetResponse register(@RequestBody @Valid RegisterAssetRequest request) {
        checkPermission("INVENTORY_WRITE");
        AuthenticatedUser user = SecurityContext.get();
        Asset asset = registerAssetUseCase.registerAsset(
                request.patrimonyNumber(), request.name(), request.category(),
                request.serialNumber(), request.model(), request.manufacturer(),
                request.departmentId(), user.userId());
        return toResponse(asset);
    }

    @Operation(summary = "Update asset", description = "Update details of an existing asset")
    @PutMapping("/{id}")
    public AssetResponse update(@PathVariable UUID id, @RequestBody @Valid UpdateAssetRequest request) {
        checkPermission("INVENTORY_WRITE");
        Asset asset = updateAssetUseCase.updateAsset(id, request.name(), request.description(), request.notes(), request.warrantyUntil());
        return toResponse(asset);
    }

    @Operation(summary = "Assign asset", description = "Assign an asset to a user and department")
    @PostMapping("/{id}/assign")
    public AssetResponse assign(@PathVariable UUID id, @RequestBody @Valid AssignAssetRequest request) {
        checkPermission("INVENTORY_WRITE");
        AuthenticatedUser user = SecurityContext.get();
        Asset asset = assignAssetUseCase.assignAsset(id, request.userId(), request.departmentId(), user.userId());
        return toResponse(asset);
    }

    @Operation(summary = "Unassign asset", description = "Remove the current assignment of an asset")
    @PostMapping("/{id}/unassign")
    public AssetResponse unassign(@PathVariable UUID id) {
        checkPermission("INVENTORY_WRITE");
        AuthenticatedUser user = SecurityContext.get();
        Asset asset = unassignAssetUseCase.unassignAsset(id, user.userId());
        return toResponse(asset);
    }

    @Operation(summary = "Send to maintenance", description = "Mark an asset as being in maintenance")
    @PostMapping("/{id}/maintenance")
    public AssetResponse maintenance(@PathVariable UUID id, @RequestBody @Valid MaintenanceRequest request) {
        checkPermission("INVENTORY_WRITE");
        AuthenticatedUser user = SecurityContext.get();
        Asset asset = sendAssetToMaintenanceUseCase.sendToMaintenance(id, user.userId(), request.notes());
        return toResponse(asset);
    }

    @Operation(summary = "Discard asset", description = "Mark an asset as discarded/decommissioned")
    @PostMapping("/{id}/discard")
    public AssetResponse discard(@PathVariable UUID id, @RequestBody @Valid DiscardRequest request) {
        checkPermission("INVENTORY_WRITE");
        AuthenticatedUser user = SecurityContext.get();
        Asset asset = discardAssetUseCase.discardAsset(id, user.userId(), request.notes());
        return toResponse(asset);
    }

    private void checkPermission(String permission) {
        if (!SecurityContext.get().hasPermission(permission)) {
            throw new AccessDeniedException("Sem permissão para esta operação");
        }
    }

    private AssetResponse toResponse(Asset a) {
        return new AssetResponse(
                a.getId(), a.getPatrimonyNumber(), a.getName(), a.getDescription(),
                a.getCategory().name(), a.getStatus().name(), a.getSerialNumber(),
                a.getModel(), a.getManufacturer(), a.getPurchaseDate(),
                a.getPurchaseValue(), a.getWarrantyUntil(), a.getAssignedUserId(),
                a.getAssignedDepartmentId(), a.getNotes(), a.getCreatedAt(), a.getUpdatedAt());
    }

    private AssetMovementResponse toMovementResponse(AssetMovement m) {
        return new AssetMovementResponse(
                m.getId(), m.getAssetId(), m.getMovementType().name(),
                m.getFromUserId(), m.getToUserId(), m.getFromDepartmentId(),
                m.getToDepartmentId(), m.getPerformedById(), m.getNotes(), m.getCreatedAt());
    }
}
