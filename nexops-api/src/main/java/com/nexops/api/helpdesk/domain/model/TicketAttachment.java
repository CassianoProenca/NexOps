package com.nexops.api.helpdesk.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class TicketAttachment {
    private final UUID id;
    private final UUID ticketId;
    private final UUID uploaderId;
    private final String filename;
    private final String storageKey;
    private final Long sizeBytes;
    private final String contentType;
    private final OffsetDateTime createdAt;

    public TicketAttachment(UUID id, UUID ticketId, UUID uploaderId, String filename, String storageKey, Long sizeBytes, String contentType, OffsetDateTime createdAt) {
        this.id = id;
        this.ticketId = ticketId;
        this.uploaderId = uploaderId;
        this.filename = filename;
        this.storageKey = storageKey;
        this.sizeBytes = sizeBytes;
        this.contentType = contentType;
        this.createdAt = createdAt;
    }

    public static TicketAttachment create(UUID ticketId, UUID uploaderId, String filename, String storageKey, Long sizeBytes, String contentType) {
        return new TicketAttachment(
            UUID.randomUUID(),
            ticketId,
            uploaderId,
            filename,
            storageKey,
            sizeBytes,
            contentType,
            OffsetDateTime.now()
        );
    }

    public UUID getId() { return id; }
    public UUID getTicketId() { return ticketId; }
    public UUID getUploaderId() { return uploaderId; }
    public String getFilename() { return filename; }
    public String getStorageKey() { return storageKey; }
    public Long getSizeBytes() { return sizeBytes; }
    public String getContentType() { return contentType; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
