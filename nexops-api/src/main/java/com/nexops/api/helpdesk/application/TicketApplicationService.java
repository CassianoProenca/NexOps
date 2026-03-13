package com.nexops.api.helpdesk.application;

import com.nexops.api.helpdesk.domain.ports.out.*;
import com.nexops.api.helpdesk.domain.service.TicketService;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.tenant.domain.ports.in.SendEmailUseCase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TicketApplicationService extends TicketService {

    public TicketApplicationService(
            TicketRepository ticketRepository,
            ProblemTypeRepository problemTypeRepository,
            TicketCommentRepository commentRepository,
            QueueNotifier queueNotifier,
            UserRepository userRepository,
            SendEmailUseCase sendEmailUseCase) {
        super(ticketRepository, problemTypeRepository, commentRepository,
              queueNotifier, userRepository, sendEmailUseCase);
    }
}
