package com.nexops.api.helpdesk.domain.service;

import com.nexops.api.helpdesk.domain.model.*;
import com.nexops.api.helpdesk.domain.ports.in.*;
import com.nexops.api.helpdesk.domain.ports.out.*;
import com.nexops.api.helpdesk.infrastructure.web.QueuePanelService;
import com.nexops.api.shared.exception.BusinessException;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class TicketService implements 
    CreateTicketUseCase, AttendNextUseCase, AssignTicketUseCase,
    PauseTicketUseCase, ResumeTicketUseCase, CloseTicketUseCase,
    CreateChildTicketUseCase, AddCommentUseCase {

    private final TicketRepository ticketRepository;
    private final ProblemTypeRepository problemTypeRepository;
    private final TicketCommentRepository commentRepository;
    private final QueuePanelService queuePanelService;

    public TicketService(
            TicketRepository ticketRepository,
            ProblemTypeRepository problemTypeRepository,
            TicketCommentRepository commentRepository,
            @Lazy QueuePanelService queuePanelService) {
        this.ticketRepository = ticketRepository;
        this.problemTypeRepository = problemTypeRepository;
        this.commentRepository = commentRepository;
        this.queuePanelService = queuePanelService;
    }

    @Override
    @Transactional
    public Ticket createTicket(String title, String description, UUID departmentId, UUID problemTypeId, UUID requesterId) {
        ProblemType problemType = problemTypeRepository.findById(problemTypeId)
                .orElseThrow(() -> new BusinessException("Tipo de problema não encontrado"));
        
        Ticket ticket = Ticket.open(title, description, departmentId, problemTypeId, requesterId, problemType.getSlaLevel());
        Ticket saved = ticketRepository.save(ticket);
        queuePanelService.pushQueueUpdate();
        return saved;
    }

    @Override
    @Transactional
    public Optional<Ticket> attendNext(UUID technicianId, UUID problemTypeId) {
        var openTickets = ticketRepository.findOpenByProblemTypeOrderByPriorityAndAge(problemTypeId);
        if (openTickets.isEmpty()) {
            return Optional.empty();
        }
        
        Ticket ticket = openTickets.get(0);
        ticket.assignTo(technicianId);
        
        TicketComment comment = TicketComment.systemEvent(ticket.getId(), technicianId, "Chamado assumido via Atender Próximo", CommentType.ASSIGNMENT);
        
        ticketRepository.save(ticket);
        commentRepository.save(comment);
        
        queuePanelService.pushQueueUpdate();
        
        return Optional.of(ticket);
    }

    @Override
    @Transactional
    public Ticket assignTicket(UUID ticketId, UUID technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BusinessException("Chamado não encontrado"));
        
        ticket.assignTo(technicianId);
        TicketComment comment = TicketComment.systemEvent(ticketId, technicianId, "Chamado atribuído", CommentType.ASSIGNMENT);
        
        commentRepository.save(comment);
        Ticket saved = ticketRepository.save(ticket);
        queuePanelService.pushQueueUpdate();
        return saved;
    }

    @Override
    @Transactional
    public Ticket pauseTicket(UUID ticketId, String reason) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BusinessException("Chamado não encontrado"));
        
        ticket.pause(reason);
        TicketComment comment = TicketComment.systemEvent(ticketId, UUID.randomUUID(), "Chamado pausado: " + reason, CommentType.PAUSE);
        
        commentRepository.save(comment);
        Ticket saved = ticketRepository.save(ticket);
        queuePanelService.pushQueueUpdate();
        return saved;
    }

    @Override
    @Transactional
    public Ticket resumeTicket(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BusinessException("Chamado não encontrado"));
        
        ticket.resume();
        TicketComment comment = TicketComment.systemEvent(ticketId, UUID.randomUUID(), "Chamado retomado", CommentType.STATUS_CHANGE);
        
        commentRepository.save(comment);
        Ticket saved = ticketRepository.save(ticket);
        queuePanelService.pushQueueUpdate();
        return saved;
    }

    @Override
    @Transactional
    public Ticket closeTicket(UUID ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BusinessException("Chamado não encontrado"));
        
        var children = ticketRepository.findChildTickets(ticketId);
        boolean allClosed = children.stream().allMatch(t -> t.getStatus() == TicketStatus.CLOSED);
        if (!allClosed) {
            throw new BusinessException("Todos os chamados filhos devem ser finalizados primeiro");
        }
        
        ticket.close();
        TicketComment comment = TicketComment.systemEvent(ticketId, UUID.randomUUID(), "Chamado finalizado", CommentType.STATUS_CHANGE);
        
        commentRepository.save(comment);
        Ticket saved = ticketRepository.save(ticket);
        queuePanelService.pushQueueUpdate();
        return saved;
    }

    @Override
    @Transactional
    public Ticket createChildTicket(UUID parentTicketId, String title, String description, UUID problemTypeId, UUID requesterId) {
        Ticket parent = ticketRepository.findById(parentTicketId)
                .orElseThrow(() -> new BusinessException("Chamado pai não encontrado"));
        
        ProblemType problemType = problemTypeRepository.findById(problemTypeId)
                .orElseThrow(() -> new BusinessException("Tipo de problema não encontrado"));
        
        Ticket child = Ticket.child(parentTicketId, title, description, parent.getDepartmentId(), problemTypeId, requesterId, problemType.getSlaLevel());
        Ticket savedChild = ticketRepository.save(child);
        
        TicketComment comment = TicketComment.systemEvent(parentTicketId, requesterId, "Chamado filho criado: " + savedChild.getId(), CommentType.SYSTEM);
        commentRepository.save(comment);
        
        queuePanelService.pushQueueUpdate();
        
        return savedChild;
    }

    @Override
    @Transactional
    public TicketComment addComment(UUID ticketId, UUID authorId, String content) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BusinessException("Chamado não encontrado"));
        
        TicketComment comment = TicketComment.message(ticketId, authorId, content);
        return commentRepository.save(comment);
    }
}
