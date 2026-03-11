-- V10__create_tenant_settings.sql

CREATE TABLE tenant_settings (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id),
    
    -- SMTP Settings
    smtp_host VARCHAR(255),
    smtp_port INTEGER,
    smtp_username VARCHAR(255),
    smtp_password VARCHAR(255),
    smtp_from_email VARCHAR(255),
    smtp_from_name VARCHAR(255),
    smtp_use_tls BOOLEAN DEFAULT TRUE,
    
    -- AI Settings (BYOK)
    ai_provider VARCHAR(50), -- 'OPENAI', 'GOOGLE', 'ANTHROPIC'
    ai_api_key VARCHAR(500),
    ai_model VARCHAR(100),
    ai_enabled BOOLEAN DEFAULT FALSE,
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for tenant lookups
CREATE INDEX idx_tenant_settings_tenant ON tenant_settings(tenant_id);
