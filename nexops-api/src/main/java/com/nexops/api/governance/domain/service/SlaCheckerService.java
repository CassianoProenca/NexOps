package com.nexops.api.governance.domain.service;

import com.nexops.api.governance.domain.model.SlaBreachEvent;
import com.nexops.api.governance.domain.model.SlaNotification;
import com.nexops.api.governance.domain.ports.out.GovernanceTicketQueryPort;
import com.nexops.api.governance.domain.ports.out.SlaBreachEventRepository;
import com.nexops.api.governance.domain.ports.out.SlaNotificationRepository;
import com.nexops.api.helpdesk.domain.ports.out.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SlaCheckerService {

    private final GovernanceTicketQueryPort ticketQueryPort;
    private final SlaBreachEventRepository breachEventRepository;
    private final SlaNotificationRepository notificationRepository;
    private final TicketRepository ticketRepository;

    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void checkSlaBreaches() {
        // 1. findBreachedTickets() — tickets past slaDeadline, not closed
        var breachedIds = ticketQueryPort.findBreachedTickets();
        
        for (UUID ticketId : breachedIds) {
            var existingBreaches = breachEventRepository.findByTicketId(ticketId);
            boolean alreadyRecorded = existingBreaches.stream()
                    .anyMatch(b -> b.getBreachType() == SlaBreachEvent.BreachType.RESOLUTION_BREACH);
            
            if (!alreadyRecorded) {
                ticketRepository.findById(ticketId).ifPresent(ticket -> {
                    SlaBreachEvent breach = SlaBreachEvent.record(ticketId, SlaBreachEvent.BreachType.RESOLUTION_BREACH, ticket.getSlaDeadline());
                    breachEventRepository.save(breach);
                    
                    // Save SlaNotification for the manager (recipientId = null for now as per TODO)
                    // In a real scenario, we'd find the manager's ID
                    // SlaNotification notification = SlaNotification.create(ticketId, managerId, SlaNotification.NotificationType.SLA_BREACH, SlaNotification.NotificationChannel.IN_APP);
                    // notificationRepository.save(notification);
                });
            }
        }

        // 5. findTicketsNearingSlaDeadline(30) — within 30 minutes
        var nearingIds = ticketQueryPort.findTicketsNearingSlaDeadline(30);
        for (UUID ticketId : nearingIds) {
            // Logic to send SLA_WARNING if not already sent today
            // Simplified for now: just log or save if no notification exists for today
            // SlaNotification notification = SlaNotification.create(ticketId, technicianId, SlaNotification.NotificationType.SLA_WARNING, SlaNotification.NotificationChannel.IN_APP);
            // notificationRepository.save(notification);
        }
    }
}
