-- V7__restrict_user_access.sql

-- Remover acesso a inventário do perfil padrão USER
DELETE FROM role_permissions
WHERE role_id IN (SELECT id FROM roles WHERE name = 'USER')
AND permission_id IN (SELECT id FROM permissions WHERE module = 'inventory');

-- Garantir que USER tenha apenas o básico de Helpdesk
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'USER' 
AND p.code IN ('TICKET_CREATE', 'TICKET_VIEW_OWN')
ON CONFLICT DO NOTHING;
