CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    schema_name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    plan VARCHAR(50) NOT NULL DEFAULT 'BASIC',
    max_users INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tenants_status_check CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED')),
    CONSTRAINT tenants_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_schema_name ON public.tenants(schema_name);
