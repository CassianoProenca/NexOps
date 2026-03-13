package com.nexops.api.governance.infrastructure.web;

import com.nexops.api.governance.domain.model.GovernanceMetrics;
import com.nexops.api.governance.domain.model.SlaConfig;
import com.nexops.api.governance.domain.ports.in.GetGovernanceMetricsUseCase;
import com.nexops.api.governance.domain.ports.in.GetSlaConfigsUseCase;
import com.nexops.api.governance.domain.ports.in.GetTechnicianMetricsUseCase;
import com.nexops.api.governance.domain.ports.in.GetTechnicianTicketsUseCase;
import com.nexops.api.governance.domain.ports.in.UpdateSlaConfigUseCase;
import com.nexops.api.governance.domain.ports.out.GovernanceTicketQueryPort.TicketSummary;
import com.nexops.api.governance.infrastructure.web.dto.TechnicianTicketItem;
import com.nexops.api.shared.security.AuthenticatedUser;
import com.nexops.api.shared.security.SecurityContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/governance")
@RequiredArgsConstructor
@Tag(name = "Governance", description = "SLA metrics and configurations")
public class GovernanceController {

    private final GetGovernanceMetricsUseCase getGovernanceMetricsUseCase;
    private final GetTechnicianMetricsUseCase getTechnicianMetricsUseCase;
    private final GetTechnicianTicketsUseCase getTechnicianTicketsUseCase;
    private final GetSlaConfigsUseCase getSlaConfigsUseCase;
    private final UpdateSlaConfigUseCase updateSlaConfigUseCase;

    @Operation(summary = "Get dashboard metrics", description = "Retrieve global SLA and performance metrics for a period")
    @GetMapping("/dashboard")
    public GovernanceMetrics getDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {

        AuthenticatedUser user = SecurityContext.get();
        if (!user.hasPermission("REPORT_VIEW_ALL")) {
            throw new AccessDeniedException("Sem permissão para ver relatórios");
        }

        if (from == null) from = OffsetDateTime.now().minusDays(30);
        if (to == null) to = OffsetDateTime.now();

        return getGovernanceMetricsUseCase.execute(user.tenantId(), from, to);
    }

    @Operation(summary = "Get technician metrics", description = "Retrieve specific SLA metrics for a technician")
    @GetMapping("/technicians/{id}/sla")
    public GovernanceMetrics getTechnicianMetrics(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {

        AuthenticatedUser user = SecurityContext.get();
        if (!user.hasPermission("REPORT_VIEW_ALL") && !user.userId().equals(id)) {
            throw new AccessDeniedException("Sem permissão para ver relatórios deste técnico");
        }

        if (from == null) from = OffsetDateTime.now().minusDays(30);
        if (to == null) to = OffsetDateTime.now();

        return getTechnicianMetricsUseCase.execute(user.tenantId(), id, from, to);
    }

    @Operation(summary = "Get technician ticket history", description = "Retrieve closed ticket history for a technician")
    @GetMapping("/technicians/{id}/tickets")
    public List<TechnicianTicketItem> getTechnicianTickets(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        AuthenticatedUser user = SecurityContext.get();
        if (!user.hasPermission("REPORT_VIEW_ALL") && !user.userId().equals(id)) {
            throw new AccessDeniedException("Sem permissão para ver histórico deste técnico");
        }

        if (from == null) from = OffsetDateTime.now().minusDays(30);
        if (to == null) to = OffsetDateTime.now();

        List<TicketSummary> summaries = getTechnicianTicketsUseCase.execute(user.tenantId(), id, from, to, page, size);
        return summaries.stream().map(s -> new TechnicianTicketItem(
            s.id(),
            s.title(),
            s.problemTypeName(),
            s.slaLevel(),
            s.openedAt() != null ? s.openedAt().toString() : null,
            s.closedAt() != null ? s.closedAt().toString() : null,
            s.closedAt() != null && s.slaDeadline() != null && !s.closedAt().isAfter(s.slaDeadline())
        )).toList();
    }

    @Operation(summary = "List SLA configurations", description = "Retrieve all SLA settings by problem type")
    @GetMapping("/sla/config")
    public List<SlaConfig> getSlaConfigs() {
        AuthenticatedUser user = SecurityContext.get();
        if (!user.hasPermission("SLA_CONFIG")) {
            throw new AccessDeniedException("Sem permissão para ver configurações de SLA");
        }
        return getSlaConfigsUseCase.execute();
    }

    @Operation(summary = "Update SLA configuration", description = "Update response and resolution times for a specific SLA config")
    @PutMapping("/sla/config/{id}")
    public SlaConfig updateSlaConfig(
            @PathVariable UUID id,
            @RequestBody SlaConfig request) {

        AuthenticatedUser user = SecurityContext.get();
        if (!user.hasPermission("SLA_CONFIG")) {
            throw new AccessDeniedException("Sem permissão para gerenciar configurações de SLA");
        }

        return updateSlaConfigUseCase.execute(id, request.getResponseMinutes(), request.getResolutionMinutes(), request.getNotifyManagerAtPercent());
    }
}
