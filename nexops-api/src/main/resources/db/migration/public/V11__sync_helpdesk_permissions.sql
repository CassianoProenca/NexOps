-- V11__sync_helpdesk_permissions.sql
-- Adiciona as permissões que estão sendo exigidas no código do TicketController mas faltam no banco

-- 1. Inserir permissões faltantes
INSERT INTO permissions (code, description, module) VALUES
  ('TICKET_CREATE', 'Criar novos chamados', 'helpdesk'),
  ('TICKET_ATTEND', 'Atender chamados da fila', 'helpdesk'),
  ('TICKET_PAUSE', 'Pausar e retomar chamados', 'helpdesk'),
  ('TICKET_CLOSE', 'Finalizar chamados', 'helpdesk')
ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description;

-- 2. Garantir que ADMIN tenha todas as permissões de helpdesk
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'ADMIN' 
AND p.code IN ('TICKET_CREATE', 'TICKET_ATTEND', 'TICKET_PAUSE', 'TICKET_CLOSE', 'TICKET_ASSIGN', 'TICKET_VIEW_ALL')
ON CONFLICT DO NOTHING;

-- 3. Garantir que TECH tenha as permissões operacionais
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'TECH' 
AND p.code IN ('TICKET_CREATE', 'TICKET_ATTEND', 'TICKET_PAUSE', 'TICKET_CLOSE', 'TICKET_VIEW_ALL')
ON CONFLICT DO NOTHING;

-- 4. Garantir que USER possa pelo menos criar chamados
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'USER' 
AND p.code IN ('TICKET_CREATE')
ON CONFLICT DO NOTHING;
