-- V12__add_system_user.sql
-- Adiciona um usuário de sistema global para ser autor de logs automáticos

-- Como o sistema é multi-tenant, precisamos de um tenant "zero" ou associar a um tenant existente.
-- Para logs de sistema globais que não pertencem a um usuário real, mas ainda respeitam a FK.

-- Primeiro, garantimos que o UUID de sistema exista na tabela de usuários de cada tenant?
-- Melhor: Remover a FK de author_id na tabela ticket_comments ou permitir que o autor seja opcional (null).
-- No entanto, a regra NOT NULL foi definida.

-- Solução: Alterar a constraint para permitir NULL no author_id em casos de sistema
ALTER TABLE ticket_comments ALTER COLUMN author_id DROP NOT NULL;

-- Ou, se quisermos manter o autor, criamos um usuário para cada tenant? Não escala bem.
-- Vamos seguir com a flexibilização da coluna author_id, pois eventos de sistema podem não ter um autor físico.
