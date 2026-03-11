-- V6__refine_permissions_and_roles.sql

-- 1. Inserir novas permissões granulares
INSERT INTO permissions (code, description, module) VALUES
  ('TICKET_VIEW_OWN', 'Visualizar apenas os próprios chamados', 'helpdesk'),
  ('TICKET_VIEW_DEPT', 'Visualizar chamados do departamento', 'helpdesk'),
  ('TICKET_ASSIGN', 'Atribuir técnicos a chamados', 'helpdesk'),
  ('TICKET_RESOLVE', 'Resolver chamados', 'helpdesk'),
  ('TICKET_DELETE', 'Excluir chamados permanentemente', 'helpdesk'),
  ('ASSET_VIEW', 'Visualizar ativos do inventário', 'inventory'),
  ('ASSET_CREATE', 'Cadastrar novos ativos', 'inventory'),
  ('ASSET_EDIT', 'Editar informações de ativos', 'inventory'),
  ('ASSET_MOVE', 'Registrar movimentação de ativos', 'inventory'),
  ('SETTINGS_VIEW', 'Visualizar configurações do sistema', 'admin'),
  ('SETTINGS_EDIT', 'Alterar configurações do sistema', 'admin'),
  ('AI_CONFIG', 'Configurar chaves e modelos de IA', 'admin');

-- 2. Atualizar permissões do perfil ADMIN (dar todas as novas)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'ADMIN' 
AND p.code IN ('TICKET_VIEW_OWN', 'TICKET_VIEW_DEPT', 'TICKET_ASSIGN', 'TICKET_RESOLVE', 'TICKET_DELETE', 'ASSET_VIEW', 'ASSET_CREATE', 'ASSET_EDIT', 'ASSET_MOVE', 'SETTINGS_VIEW', 'SETTINGS_EDIT', 'AI_CONFIG')
ON CONFLICT DO NOTHING;

-- 3. Atualizar permissões do perfil TECH
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'TECH' 
AND p.code IN ('TICKET_VIEW_OWN', 'TICKET_ASSIGN', 'TICKET_RESOLVE', 'ASSET_VIEW', 'ASSET_CREATE', 'ASSET_EDIT', 'ASSET_MOVE')
ON CONFLICT DO NOTHING;

-- 4. Atualizar permissões do perfil USER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'USER' 
AND p.code IN ('TICKET_VIEW_OWN', 'ASSET_VIEW')
ON CONFLICT DO NOTHING;
