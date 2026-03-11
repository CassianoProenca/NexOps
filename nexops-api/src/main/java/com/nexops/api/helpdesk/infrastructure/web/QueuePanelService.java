package com.nexops.api.helpdesk.infrastructure.web;

import com.nexops.api.helpdesk.domain.model.Ticket;
import com.nexops.api.helpdesk.domain.model.TicketStatus;
import com.nexops.api.helpdesk.domain.ports.out.DepartmentRepository;
import com.nexops.api.helpdesk.domain.ports.out.ProblemTypeRepository;
import com.nexops.api.helpdesk.domain.ports.out.TicketRepository;
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

@Service
@RequiredArgsConstructor
public class QueuePanelService {

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
        QueuePanelPayload payload = getQueuePanelState();
        messagingTemplate.convertAndSend("/topic/" + tenantId + "/queue-panel", payload);
    }

    public void pushQueueUpdate() {
        // No-op: tenant context no longer uses TenantContext slug
    }

    public QueuePanelPayload getQueuePanelState() {
        List<Ticket> openTickets = ticketRepository.findByStatus(TicketStatus.OPEN);
        List<Ticket> inProgressTickets = ticketRepository.findByStatus(TicketStatus.IN_PROGRESS);

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
