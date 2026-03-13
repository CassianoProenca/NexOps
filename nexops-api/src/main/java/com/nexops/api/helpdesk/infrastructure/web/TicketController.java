package com.nexops.api.helpdesk.infrastructure.web;

import com.nexops.api.helpdesk.domain.model.Ticket;
import com.nexops.api.helpdesk.domain.model.TicketComment;
import com.nexops.api.helpdesk.domain.model.TicketStatus;
import com.nexops.api.helpdesk.domain.ports.in.*;
import com.nexops.api.helpdesk.domain.ports.out.TicketCommentRepository;
import com.nexops.api.helpdesk.domain.ports.out.TicketRepository;
import com.nexops.api.helpdesk.infrastructure.web.dto.*;
import com.nexops.api.shared.exception.BusinessException;
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
@RequestMapping("/v1/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Ticket lifecycle management")
@lombok.extern.slf4j.Slf4j
public class TicketController {

    private final CreateTicketUseCase createTicketUseCase;
    private final AttendNextUseCase attendNextUseCase;
    private final AssignTicketUseCase assignTicketUseCase;
    private final PauseTicketUseCase pauseTicketUseCase;
    private final ResumeTicketUseCase resumeTicketUseCase;
    private final CloseTicketUseCase closeTicketUseCase;
    private final CreateChildTicketUseCase createChildTicketUseCase;
    private final AddCommentUseCase addCommentUseCase;
    private final QueuePanelService queuePanelService;
    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;

    @Operation(summary = "Get current queue panel state", description = "Retrieve open and in-progress tickets for the TV panel")
    @GetMapping("/queue-panel")
    public QueuePanelPayload getQueuePanel() {
        return queuePanelService.getQueuePanelState();
    }

