package com.nexops.api.helpdesk.infrastructure.web;

import com.nexops.api.helpdesk.domain.model.TicketComment;
import com.nexops.api.helpdesk.domain.model.TicketStatus;
import com.nexops.api.helpdesk.domain.ports.in.AddCommentUseCase;
import com.nexops.api.helpdesk.domain.ports.out.TicketRepository;
import com.nexops.api.helpdesk.infrastructure.web.dto.ChatMessageRequest;
import com.nexops.api.helpdesk.infrastructure.web.dto.ChatMessageResponse;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.exception.BusinessException;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Tag(name = "Tickets Chat", description = "Real-time chat for tickets (WebSocket)")
public class TicketChatController {

    private final AddCommentUseCase addCommentUseCase;
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    @MessageMapping("/ticket/{ticketId}/chat")
    @SendTo("/topic/ticket/{ticketId}/chat")
    public ChatMessageResponse sendMessage(
            @DestinationVariable UUID ticketId,
            @Payload ChatMessageRequest request,
            Principal principal
    ) {
        UUID authorId = UUID.fromString(principal.getName());
        
        var ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BusinessException("Chamado não encontrado"));

        // Regra 1: Não permitir chat em chamados finalizados
        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BusinessException("Não é permitido enviar mensagens em chamados finalizados");
        }

        // Regra 2: Solicitante só fala se houver técnico atribuído (Anti-flood)
        if (authorId.equals(ticket.getRequesterId()) && ticket.getAssigneeId() == null) {
            throw new BusinessException("Aguarde um técnico assumir o chamado para iniciar a conversa");
        }

        TicketComment comment = addCommentUseCase.addComment(ticket.getTenantId(), ticketId, authorId, request.content());
        
        String authorName = userRepository.findById(authorId)
                .map(user -> user.getName())
                .orElse("Sistema");

        return new ChatMessageResponse(
                comment.getId(),
                comment.getTicketId(),
                comment.getAuthorId(),
                authorName,
                comment.getContent(),
                comment.getType().name(),
                comment.getCreatedAt()
        );
    }
}
