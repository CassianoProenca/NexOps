package com.nexops.api.helpdesk.application;

import com.nexops.api.helpdesk.domain.model.TicketAttachment;
import com.nexops.api.helpdesk.domain.ports.out.TicketAttachmentRepository;
import com.nexops.api.shared.security.SecurityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketAttachmentService {

    private final TicketAttachmentRepository attachmentRepository;

    @Value("${nexops.uploads.dir:uploads}")
    private String uploadsDir;

    @Transactional
    public TicketAttachment upload(UUID ticketId, MultipartFile file) throws IOException {
        var caller = SecurityContext.get();
        if (caller == null) throw new RuntimeException("Não autenticado");

        String originalFilename = file.getOriginalFilename() != null
                ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._\\-]", "_")
                : "arquivo";

        UUID attachmentId = UUID.randomUUID();
        String storageKey = ticketId + "/" + attachmentId + "_" + originalFilename;

        Path targetDir  = Paths.get(uploadsDir, ticketId.toString());
        Path targetFile = Paths.get(uploadsDir, storageKey);
        Files.createDirectories(targetDir);
        Files.copy(file.getInputStream(), targetFile);

        TicketAttachment attachment = TicketAttachment.create(
                ticketId,
                caller.userId(),
                originalFilename,
                storageKey,
                file.getSize(),
                file.getContentType()
        );
        return attachmentRepository.save(attachment);
    }

    @Transactional(readOnly = true)
    public List<TicketAttachment> listByTicket(UUID ticketId) {
        return attachmentRepository.findByTicketId(ticketId);
    }

    @Transactional(readOnly = true)
    public Optional<TicketAttachment> findById(UUID id) {
        return attachmentRepository.findById(id);
    }

    public Path resolveFilePath(String storageKey) {
        return Paths.get(uploadsDir, storageKey).normalize();
    }
}
