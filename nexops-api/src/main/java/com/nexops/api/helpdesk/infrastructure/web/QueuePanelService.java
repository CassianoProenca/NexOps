package com.nexops.api.helpdesk.infrastructure.web;

import com.nexops.api.helpdesk.domain.model.Ticket;
import com.nexops.api.helpdesk.domain.model.TicketStatus;
import com.nexops.api.helpdesk.domain.ports.out.DepartmentRepository;
import com.nexops.api.helpdesk.domain.ports.out.ProblemTypeRepository;
import com.nexops.api.helpdesk.domain.ports.out.TicketRepository;
import com.nexops.api.helpdesk.infrastructure.web.dto.QueuePanelPayload;
import com.nexops.api.helpdesk.infrastructure.web.dto.TicketQueueItem;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

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

    @Scheduled(fixedDelay = 15_000)
    public void broadcastQueueState() {
        pushQueueUpdate();
    }

    public void pushQueueUpdate() {
        List<Ticket> openTickets = ticketRepository.findByStatus(TicketStatus.OPEN);
        List<Ticket> inProgressTickets = ticketRepository.findByStatus(TicketStatus.IN_PROGRESS);

        QueuePanelPayload payload = new QueuePanelPayload(
                openTickets.stream().map(this::toQueueItem).toList(),
                inProgressTickets.stream().map(this::toQueueItem).toList(),
                OffsetDateTime.now()
        );

        messagingTemplate.convertAndSend("/topic/queue-panel", payload);
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