    @Operation(summary = "List all tickets", description = "Admin/Manager only: List all tickets for the tenant")
    @GetMapping
    public List<TicketSummaryResponse> listAll() {
        AuthenticatedUser user = SecurityContext.get();
        if (!user.hasPermission("TICKET_VIEW_ALL")) {
            throw new AccessDeniedException("Sem permissão para visualizar todos os chamados");
        }
        return ticketRepository.findAll().stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Operation(summary = "List my tickets", description = "List tickets where caller is the requester")
    @GetMapping("/my")
    public List<TicketSummaryResponse> listMy() {
        AuthenticatedUser user = SecurityContext.get();
        return ticketRepository.findByRequesterId(user.tenantId(), user.userId()).stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Operation(summary = "List assigned tickets", description = "List tickets assigned to the caller")
    @GetMapping("/assigned")
    public List<TicketSummaryResponse> listAssigned() {
        AuthenticatedUser user = SecurityContext.get();
        return ticketRepository.findByAssigneeId(user.tenantId(), user.userId()).stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Operation(summary = "Get ticket details", description = "Retrieve a single ticket by ID")
    @GetMapping("/{id}")
    public TicketResponse getById(@PathVariable UUID id) {
        return ticketRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new BusinessException("Chamado não encontrado"));
    }

    @Operation(summary = "Get tickets in queue by type", description = "List open tickets for a specific problem type")
    @GetMapping("/queue/{problemTypeId}")
    public List<TicketSummaryResponse> getQueue(@PathVariable UUID problemTypeId) {
        AuthenticatedUser user = SecurityContext.get();
        return ticketRepository.findByProblemTypeIdAndStatus(user.tenantId(), problemTypeId, TicketStatus.OPEN).stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Operation(summary = "Create new ticket", description = "Open a new support request")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse create(@RequestBody @Valid CreateTicketRequest request) {
        AuthenticatedUser user = SecurityContext.get();
        if (!user.hasPermission("TICKET_CREATE")) {
            throw new AccessDeniedException("Sem permissão para abrir chamados");
        }
        Ticket ticket = createTicketUseCase.createTicket(
                request.title(), request.description(),
                request.departmentId(), request.problemTypeId(), user.userId()
        );
        return toResponse(ticket);
    }

    @Operation(summary = "Attend next ticket", description = "Automatically assign the highest priority/oldest ticket in the queue")
    @PostMapping("/attend")
    public TicketResponse attendNext(@RequestBody @Valid AttendNextRequest request) {
        AuthenticatedUser user = SecurityContext.get();
        if (!user.hasPermission("TICKET_ATTEND")) {
            throw new AccessDeniedException("Sem permissão para atender chamados");
        }
        return attendNextUseCase.attendNext(user.userId(), request.problemTypeId())
                .map(this::toResponse)
                .orElseThrow(() -> new BusinessException("Nenhum chamado na fila"));
    }

    @Operation(summary = "Assign ticket", description = "Manually assign a ticket to a technician")
    @PostMapping("/{id}/assign")
    public TicketResponse assign(@PathVariable UUID id, @RequestBody @Valid AssignRequest request) {
        AuthenticatedUser user = SecurityContext.get();
        if (!user.hasPermission("TICKET_ASSIGN")) {
            throw new AccessDeniedException("Sem permissão para atribuir chamados");
        }
        Ticket ticket = assignTicketUseCase.assignTicket(id, request.technicianId());
        return toResponse(ticket);
    }

    @Operation(summary = "Pause ticket", description = "Temporarily pause work on a ticket")
    @PostMapping("/{id}/pause")
    public TicketResponse pause(@PathVariable UUID id, @RequestBody @Valid PauseRequest request) {
        try {
            AuthenticatedUser user = SecurityContext.get();
            if (!user.hasPermission("TICKET_PAUSE")) {
                throw new AccessDeniedException("Sem permissão para pausar chamados");
            }
            Ticket ticket = pauseTicketUseCase.pauseTicket(id, user.userId(), request.reason());
            return toResponse(ticket);
        } catch (Exception e) {
            log.error("Error pausing ticket {}: {}", id, e.getMessage());
            throw e;
        }
    }

    @Operation(summary = "Resume ticket", description = "Resume work on a paused ticket")
    @PostMapping("/{id}/resume")
    public TicketResponse resume(@PathVariable UUID id) {
        try {
            AuthenticatedUser user = SecurityContext.get();
            if (!user.hasPermission("TICKET_PAUSE")) {
                throw new AccessDeniedException("Sem permissão para retomar chamados");
            }
            Ticket ticket = resumeTicketUseCase.resumeTicket(id, user.userId());
            return toResponse(ticket);
        } catch (Exception e) {
            log.error("Error resuming ticket {}: {}", id, e.getMessage());
            throw e;
        }
    }

    @Operation(summary = "Close ticket", description = "Finalize a ticket")
    @PostMapping("/{id}/close")
    public TicketResponse close(@PathVariable UUID id, @RequestBody @Valid CloseTicketRequest request) {
        try {
            AuthenticatedUser user = SecurityContext.get();
            if (!user.hasPermission("TICKET_CLOSE")) {
                throw new AccessDeniedException("Sem permissão para finalizar chamados");
            }
            Ticket ticket = closeTicketUseCase.closeTicket(id, user.userId(), request.resolution());
            return toResponse(ticket);
        } catch (Exception e) {
            log.error("Error closing ticket {}: {}", id, e.getMessage());
            throw e;
        }
    }

    @Operation(summary = "Create child ticket", description = "Create a new ticket related to a parent ticket")
    @PostMapping("/{id}/child")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse createChild(@PathVariable UUID id, @RequestBody @Valid CreateTicketRequest request) {
        AuthenticatedUser user = SecurityContext.get();
        Ticket ticket = createChildTicketUseCase.createChildTicket(id, request.title(), request.description(), request.problemTypeId(), user.userId());
        return toResponse(ticket);
    }

    @Operation(summary = "List ticket comments", description = "Retrieve chat messages and timeline events for a ticket")
    @GetMapping("/{id}/comments")
    public List<CommentResponse> listComments(@PathVariable UUID id) {
        return commentRepository.findByTicketId(id).stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList());
    }

    @Operation(summary = "Add comment", description = "Send a new chat message to a ticket")
    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse addComment(@PathVariable UUID id, @RequestBody @Valid AddCommentRequest request) {
        AuthenticatedUser user = SecurityContext.get();
        TicketComment comment = addCommentUseCase.addComment(user.tenantId(), id, user.userId(), request.content());
        return toCommentResponse(comment);
    }

    private TicketResponse toResponse(Ticket t) {
        return new TicketResponse(
                t.getId(), t.getTitle(), t.getDescription(), t.getStatus().name(),
                t.getInternalPriority().name(), t.getSlaLevel().name(), t.getDepartmentId(),
                t.getProblemTypeId(), t.getRequesterId(), t.getAssigneeId(),
                t.getParentTicketId(), t.getPauseReason(), t.getResolution(), t.getOpenedAt(),
                t.getAssignedAt(), t.getPausedAt(), t.getClosedAt(),
                t.getSlaDeadline(), t.isSlaBreached(), t.getCreatedAt(), t.getUpdatedAt()
        );
    }

    private TicketSummaryResponse toSummaryResponse(Ticket t) {
        return new TicketSummaryResponse(
                t.getId(), t.getTitle(), t.getStatus().name(), t.getSlaLevel().name(),
                t.getDepartmentId(), t.getProblemTypeId(), t.getRequesterId(),
                t.getAssigneeId(), t.getOpenedAt(), t.getSlaDeadline(), t.isSlaBreached(),
                t.getPauseReason()
        );
    }

    private CommentResponse toCommentResponse(TicketComment c) {
        return new CommentResponse(
                c.getId(), c.getTicketId(), c.getAuthorId(), c.getContent(),
                c.getType().name(), c.getCreatedAt()
        );
    }
}
