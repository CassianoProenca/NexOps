package com.nexops.api.helpdesk.infrastructure.web;

import com.nexops.api.helpdesk.domain.model.Ticket;
import com.nexops.api.helpdesk.domain.model.TicketStatus;
import com.nexops.api.helpdesk.domain.ports.out.DepartmentRepository;
import com.nexops.api.helpdesk.domain.ports.out.ProblemTypeRepository;
import com.nexops.api.helpdesk.domain.ports.out.QueueNotifier;
import com.nexops.api.helpdesk.domain.ports.out.TicketRepository;
import com.nexops.api.shared.security.SecurityContext;
import com.nexops.api.helpdesk.infrastructure.web.dto.QueuePanelPayload;
import com.nexops.api.helpdesk.infrastructure.web.dto.TicketQueueItem;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.tenant.domain.service.TenantRunner;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QueuePanelService implements QueueNotifier {

    private final TicketRepository ticketRepository;
    private final ProblemTypeRepository problemTypeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final TenantRunner tenantRunner;

    @Scheduled(fixedDelay = 15_000)
    public void broadcastQueueState() {
        tenantRunner.runForAllTenants(tenant -> {
            pushQueueUpdateForTenant(tenant.getId().toString());
        });
    }

    @Transactional(readOnly = true)
    public void pushQueueUpdateForTenant(String tenantId) {
        QueuePanelPayload payload = getQueuePanelState(UUID.fromString(tenantId));
        messagingTemplate.convertAndSend("/topic/" + tenantId + "/queue-panel", payload);
    }

    @Override
    public void notifyQueueUpdate() {
        var caller = SecurityContext.get();
        if (caller == null) return;
        pushQueueUpdateForTenant(caller.tenantId().toString());
    }

    public QueuePanelPayload getQueuePanelState() {
        var caller = SecurityContext.get();
        UUID tenantId = caller != null ? caller.tenantId() : null;
        return getQueuePanelState(tenantId);
    }

    private QueuePanelPayload getQueuePanelState(UUID tenantId) {
        if (tenantId == null) return new QueuePanelPayload(List.of(), List.of(), OffsetDateTime.now());
        List<Ticket> openTickets = ticketRepository.findByStatus(tenantId, TicketStatus.OPEN);
        List<Ticket> inProgressTickets = ticketRepository.findByStatus(tenantId, TicketStatus.IN_PROGRESS);

        return new QueuePanelPayload(
                openTickets.stream().map(this::toQueueItem).toList(),
                inProgressTickets.stream().map(this::toQueueItem).toList(),
                OffsetDateTime.now()
        );
    }

    private TicketQueueItem toQueueItem(Ticket t) {
        long minutesOpen = Duration.between(t.getOpenedAt(), OffsetDateTime.now()).toMinutes();

        String problemTypeName = problemTypeRepository.findById(t.getProblemTypeId())
                .map(pt -> pt.getName()).orElse("N/A");

        String departmentName = departmentRepository.findById(t.getDepartmentId())
                .map(d -> d.getName()).orElse("N/A");

        String assigneeName = null;
        if (t.getAssigneeId() != null) {
            assigneeName = userRepository.findById(t.getAssigneeId())
                    .map(u -> u.getName()).orElse("N/A");
        }

        return new TicketQueueItem(
                t.getId(),
                t.getTitle(),
                t.getStatus().name(),
                problemTypeName,
                departmentName,
                assigneeName,
                t.getOpenedAt(),
                minutesOpen,
                t.isSlaBreached()
        );
    }
}
