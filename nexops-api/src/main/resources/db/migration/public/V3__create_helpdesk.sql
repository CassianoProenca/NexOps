-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- Problem types
CREATE TABLE problem_types (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    sla_level VARCHAR(5) NOT NULL DEFAULT 'N2',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT problem_types_sla_check CHECK (sla_level IN ('N1', 'N2', 'N3')),
    UNIQUE(tenant_id, name)
);

-- Tickets
CREATE TABLE tickets (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    internal_priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    sla_level VARCHAR(5) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    problem_type_id UUID NOT NULL REFERENCES problem_types(id),
    requester_id UUID NOT NULL REFERENCES users(id),
    assignee_id UUID REFERENCES users(id),
    parent_ticket_id UUID REFERENCES tickets(id),
    pause_reason TEXT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    sla_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tickets_status_check CHECK (status IN ('OPEN', 'IN_PROGRESS', 'PAUSED', 'CLOSED')),
    CONSTRAINT tickets_priority_check CHECK (internal_priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    CONSTRAINT tickets_sla_check CHECK (sla_level IN ('N1', 'N2', 'N3'))
);

-- Ticket comments
CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'MESSAGE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ticket_comments_type_check CHECK (type IN ('MESSAGE', 'STATUS_CHANGE', 'ASSIGNMENT', 'PAUSE', 'SYSTEM'))
);

-- Ticket attachments
CREATE TABLE ticket_attachments (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    size_bytes BIGINT NOT NULL,
    content_type VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_departments_tenant ON departments(tenant_id);
CREATE INDEX idx_problem_types_tenant ON problem_types(tenant_id);
CREATE INDEX idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX idx_tickets_status_tenant ON tickets(status, tenant_id);
CREATE INDEX idx_tickets_assignee_id ON tickets(assignee_id);
CREATE INDEX idx_tickets_requester_id ON tickets(requester_id);
CREATE INDEX idx_tickets_problem_type_id ON tickets(problem_type_id);
CREATE INDEX idx_tickets_parent_ticket_id ON tickets(parent_ticket_id);
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
