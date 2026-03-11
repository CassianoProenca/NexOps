-- Assets (patrimônio)
CREATE TABLE assets (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    patrimony_number VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED',
    serial_number VARCHAR(100),
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    purchase_date DATE,
    purchase_value NUMERIC(12,2),
    warranty_until DATE,
    assigned_user_id UUID,
    assigned_department_id UUID REFERENCES departments(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, patrimony_number)
);

-- Asset movement log (immutable)
CREATE TABLE asset_movements (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    asset_id UUID NOT NULL REFERENCES assets(id),
    movement_type VARCHAR(30) NOT NULL,
    from_user_id UUID,
    to_user_id UUID,
    from_department_id UUID REFERENCES departments(id),
    to_department_id UUID REFERENCES departments(id),
    performed_by_id UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock items (consumables)
CREATE TABLE stock_items (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'UN',
    current_quantity INT NOT NULL DEFAULT 0,
    minimum_quantity INT NOT NULL DEFAULT 0,
    location VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock movements (immutable)
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    stock_item_id UUID NOT NULL REFERENCES stock_items(id),
    movement_type VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    previous_quantity INT NOT NULL,
    new_quantity INT NOT NULL,
    reason TEXT,
    performed_by_id UUID NOT NULL,
    related_ticket_id UUID REFERENCES tickets(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_tenant ON assets(tenant_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_assigned_user ON assets(assigned_user_id);
CREATE INDEX idx_asset_movements_tenant ON asset_movements(tenant_id);
CREATE INDEX idx_asset_movements_asset_id ON asset_movements(asset_id);
CREATE INDEX idx_stock_items_tenant ON stock_items(tenant_id);
CREATE INDEX idx_stock_movements_tenant ON stock_movements(tenant_id);
CREATE INDEX idx_stock_movements_item_id ON stock_movements(stock_item_id);
