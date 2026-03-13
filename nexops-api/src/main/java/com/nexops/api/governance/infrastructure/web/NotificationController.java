package com.nexops.api.governance.infrastructure.web;

import com.nexops.api.governance.domain.model.SlaNotification;
import com.nexops.api.governance.domain.ports.out.SlaNotificationRepository;
import com.nexops.api.shared.security.AuthenticatedUser;
import com.nexops.api.shared.security.SecurityContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/governance/notifications")
@RequiredArgsConstructor
@Tag(name = "Governance Notifications", description = "SLA Alerts and Notifications")
public class NotificationController {

    private final SlaNotificationRepository notificationRepository;

    @Operation(summary = "List all notifications for the current user")
    @GetMapping
    public List<SlaNotification> getMyNotifications() {
        AuthenticatedUser user = SecurityContext.get();
        return notificationRepository.findByRecipientId(user.userId());
    }

    @Operation(summary = "Mark notification as read")
    @PostMapping("/{id}/read")
    public void markAsRead(@PathVariable UUID id) {
        // Simple direct repository update for speed, ideally should be a UseCase
        notificationRepository.findById(id).ifPresent(n -> {
            n.markRead();
            notificationRepository.save(n);
        });
    }

    @Operation(summary = "Mark all notifications as read")
    @PostMapping("/read-all")
    public void markAllAsRead() {
        AuthenticatedUser user = SecurityContext.get();
        List<SlaNotification> unread = notificationRepository.findUnreadByRecipientId(user.userId());
        for (SlaNotification n : unread) {
            n.markRead();
            notificationRepository.save(n);
        }
    }
}
