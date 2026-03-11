-- V8__fix_missing_ticket_create.sql

-- 1. Garantir que a permissão TICKET_CREATE exista
INSERT INTO permissions (code, description, module) 
VALUES ('TICKET_CREATE', 'Abrir novos chamados', 'helpdesk')
ON CONFLICT (code) DO NOTHING;

-- 2. Vincular TICKET_CREATE a todos os perfis padrão
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE p.code = 'TICKET_CREATE'
AND r.name IN ('ADMIN', 'TECH', 'USER')
ON CONFLICT DO NOTHING;
