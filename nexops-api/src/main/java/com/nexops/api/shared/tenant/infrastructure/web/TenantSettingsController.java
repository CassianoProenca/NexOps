package com.nexops.api.shared.tenant.infrastructure.web;

import com.nexops.api.shared.security.SecurityContext;
import com.nexops.api.shared.tenant.domain.model.Tenant;
import com.nexops.api.shared.tenant.domain.model.TenantSettings;
import com.nexops.api.shared.tenant.domain.ports.in.*;
import com.nexops.api.shared.tenant.infrastructure.web.dto.TenantResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/tenant/settings")
@RequiredArgsConstructor
@Tag(name = "Tenant Settings", description = "Current tenant configuration")
public class TenantSettingsController {

    private final GetTenantSettingsUseCase getUseCase;
    private final UpdateTenantSettingsUseCase updateUseCase;
    private final GetExtraSettingsUseCase getExtraUseCase;
    private final UpdateSmtpSettingsUseCase updateSmtpUseCase;
    private final UpdateAiSettingsUseCase updateAiUseCase;
    private final TestSmtpConnectionUseCase testSmtpUseCase;

    @Operation(summary = "Get current tenant settings")
    @GetMapping
    public TenantResponse getSettings() {
        return toResponse(getUseCase.get());
    }

    @Operation(summary = "Update current tenant settings")
    @PutMapping
    public TenantResponse updateSettings(@RequestBody UpdateSettingsRequest request) {
        return toResponse(updateUseCase.update(request.nomeFantasia()));
    }

    @Operation(summary = "Get current tenant extra settings (SMTP/AI)")
    @GetMapping("/extra")
    public TenantSettings getExtraSettings() {
        return getExtraUseCase.getExtra();
    }

    @Operation(summary = "Update current tenant SMTP settings")
    @PutMapping("/smtp")
    public TenantSettings updateSmtp(@RequestBody UpdateSmtpRequest request) {
        return updateSmtpUseCase.updateSmtp(
                request.host(), request.port(), request.username(), request.password(),
                request.fromEmail(), request.fromName(), request.useTls()
        );
    }

    @Operation(summary = "Update current tenant AI settings")
    @PutMapping("/ai")
    public TenantSettings updateAi(@RequestBody UpdateAiRequest request) {
        return updateAiUseCase.updateAi(request.provider(), request.apiKey(), request.model(), request.enabled());
    }

    @Operation(summary = "Test current tenant SMTP connection")
    @PostMapping("/smtp/test")
    public ResponseEntity<TestSmtpResponse> testSmtp() {
        var caller = SecurityContext.get();
        testSmtpUseCase.test(caller.tenantId());
        return ResponseEntity.ok(new TestSmtpResponse(true, "Conexão SMTP estabelecida com sucesso."));
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

    public record UpdateSettingsRequest(String nomeFantasia) {}
    public record UpdateSmtpRequest(String host, Integer port, String username, String password, String fromEmail, String fromName, Boolean useTls) {}
    public record UpdateAiRequest(String provider, String apiKey, String model, Boolean enabled) {}
    public record TestSmtpResponse(boolean success, String message) {}
}
