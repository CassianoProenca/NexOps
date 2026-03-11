package com.nexops.api.shared.tenant.domain.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class Tenant {

    private UUID id;
    private String cnpj;
    private String nomeFantasia;
    private String email;
    private TenantStatus status;
    private OffsetDateTime createdAt;

    public Tenant() {}

    public Tenant(UUID id, String cnpj, String nomeFantasia, String email,
                  TenantStatus status, OffsetDateTime createdAt) {
        this.id = id;
        this.cnpj = cnpj;
        this.nomeFantasia = nomeFantasia;
        this.email = email;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static Tenant create(String cnpj, String nomeFantasia, String email) {
        Tenant t = new Tenant();
        t.id = UUID.randomUUID();
        t.cnpj = cnpj;
        t.nomeFantasia = nomeFantasia;
        t.email = email;
        t.status = TenantStatus.ACTIVE;
        t.createdAt = OffsetDateTime.now();
        return t;
    }

    public UUID getId() { return id; }
    public String getCnpj() { return cnpj; }
    public String getNomeFantasia() { return nomeFantasia; }
    public String getEmail() { return email; }
    public TenantStatus getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void suspend() {
        this.status = TenantStatus.SUSPENDED;
    }

    public void activate() {
        this.status = TenantStatus.ACTIVE;
    }

    public void update(String nomeFantasia) {
        if (nomeFantasia != null && !nomeFantasia.isBlank()) {
            this.nomeFantasia = nomeFantasia;
        }
    }
}
