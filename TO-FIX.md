# TO-FIX — Limitações Conhecidas do Frontend

Lista de pontos onde o frontend ainda não pode funcionar corretamente por falta de endpoints no backend.
Cada item descreve o problema, onde ele ocorre e o que precisa ser implementado na API para resolver.

---

## 1. Atribuição de técnico sem lista de usuários

**Arquivo:** `nexops-web/src/pages/helpdesk/admin/TicketDetailManagerPage.tsx`

**Problema:** O modal "Atribuir / Reatribuir Técnico" exigia que o gestor selecionasse um técnico de uma lista. Não existe endpoint `GET /v1/users` que retorne os usuários do tenant. A solução temporária atual é um campo de input onde o gestor cola manualmente o UUID do técnico.

**UX atual:** O gestor digita/cola o UUID — com validação de formato UUID v4.

**Fix necessário no backend:**
```
GET /api/v1/users?role=TECHNICIAN
→ UserSummaryResponse[]  { id, name, email, role }
```

**Fix necessário no frontend:**
- Substituir o `<input>` de UUID pelo hook `useUsers({ role: 'TECHNICIAN' })` em `TicketDetailManagerPage.tsx`
- Exibir nome + avatar no modal de atribuição e nas seções "Técnico responsável" / "Atribuição"

---

## 2. Nome do técnico responsável exibido como UUID truncado

**Arquivos:**
- `nexops-web/src/pages/helpdesk/admin/TicketDetailManagerPage.tsx`
- `nexops-web/src/pages/helpdesk/admin/AllTicketsPage.tsx` (coluna "Sem técnico" também sem nome)
- `nexops-web/src/pages/helpdesk/tech/QueuePanelPage.tsx` (`assigneeName` vem do backend — OK aqui)

**Problema:** `TicketResponse.assigneeId` é um UUID. Sem endpoint de usuários, é impossível resolver o nome do técnico. Exibe-se `"a3f8c1d2…"` em vez de `"Rafael Oliveira"`.

**Fix:** Implementar o endpoint do item 1.

---

## 3. Cancelamento de chamado sem endpoint

**Arquivo:** `nexops-web/src/pages/helpdesk/admin/TicketDetailManagerPage.tsx`

**Problema:** O botão "Cancelar Chamado" altera apenas estado local (`cancelled = true`) — não persiste no backend. Ao recarregar a página, o chamado volta ao status original.

**Fix necessário no backend:**
```
POST /api/v1/tickets/{id}/cancel
Body: { reason: string }
```

**Fix necessário no frontend:**
- Criar `useCancelTicket()` em `useTickets.ts`
- Substituir `setCancelled(true)` por `cancelTicket.mutate(id, { reason })`

---

## 4. Solicitante exibido como UUID truncado

**Arquivos:**
- `nexops-web/src/pages/helpdesk/admin/TicketDetailManagerPage.tsx`
- `nexops-web/src/pages/helpdesk/tech/TicketDetailTechPage.tsx`

**Problema:** `TicketResponse.requesterId` é um UUID. Sem endpoint de usuários, o nome do solicitante não pode ser resolvido. Exibe-se `"b7a2d0e1…"` em vez de `"João Silva"`.

**Fix necessário no backend:** Endpoint do item 1, ou incluir `requesterName` diretamente no `TicketResponse`.

---

## 5. Anexos sem backend

**Arquivos:**
- `nexops-web/src/pages/helpdesk/admin/TicketDetailManagerPage.tsx`
- `nexops-web/src/pages/helpdesk/tech/TicketDetailTechPage.tsx`

**Problema:** As seções de "Anexos" exibem arquivos hardcoded (`foto-impressora.jpg`, `config-porta.pdf`) e o botão de upload não faz nada. Não existe endpoint de upload/download de arquivos.

**Fix necessário no backend:**
```
POST /api/v1/tickets/{id}/attachments   → upload (multipart/form-data)
GET  /api/v1/tickets/{id}/attachments   → AttachmentResponse[]  { id, filename, size, url }
GET  /api/v1/attachments/{id}/download  → download do arquivo
```

**Fix necessário no frontend:**
- Criar hook `useTicketAttachments(ticketId)` e `useUploadAttachment()`
- Substituir o array estático pelo hook e o botão de upload por chamada real

---

## 6. Dados de gráficos da Governança ainda são mock

**Arquivo:** `nexops-web/src/pages/governance/GovernanceDashboardPage.tsx`

**Problema:** Os seguintes gráficos/rankings usam geradores de dados aleatórios (seed por data), não dados reais:
- `buildChartData()` — evolução diária/mensal de tickets
- `buildSlaByType()` — % de SLA por tipo de problema
- `buildRanking()` — ranking de técnicos por chamados resolvidos
- `buildBreach()` — lista de chamados em breach

Os KPIs principais (`totalTickets`, `openTickets`, `slaCompliancePercent`, etc.) já vêm do endpoint `GET /api/v1/governance/dashboard`.

**Fix necessário no backend:** Expandir `GovernanceMetrics` ou criar endpoints específicos:
```
GET /api/v1/governance/dashboard/chart?from=&to=   → { date, opened, closed }[]
GET /api/v1/governance/sla-by-type?from=&to=       → { typeName, slaPercent }[]
GET /api/v1/governance/technician-ranking?from=&to= → { name, resolved, slaPercent }[]
GET /api/v1/governance/sla-breaches?from=&to=      → TicketSummaryResponse[]
```

---

## 7. Notificações de SLA sem backend

**Arquivo:** `nexops-web/src/pages/governance/SLANotificationsPage.tsx`

**Problema:** Página inteiramente mockada. Não existe endpoint de notificações de SLA.

**Fix necessário no backend:**
```
GET /api/v1/governance/sla-notifications   → SlaNotification[]
```

---

## 8. ~~Módulo de Inventário sem integração~~ ✅ RESOLVIDO

**Arquivos criados:**
- `nexops-web/src/pages/inventory/AssetsPage.tsx` — listagem de ativos com KPIs, filtros, paginação e modal de registro
- `nexops-web/src/pages/inventory/StockPage.tsx` — listagem de estoque com alertas de mínimo, filtros, paginação e modal de criação

**Rotas registradas em `App.tsx`:**
- `/app/inventory/assets` → `AssetsPage`
- `/app/inventory/stock`  → `StockPage`
- `/app/inventory`        → redirect para `/app/inventory/assets`

**Pendente (detalhe de cada item):**
- Página de detalhe de ativo (`/app/inventory/assets/:id`) — `useAsset(id)`, `useAssetMovements(id)`, `useAssignAsset()`, `useUnassignAsset()`, `useAssetMaintenance()`, `useDiscardAsset()`
- Página de detalhe de estoque (`/app/inventory/stock/:id`) — `useStockItem(id)`, `useStockMovements(id)`, `useAddStock()`, `useRemoveStock()`
