package com.nexops.api.helpdesk.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ticket_attachments")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TicketAttachmentJpaEntity {
    @Id
    private UUID id;
    @Column(name = "ticket_id")
    private UUID ticketId;
    @Column(name = "tenant_id")
    private UUID tenantId;
    @Column(name = "uploader_id")
    private UUID uploaderId;
    private String filename;
    private String storageKey;
    private Long sizeBytes;
    private String contentType;
    private OffsetDateTime createdAt;
}
