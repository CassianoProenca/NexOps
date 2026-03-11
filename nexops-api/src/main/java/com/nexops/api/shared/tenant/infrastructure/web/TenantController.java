package com.nexops.api.shared.tenant.infrastructure.web;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.tenant.domain.model.Tenant;
import com.nexops.api.shared.tenant.domain.ports.in.TenantProvisioningUseCase;
import com.nexops.api.shared.tenant.domain.ports.out.TenantRepository;
import com.nexops.api.shared.tenant.infrastructure.web.dto.CreateTenantRequest;
import com.nexops.api.shared.tenant.infrastructure.web.dto.TenantResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenants", description = "Tenant management (Super-admin only)")
public class TenantController {

    private final TenantProvisioningUseCase provisioningUseCase;
    private final TenantRepository tenantRepository;

    @Operation(summary = "Create tenant")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TenantResponse create(@RequestBody @Valid CreateTenantRequest request) {
        Tenant tenant = provisioningUseCase.provision(
                request.cnpj(), request.nomeFantasia(), request.email());
        return toResponse(tenant);
    }

    @Operation(summary = "Get tenant by ID")
    @GetMapping("/{id}")
    public TenantResponse getById(@PathVariable UUID id) {
        return tenantRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new BusinessException("Tenant not found: " + id));
    }

    private TenantResponse toResponse(Tenant t) {
        return new TenantResponse(
                t.getId(),
                t.getCnpj(),
                t.getNomeFantasia(),
                t.getEmail(),
                t.getStatus().name(),
                t.getCreatedAt()
        );
    }
}
