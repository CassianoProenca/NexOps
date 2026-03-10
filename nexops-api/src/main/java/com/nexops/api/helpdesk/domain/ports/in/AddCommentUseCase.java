package com.nexops.api.helpdesk.domain.ports.in;

import com.nexops.api.helpdesk.domain.model.TicketComment;
import java.util.UUID;

public interface AddCommentUseCase {
    TicketComment addComment(UUID ticketId, UUID authorId, String content);
}
