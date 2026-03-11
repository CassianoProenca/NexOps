-- SLA configurations per problem type
CREATE TABLE sla_configs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    problem_type_id UUID NOT NULL REFERENCES problem_types(id),
    sla_level VARCHAR(20) NOT NULL,
    response_minutes INT NOT NULL,
    resolution_minutes INT NOT NULL,
    notify_manager_at_percent INT NOT NULL DEFAULT 80,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(problem_type_id, sla_level)
);

-- SLA breach events (immutable log)
CREATE TABLE sla_breach_events (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    ticket_id UUID NOT NULL REFERENCES tickets(id),
    breach_type VARCHAR(30) NOT NULL,
    breached_at TIMESTAMPTZ NOT NULL,
    sla_deadline TIMESTAMPTZ NOT NULL,
    minutes_overdue INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification log
CREATE TABLE sla_notifications (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    ticket_id UUID NOT NULL REFERENCES tickets(id),
    recipient_id UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

CREATE INDEX idx_sla_configs_tenant ON sla_configs(tenant_id);
CREATE INDEX idx_sla_breach_events_tenant ON sla_breach_events(tenant_id);
CREATE INDEX idx_sla_notifications_tenant ON sla_notifications(tenant_id);
