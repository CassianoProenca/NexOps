package com.nexops.api.helpdesk.domain.service;

import com.nexops.api.helpdesk.domain.model.*;
import com.nexops.api.helpdesk.domain.ports.in.*;
import com.nexops.api.helpdesk.domain.ports.out.*;
import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.security.SecurityContext;
import com.nexops.api.shared.tenant.domain.ports.in.SendEmailUseCase;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;
import java.util.UUID;

@Slf4j
public class TicketService implements
    CreateTicketUseCase, AttendNextUseCase, AssignTicketUseCase,
    PauseTicketUseCase, ResumeTicketUseCase, CloseTicketUseCase,
    CreateChildTicketUseCase, AddCommentUseCase {

    static final UUID SYSTEM_USER_ID = new UUID(0L, 0L);

    private final TicketRepository ticketRepository;
    private final ProblemTypeRepository problemTypeRepository;
    private final TicketCommentRepository commentRepository;
    private final QueueNotifier queueNotifier;
    private final UserRepository userRepository;
    private final SendEmailUseCase sendEmailUseCase;

    public TicketService(
            TicketRepository ticketRepository,
            ProblemTypeRepository problemTypeRepository,
            TicketCommentRepository commentRepository,
            QueueNotifier queueNotifier,
            UserRepository userRepository,
            SendEmailUseCase sendEmailUseCase) {
        this.ticketRepository = ticketRepository;
        this.problemTypeRepository = problemTypeRepository;
        this.commentRepository = commentRepository;
        this.queueNotifier = queueNotifier;
        this.userRepository = userRepository;
        this.sendEmailUseCase = sendEmailUseCase;
    }

    @Override
    public Ticket createTicket(String title, String description, UUID departmentId, UUID problemTypeId, UUID requesterId) {
        ProblemType problemType = problemTypeRepository.findById(problemTypeId)
                .orElseThrow(() -> new BusinessException("Tipo de problema não encontrado"));

        UUID tenantId = SecurityContext.get().tenantId();
        Ticket ticket = Ticket.open(title, description, departmentId, problemTypeId, requesterId, problemType.getSlaLevel(), tenantId);
        Ticket saved = ticketRepository.save(ticket);
        queueNotifier.notifyQueueUpdate();
        return saved;
    }

    @Override
    public Optional<Ticket> attendNext(UUID technicianId, UUID problemTypeId) {
        var openTickets = ticketRepository.findOpenByProblemTypeOrderByPriorityAndAge(problemTypeId);
        if (openTickets.isEmpty()) {
            return Optional.empty();
        }

        Ticket ticket = openTickets.get(0);
        ticket.assignTo(technicianId);

        TicketComment comment = TicketComment.systemEvent(ticket.getId(), technicianId, "Chamado assumido via Atender Próximo", CommentType.ASSIGNMENT);

        Ticket savedAttend = ticketRepository.save(ticket);
        commentRepository.save(comment);

        queueNotifier.notifyQueueUpdate();
        sendAssignmentEmail(savedAttend, technicianId);

        return Optional.of(savedAttend);
    }

    @Override
    public Ticket assignTicket(UUID ticketId, UUID technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BusinessException("Chamado não encontrado"));

        ticket.assignTo(technicianId);
        TicketComment comment = TicketComment.systemEvent(ticketId, technicianId, "Chamado atribuído", CommentType.ASSIGNMENT);

        commentRepository.save(comment);
        Ticket saved = ticketRepository.save(ticket);
        queueNotifier.notifyQueueUpdate();
        sendAssignmentEmail(saved, technicianId);
        return saved;
    }

    @Override
    public Ticket pauseTicket(UUID ticketId, String reason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BusinessException("Chamado não encontrado"));

        ticket.pause(reason);
        TicketComment comment = TicketComment.systemEvent(ticketId, SYSTEM_USER_ID, "Chamado pausado: " + reason, CommentType.PAUSE);

        commentRepository.save(comment);
        Ticket saved = ticketRepository.save(ticket);
        queueNotifier.notifyQueueUpdate();
        return saved;
    }

    @Override
    public Ticket resumeTicket(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BusinessException("Chamado não encontrado"));

        ticket.resume();
        TicketComment comment = TicketComment.systemEvent(ticketId, SYSTEM_USER_ID, "Chamado retomado", CommentType.STATUS_CHANGE);

        commentRepository.save(comment);
        Ticket saved = ticketRepository.save(ticket);
        queueNotifier.notifyQueueUpdate();
        return saved;
    }

    @Override
    public Ticket closeTicket(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BusinessException("Chamado não encontrado"));

        var children = ticketRepository.findChildTickets(ticketId);
        boolean allClosed = children.stream().allMatch(t -> t.getStatus() == TicketStatus.CLOSED);
        if (!allClosed) {
            throw new BusinessException("Todos os chamados filhos devem ser finalizados primeiro");
        }

        ticket.close();
        TicketComment comment = TicketComment.systemEvent(ticketId, SYSTEM_USER_ID, "Chamado finalizado", CommentType.STATUS_CHANGE);

        commentRepository.save(comment);
        Ticket saved = ticketRepository.save(ticket);
        queueNotifier.notifyQueueUpdate();
        return saved;
    }

    @Override
    public Ticket createChildTicket(UUID parentTicketId, String title, String description, UUID problemTypeId, UUID requesterId) {
        Ticket parent = ticketRepository.findById(parentTicketId)
                .orElseThrow(() -> new BusinessException("Chamado pai não encontrado"));

        ProblemType problemType = problemTypeRepository.findById(problemTypeId)
                .orElseThrow(() -> new BusinessException("Tipo de problema não encontrado"));

        Ticket child = Ticket.child(parentTicketId, title, description, parent.getDepartmentId(), problemTypeId, requesterId, problemType.getSlaLevel(), parent.getTenantId());
        Ticket savedChild = ticketRepository.save(child);

        TicketComment comment = TicketComment.systemEvent(parentTicketId, requesterId, "Chamado filho criado: " + savedChild.getId(), CommentType.SYSTEM);
        commentRepository.save(comment);

        queueNotifier.notifyQueueUpdate();

        return savedChild;
    }

    @Override
    public TicketComment addComment(UUID ticketId, UUID authorId, String content) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BusinessException("Chamado não encontrado"));

        TicketComment comment = TicketComment.message(ticketId, authorId, content);
        return commentRepository.save(comment);
    }

    // ── Email helper ─────────────────────────────────────────────────────────

    private void sendAssignmentEmail(Ticket ticket, UUID technicianId) {
        var caller = SecurityContext.get();
        if (caller == null) return;
        try {
            userRepository.findById(technicianId).ifPresent(tech -> {
                String html = """
                        <div style="font-family:sans-serif;max-width:520px;margin:auto">
                          <h2 style="color:#2563eb">Novo chamado atribuído a você</h2>
                          <p>Olá, <strong>%s</strong>.</p>
                          <p>Um chamado foi atribuído para você no NexOps:</p>
                          <table style="border:1px solid #e4e4e7;border-radius:8px;padding:16px;background:#fafafa;width:100%%">
                            <tr><td style="color:#71717a;font-size:13px;padding:4px 8px">Título</td><td style="padding:4px 8px"><strong>%s</strong></td></tr>
                            <tr><td style="color:#71717a;font-size:13px;padding:4px 8px">SLA</td><td style="padding:4px 8px"><strong>%s</strong></td></tr>
                          </table>
                          <p style="font-size:13px;color:#71717a;margin-top:24px">Acesse o sistema para ver os detalhes e iniciar o atendimento.</p>
                        </div>
                        """.formatted(tech.getName(), ticket.getTitle(), ticket.getSlaLevel().name());
                sendEmailUseCase.send(caller.tenantId(), tech.getEmail(), "NexOps — Chamado atribuído: " + ticket.getTitle(), html);
            });
        } catch (Exception e) {
            log.warn("Falha ao enviar e-mail de atribuição para técnico {}: {}", technicianId, e.getMessage());
        }
    }
}
