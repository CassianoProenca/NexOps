-- V9__add_asset_manage_permission.sql

-- 1. Garantir que a permissão ASSET_MANAGE exista
INSERT INTO permissions (code, description, module) 
VALUES ('ASSET_MANAGE', 'Gestão total do inventário', 'inventory')
ON CONFLICT (code) DO NOTHING;

-- 2. Vincular ASSET_MANAGE ao ADMIN e TECH
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE p.code = 'ASSET_MANAGE'
AND r.name IN ('ADMIN', 'TECH')
ON CONFLICT DO NOTHING;
