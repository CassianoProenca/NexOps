package com.nexops.api.helpdesk.infrastructure.web;

import com.nexops.api.helpdesk.application.TicketAttachmentService;
import com.nexops.api.helpdesk.domain.model.TicketAttachment;
import com.nexops.api.helpdesk.infrastructure.web.dto.AttachmentResponse;
import com.nexops.api.shared.exception.BusinessException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Attachments", description = "Ticket file attachments")
public class TicketAttachmentController {

    private final TicketAttachmentService attachmentService;

    @Operation(summary = "Upload attachment", description = "Upload a file to a ticket")
    @PostMapping("/v1/tickets/{id}/attachments")
    @ResponseStatus(HttpStatus.CREATED)
    public AttachmentResponse upload(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        TicketAttachment attachment = attachmentService.upload(id, file);
        return toResponse(attachment);
    }

    @Operation(summary = "List attachments", description = "List all attachments for a ticket")
    @GetMapping("/v1/tickets/{id}/attachments")
    public List<AttachmentResponse> list(@PathVariable UUID id) {
        return attachmentService.listByTicket(id).stream()
                .map(this::toResponse)
                .toList();
    }

    @Operation(summary = "Download attachment", description = "Download a file by attachment ID")
    @GetMapping("/v1/attachments/{attachmentId}")
    public ResponseEntity<Resource> download(@PathVariable UUID attachmentId) throws IOException {
        TicketAttachment attachment = attachmentService.findById(attachmentId)
                .orElseThrow(() -> new BusinessException("Anexo não encontrado"));

        var filePath = attachmentService.resolveFilePath(attachment.getStorageKey());
        Resource resource = new FileSystemResource(filePath);

        if (!resource.exists()) {
            throw new BusinessException("Arquivo não encontrado no servidor");
        }

        String contentType = attachment.getContentType() != null
                ? attachment.getContentType()
                : Files.probeContentType(filePath);
        if (contentType == null) contentType = "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + attachment.getFilename() + "\"")
                .body(resource);
    }

    private AttachmentResponse toResponse(TicketAttachment a) {
        return new AttachmentResponse(
                a.getId(), a.getTicketId(), a.getFilename(),
                a.getContentType(), a.getSizeBytes(), a.getCreatedAt()
        );
    }
}
