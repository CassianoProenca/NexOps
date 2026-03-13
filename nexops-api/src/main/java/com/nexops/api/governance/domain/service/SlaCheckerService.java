package com.nexops.api.governance.domain.service;

import com.nexops.api.governance.domain.model.SlaBreachEvent;
import com.nexops.api.governance.domain.ports.out.GovernanceTicketQueryPort;
import com.nexops.api.governance.domain.ports.out.SlaBreachEventRepository;
import com.nexops.api.helpdesk.domain.ports.out.TicketRepository;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.tenant.domain.ports.in.SendEmailUseCase;
import com.nexops.api.shared.tenant.domain.service.TenantRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SlaCheckerService {

    private final GovernanceTicketQueryPort ticketQueryPort;
    private final SlaBreachEventRepository breachEventRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final SendEmailUseCase sendEmailUseCase;
    private final TenantRunner tenantRunner;

    @Scheduled(fixedDelay = 60_000)
    public void checkSlaBreaches() {
        tenantRunner.runForAllTenants(tenant -> processSlaForCurrentTenant(tenant.getId()));
    }

    @Transactional
    public void processSlaForCurrentTenant(UUID tenantId) {
        // Bug #2 fix: pass tenantId to findBreachedTickets
        var breachedIds = ticketQueryPort.findBreachedTickets(tenantId);

        for (UUID ticketId : breachedIds) {
            var existingBreaches = breachEventRepository.findByTicketId(tenantId, ticketId);
            boolean alreadyRecorded = existingBreaches.stream()
                    .anyMatch(b -> b.getBreachType() == SlaBreachEvent.BreachType.RESOLUTION_BREACH);

            if (!alreadyRecorded) {
                ticketRepository.findById(ticketId).ifPresent(ticket -> {
                    SlaBreachEvent breach = SlaBreachEvent.record(ticketId, SlaBreachEvent.BreachType.RESOLUTION_BREACH, ticket.getSlaDeadline());
                    breachEventRepository.save(breach);
                });
            }
        }

        // Bug #2 fix: pass tenantId to findTicketsNearingSlaDeadline
        var nearingIds = ticketQueryPort.findTicketsNearingSlaDeadline(tenantId, 60);
        for (UUID ticketId : nearingIds) {
            boolean alreadyWarned = breachEventRepository.findByTicketId(tenantId, ticketId).stream()
                    .anyMatch(b -> b.getBreachType() == SlaBreachEvent.BreachType.SLA_WARNING);
            if (!alreadyWarned) {
                ticketRepository.findById(ticketId).ifPresent(ticket -> {
                    SlaBreachEvent warning = SlaBreachEvent.record(ticketId, SlaBreachEvent.BreachType.SLA_WARNING, ticket.getSlaDeadline());
                    breachEventRepository.save(warning);
                    if (ticket.getAssigneeId() != null) {
                        sendSlaWarningEmail(tenantId, ticket.getId(), ticket.getTitle(), ticket.getSlaDeadline(), ticket.getAssigneeId());
                    }
                });
            }
        }
    }

    // ── Scheduled: weekly report every Monday at 08:00 ───────────────────────

    @Scheduled(cron = "0 0 8 * * MON")
    public void sendWeeklyReports() {
        tenantRunner.runForAllTenants(tenant -> {
            try {
                var allUsers = userRepository.findAllByTenantId(tenant.getId());
                var gestores = allUsers.stream()
                        .filter(u -> u.resolvedPermissions().contains("REPORT_VIEW_ALL"))
                        .toList();

                if (gestores.isEmpty()) return;

                var from = OffsetDateTime.now().minusDays(7);
                var to   = OffsetDateTime.now();
                int total    = ticketQueryPort.countBetween(tenant.getId(), from, to);
                int closed   = ticketQueryPort.countByStatusBetween(tenant.getId(), "CLOSED", from, to);
                // Bug #4 fix: use countBreachesBetween instead of findBreachedTickets().size()
                int breached = breachEventRepository.countBreachesBetween(tenant.getId(), from, to);

                for (var gestor : gestores) {
                    try {
                        String html = """
                                <div style="font-family:sans-serif;max-width:560px;margin:auto">
                                  <h2 style="color:#2563eb">Relatório Semanal — NexOps</h2>
                                  <p>Olá, <strong>%s</strong>. Aqui está o resumo da última semana:</p>
                                  <table style="border:1px solid #e4e4e7;border-radius:8px;padding:16px;background:#fafafa;width:100%%;border-collapse:collapse">
                                    <tr><td style="padding:8px 12px;color:#71717a;font-size:13px">Total de chamados abertos</td><td style="padding:8px 12px"><strong>%d</strong></td></tr>
                                    <tr style="background:#f4f4f5"><td style="padding:8px 12px;color:#71717a;font-size:13px">Chamados finalizados</td><td style="padding:8px 12px"><strong>%d</strong></td></tr>
                                    <tr><td style="padding:8px 12px;color:#71717a;font-size:13px">Violações de SLA</td><td style="padding:8px 12px;color:%s"><strong>%d</strong></td></tr>
                                  </table>
                                  <p style="font-size:13px;color:#71717a;margin-top:24px">
                                    Acesse o painel de governança para detalhes completos.
                                  </p>
                                </div>
                                """.formatted(
                                gestor.getName(), total, closed,
                                breached > 0 ? "#dc2626" : "#16a34a", breached
                        );
                        sendEmailUseCase.send(tenant.getId(), gestor.getEmail(), "NexOps — Relatório Semanal", html);
                    } catch (Exception e) {
                        log.warn("Falha ao enviar relatório semanal para {}: {}", gestor.getEmail(), e.getMessage());
                    }
                }
            } catch (Exception e) {
                log.warn("Falha ao processar relatório semanal para tenant {}: {}", tenant.getId(), e.getMessage());
            }
        });
    }

    // ── Helper ───────────────────────────────────────────────────────────────

    private void sendSlaWarningEmail(UUID tenantId, UUID ticketId, String title, OffsetDateTime deadline, UUID assigneeId) {
        try {
            userRepository.findById(assigneeId).ifPresent(tech -> {
                String html = """
                        <div style="font-family:sans-serif;max-width:520px;margin:auto">
                          <h2 style="color:#d97706">⚠️ Alerta de SLA Crítico</h2>
                          <p>Olá, <strong>%s</strong>.</p>
                          <p>O chamado abaixo está próximo de violar o prazo de SLA:</p>
                          <table style="border:1px solid #fcd34d;border-radius:8px;padding:16px;background:#fffbeb;width:100%%">
                            <tr><td style="color:#71717a;font-size:13px;padding:4px 8px">Chamado</td><td style="padding:4px 8px"><strong>%s</strong></td></tr>
                            <tr><td style="color:#71717a;font-size:13px;padding:4px 8px">Prazo</td><td style="padding:4px 8px;color:#d97706"><strong>%s</strong></td></tr>
                          </table>
                          <p style="font-size:13px;color:#71717a;margin-top:24px">Acesse o sistema imediatamente para evitar a violação.</p>
                        </div>
                        """.formatted(tech.getName(), title, deadline != null ? deadline.toString() : "indefinido");
                sendEmailUseCase.send(tenantId, tech.getEmail(), "NexOps — ⚠️ SLA Crítico: " + title, html);
            });
        } catch (Exception e) {
            log.warn("Falha ao enviar alerta SLA para ticket {}: {}", ticketId, e.getMessage());
        }
    }
}
