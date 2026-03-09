-- Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    module VARCHAR(50) NOT NULL
);

-- Role <-> Permission (N:N)
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    CONSTRAINT users_status_check CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED'))
);

-- User <-> Role (N:N)
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- User permission overrides (RBAC com override por usuário)
CREATE TABLE user_permission_overrides (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted BOOLEAN NOT NULL,  -- true = concede, false = revoga
    PRIMARY KEY (user_id, permission_id)
);

-- Refresh tokens
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invite tokens
CREATE TABLE invite_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    role_id UUID REFERENCES roles(id),
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_invite_tokens_token_hash ON invite_tokens(token_hash);
CREATE INDEX idx_invite_tokens_email ON invite_tokens(email);

-- Seed: permissions do sistema
INSERT INTO permissions (code, description, module) VALUES
-- Helpdesk
('TICKET_CREATE', 'Abrir chamados', 'HELPDESK'),
('TICKET_VIEW_OWN', 'Ver próprios chamados', 'HELPDESK'),
('TICKET_VIEW_ALL', 'Ver todos os chamados', 'HELPDESK'),
('TICKET_ATTEND', 'Atender chamados da fila', 'HELPDESK'),
('TICKET_ASSIGN', 'Reatribuir chamados', 'HELPDESK'),
('TICKET_CLOSE', 'Finalizar chamados', 'HELPDESK'),
('TICKET_PAUSE', 'Pausar chamados', 'HELPDESK'),
-- Inventory
('INVENTORY_VIEW', 'Visualizar ativos e estoque', 'INVENTORY'),
('INVENTORY_WRITE', 'Cadastrar e movimentar ativos', 'INVENTORY'),
('INVENTORY_IMPORT', 'Importar ativos via CSV/XLSX', 'INVENTORY'),
-- Governance
('REPORT_VIEW_OWN', 'Ver relatórios próprios', 'GOVERNANCE'),
('REPORT_VIEW_ALL', 'Ver todos os relatórios e SLA', 'GOVERNANCE'),
('SLA_CONFIG', 'Configurar SLA', 'GOVERNANCE'),
-- Admin
('USER_INVITE', 'Convidar usuários', 'ADMIN'),
('USER_MANAGE', 'Gerenciar usuários e roles', 'ADMIN'),
('ROLE_MANAGE', 'Criar e editar perfis de acesso', 'ADMIN'),
('TENANT_CONFIG', 'Configurações do tenant', 'ADMIN'),
('AI_CONFIG', 'Configurar integração de IA', 'ADMIN'),
('SMTP_CONFIG', 'Configurar SMTP', 'ADMIN'),
('DEPT_MANAGE', 'Gerenciar departamentos e tipos', 'ADMIN');

-- Seed: roles padrão do sistema
INSERT INTO roles (name, description, is_system) VALUES
('USUARIO_FINAL', 'Abre e acompanha chamados', TRUE),
('TECNICO_SUPORTE', 'Atende chamados de software e acessos', TRUE),
('TECNICO_HARDWARE', 'Atende chamados de hardware', TRUE),
('GESTOR', 'Supervisiona equipe e acessa relatórios', TRUE),
('ADMIN', 'Acesso total ao sistema', TRUE);

-- Seed: permissões por role
-- USUARIO_FINAL
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'USUARIO_FINAL'
AND p.code IN ('TICKET_CREATE', 'TICKET_VIEW_OWN');

-- TECNICO_SUPORTE
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'TECNICO_SUPORTE'
AND p.code IN ('TICKET_VIEW_ALL', 'TICKET_ATTEND', 'TICKET_CLOSE', 'TICKET_PAUSE', 'INVENTORY_VIEW');

-- TECNICO_HARDWARE
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'TECNICO_HARDWARE'
AND p.code IN ('TICKET_VIEW_ALL', 'TICKET_ATTEND', 'TICKET_CLOSE', 'TICKET_PAUSE', 'INVENTORY_VIEW', 'INVENTORY_WRITE');

-- GESTOR
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'GESTOR'
AND p.code IN ('TICKET_VIEW_ALL', 'TICKET_ASSIGN', 'REPORT_VIEW_ALL', 'SLA_CONFIG', 'INVENTORY_VIEW', 'USER_INVITE');

-- ADMIN (todas as permissões)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN';
