# INTEGRATION.md — NexOps Web ↔ API

> Gerado em 2026-03-10 a partir da leitura direta de todos os controllers,
> DTOs, modelos de domínio, `JwtService.java`, `AuthenticatedUser.java`,
> `TenantContext.java` e `application.yaml` do nexops-api.
>
> **Se você é Claude Code:** este MD é um guia de referência rápida. Quando
> houver dúvida sobre qualquer contrato, navegue em `nexops-api/` e verifique
> o controller ou DTO diretamente. O código-fonte sempre tem precedência sobre
> este documento.
>
> **Se você é Gemini:** todos os contratos necessários estão documentados aqui.
> Não assuma nada que não esteja listado explicitamente. Se um campo estiver
> faltando, pergunte antes de inventar.

---

## 1. Setup — Pacotes a instalar

Execute todos os comandos a partir da pasta `nexops-web/`.

```bash
# HTTP client + interceptors
npm install axios@^1.7.9

# Server-state / cache
npm install @tanstack/react-query@^5.80.7

# Global client-state
npm install zustand@^5.0.5

# WebSocket (STOMP sobre SockJS — necessário para o broker do Spring)
npm install sockjs-client@^1.6.1 @stomp/stompjs@^7.0.0

# Tipos para sockjs-client (dev)
npm install -D @types/sockjs-client@^1.5.4
```

> **Nota de versões:** axios `^1.7.x` é totalmente compatível com React 19 e
> Vite 7. `@tanstack/react-query` v5 requer React ≥ 18. Zustand v5 usa
> `immer`-optional e é ESM-first — sem conflitos com o bundler atual.

---

## 2. Estrutura de arquivos a criar

```
src/
├── lib/
│   ├── api.ts              → Instância Axios + interceptors (auth + tenant + refresh)
│   └── queryClient.ts      → Configuração global do React Query
├── store/
│   └── appStore.ts         → Zustand: usuário, tenant, tokens, permissões, sidebar
├── components/
│   └── shared/
│       └── ProtectedRoute.tsx  → Guarda de rota (auth + permissão)
├── hooks/
│   ├── auth/
│   │   └── useAuth.ts          → login, logout, bootstrap de sessão
│   ├── helpdesk/
│   │   ├── useTickets.ts       → GET /tickets, /tickets/my, /tickets/assigned, /tickets/queue/:id
│   │   ├── useTicket.ts        → GET /tickets/:id + GET /tickets/:id/comments
│   │   ├── useCreateTicket.ts  → POST /tickets
│   │   ├── useAttendNext.ts    → POST /tickets/:id/attend
│   │   ├── useAssignTicket.ts  → POST /tickets/:id/assign
│   │   ├── usePauseTicket.ts   → POST /tickets/:id/pause
│   │   ├── useResumeTicket.ts  → POST /tickets/:id/resume
│   │   ├── useCloseTicket.ts   → POST /tickets/:id/close
│   │   ├── useCreateChild.ts   → POST /tickets/:id/child
│   │   ├── useAddComment.ts    → POST /tickets/:id/comments
│   │   ├── useDepartments.ts   → GET /departments
│   │   └── useProblemTypes.ts  → GET /problem-types
│   ├── governance/
│   │   ├── useGovernanceDashboard.ts  → GET /governance/dashboard
│   │   ├── useTechnicianMetrics.ts    → GET /governance/technicians/:id/sla
│   │   ├── useSlaConfigs.ts           → GET /governance/sla/config
│   │   └── useUpdateSlaConfig.ts      → PUT /governance/sla/config/:id
│   └── inventory/
│       ├── useAssets.ts               → GET /assets
│       ├── useAsset.ts                → GET /assets/:id + GET /assets/:id/movements
│       ├── useRegisterAsset.ts        → POST /assets
│       ├── useUpdateAsset.ts          → PUT /assets/:id
│       ├── useAssignAsset.ts          → POST /assets/:id/assign
│       ├── useUnassignAsset.ts        → POST /assets/:id/unassign
│       ├── useAssetMaintenance.ts     → POST /assets/:id/maintenance
│       ├── useDiscardAsset.ts         → POST /assets/:id/discard
│       ├── useStockItems.ts           → GET /stock, GET /stock/alerts
│       ├── useStockItem.ts            → GET /stock/:id + GET /stock/:id/movements
│       ├── useCreateStockItem.ts      → POST /stock
│       ├── useAddStock.ts             → POST /stock/:id/add
│       └── useRemoveStock.ts          → POST /stock/:id/remove
├── services/
│   ├── auth.service.ts        → login, refresh, logout
│   ├── helpdesk.service.ts    → tickets, departments, problem types
│   ├── governance.service.ts  → metrics, sla config
│   └── inventory.service.ts   → assets, stock
└── types/
    ├── auth.types.ts
    ├── helpdesk.types.ts
    ├── governance.types.ts
    └── inventory.types.ts
```

---

## 3. TypeScript Types

### `src/types/auth.types.ts`

```typescript
// ─── Requests ───────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
  tenantSlug: string
}

export interface RefreshRequest {
  refreshToken: string
}

// ─── Responses ──────────────────────────────────────────────────────────────

/** POST /api/v1/auth/login  |  POST /api/v1/auth/refresh */
export interface TokenPairResponse {
  accessToken: string
  refreshToken: string
  tokenType: string  // always "Bearer"
}

// ─── JWT Claims (extraídos pelo JwtService) ──────────────────────────────────
// sub      → userId (UUID string)
// email    → string
// tenant   → tenantSlug (string)
// permissions → string[]

// ─── Principal no Zustand ────────────────────────────────────────────────────
/**
 * Shape do usuário autenticado armazenado no store.
 * Derivado das claims do JWT + nome exibido (não vem no token — buscar via
 * GET /api/v1/users/me quando esse endpoint existir, ou usar e-mail como
 * fallback de exibição).
 */
export interface AuthenticatedUser {
  userId: string        // UUID como string
  email: string
  tenantSlug: string
  name?: string         // opcional até existir /users/me
}

// ─── Tenant (super-admin) ────────────────────────────────────────────────────

export interface CreateTenantRequest {
  name: string
  slug: string          // pattern: ^[a-z0-9-]+$
  plan: string
  maxUsers: number      // mínimo 1
}

export interface TenantResponse {
  id: string
  name: string
  slug: string
  schemaName: string
  status: string
  plan: string
  maxUsers: number
  createdAt: string     // ISO 8601
}
```

---

### `src/types/helpdesk.types.ts`

```typescript
// ─── Enums ──────────────────────────────────────────────────────────────────

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PAUSED' | 'CLOSED'
export type SlaLevel = 'N1' | 'N2' | 'N3'
export type InternalPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type CommentType = 'USER_MESSAGE' | 'TECHNICIAN_MESSAGE' | 'SYSTEM_EVENT'

// ─── Department ──────────────────────────────────────────────────────────────
// GET /api/v1/departments  →  Department[]
// POST /api/v1/departments →  Department
// DELETE /api/v1/departments/:id  →  204

export interface Department {
  id: string
  name: string
  description: string | null
  active: boolean
  createdAt: string
}

export interface CreateDepartmentRequest {
  name: string
  description?: string
}

// ─── ProblemType ─────────────────────────────────────────────────────────────
// GET /api/v1/problem-types  →  ProblemType[]
// POST /api/v1/problem-types →  ProblemType
// DELETE /api/v1/problem-types/:id  →  204

export interface ProblemType {
  id: string
  name: string
  description: string | null
  slaLevel: SlaLevel
  active: boolean
  createdAt: string
}

export interface CreateProblemTypeRequest {
  name: string
  description?: string
  slaLevel: SlaLevel
}

// ─── Ticket ──────────────────────────────────────────────────────────────────

/** POST /api/v1/tickets */
export interface CreateTicketRequest {
  title: string
  description: string
  departmentId: string
  problemTypeId: string
}

/** GET /api/v1/tickets/:id  |  POST /api/v1/tickets  etc. */
export interface TicketResponse {
  id: string
  title: string
  description: string
  status: TicketStatus
  internalPriority: InternalPriority
  slaLevel: SlaLevel
  departmentId: string
  problemTypeId: string
  requesterId: string
  assigneeId: string | null
  parentTicketId: string | null
  pauseReason: string | null
  openedAt: string
  assignedAt: string | null
  pausedAt: string | null
  closedAt: string | null
  slaDeadline: string | null
  createdAt: string
  updatedAt: string
}

/** GET /api/v1/tickets  |  GET /api/v1/tickets/my  etc. */
export interface TicketSummaryResponse {
  id: string
  title: string
  status: TicketStatus
  slaLevel: SlaLevel
  departmentId: string
  problemTypeId: string
  requesterId: string
  assigneeId: string | null
  openedAt: string
  slaDeadline: string | null
  isSlaBreached: boolean
}

/** POST /api/v1/tickets/:id/assign */
export interface AssignTicketRequest {
  technicianId: string
}

/** POST /api/v1/tickets/:id/attend */
export interface AttendNextRequest {
  problemTypeId: string
}

/** POST /api/v1/tickets/:id/pause */
export interface PauseTicketRequest {
  reason: string
}

// ─── Comments / Chat ─────────────────────────────────────────────────────────

/** POST /api/v1/tickets/:id/comments */
export interface AddCommentRequest {
  content: string
}

/** GET /api/v1/tickets/:id/comments  →  CommentResponse[] */
export interface CommentResponse {
  id: string
  ticketId: string
  authorId: string
  content: string
  type: CommentType
  createdAt: string
}

// ─── WebSocket — Queue Panel ─────────────────────────────────────────────────
// STOMP topic: /topic/queue-panel  (broadcast a cada 15s)
// HTTP fallback: GET /api/v1/tickets/queue-panel

export interface TicketQueueItem {
  id: string
  title: string
  status: TicketStatus
  problemTypeName: string
  departmentName: string
  assigneeName: string | null
  openedAt: string
  minutesOpen: number
  isSlaBreached: boolean
}

export interface QueuePanelPayload {
  openTickets: TicketQueueItem[]
  inProgressTickets: TicketQueueItem[]
  updatedAt: string
}

// ─── WebSocket — Ticket Chat ─────────────────────────────────────────────────
// STOMP destination (envio):   /app/ticket/{ticketId}/chat
// STOMP topic (recebimento):   /topic/ticket/{ticketId}/chat

/** Payload enviado via STOMP para o chat */
export interface ChatMessageRequest {
  content: string
}

/** Payload recebido via STOMP do chat */
export interface ChatMessageResponse {
  id: string
  ticketId: string
  authorId: string
  authorName: string
  content: string
  type: CommentType
  createdAt: string
}
```

---

### `src/types/governance.types.ts`

```typescript
// GET /api/v1/governance/dashboard?from=&to=
// GET /api/v1/governance/technicians/:id/sla?from=&to=
export interface GovernanceMetrics {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  closedTickets: number
  slaBreachCount: number
  slaCompliancePercent: number
  avgResolutionMinutes: number
  ticketsByProblemType: Record<string, number>  // problemTypeId → count
  ticketsByTechnician: Record<string, number>   // technicianId → count
  periodStart: string
  periodEnd: string
}

// GET /api/v1/governance/sla/config  →  SlaConfig[]
// PUT /api/v1/governance/sla/config/:id  →  SlaConfig
export interface SlaConfig {
  id: string
  problemTypeId: string
  slaLevel: 'N1' | 'N2' | 'N3'
  responseMinutes: number
  resolutionMinutes: number
  notifyManagerAtPercent: number
  active: boolean
  createdAt: string
}

/** Corpo do PUT /api/v1/governance/sla/config/:id */
export interface UpdateSlaConfigRequest {
  responseMinutes: number
  resolutionMinutes: number
  notifyManagerAtPercent: number
}
```

---

### `src/types/inventory.types.ts`

```typescript
// ─── Enums ──────────────────────────────────────────────────────────────────

export type AssetStatus =
  | 'REGISTERED'
  | 'AVAILABLE'
  | 'IN_USE'
  | 'IN_MAINTENANCE'
  | 'DISCARDED'

export type AssetCategory =
  | 'DESKTOP'
  | 'NOTEBOOK'
  | 'MONITOR'
  | 'PRINTER'
  | 'PHONE'
  | 'OTHER'

export type AssetMovementType =
  | 'REGISTERED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'SENT_TO_MAINTENANCE'
  | 'RETURNED_FROM_MAINTENANCE'
  | 'DISCARDED'

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT'

// ─── Assets ──────────────────────────────────────────────────────────────────

/** POST /api/v1/assets */
export interface RegisterAssetRequest {
  patrimonyNumber: string
  name: string
  category: AssetCategory
  serialNumber?: string
  model?: string
  manufacturer?: string
  departmentId: string
}

/** PUT /api/v1/assets/:id */
export interface UpdateAssetRequest {
  name?: string
  description?: string
  notes?: string
  warrantyUntil?: string  // ISO date (YYYY-MM-DD)
}

/** POST /api/v1/assets/:id/assign */
export interface AssignAssetRequest {
  userId: string
  departmentId: string
}

/** POST /api/v1/assets/:id/maintenance  |  POST /api/v1/assets/:id/discard */
export interface AssetActionRequest {
  notes: string
}

/** GET /api/v1/assets  |  GET /api/v1/assets/:id */
export interface AssetResponse {
  id: string
  patrimonyNumber: string
  name: string
  description: string | null
  category: AssetCategory
  status: AssetStatus
  serialNumber: string | null
  model: string | null
  manufacturer: string | null
  purchaseDate: string | null   // ISO date
  purchaseValue: number | null
  warrantyUntil: string | null  // ISO date
  assignedUserId: string | null
  assignedDepartmentId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

/** GET /api/v1/assets/:id/movements  →  AssetMovementResponse[] */
export interface AssetMovementResponse {
  id: string
  assetId: string
  movementType: AssetMovementType
  fromUserId: string | null
  toUserId: string | null
  fromDepartmentId: string | null
  toDepartmentId: string | null
  performedById: string
  notes: string | null
  createdAt: string
}

// ─── Stock ───────────────────────────────────────────────────────────────────

/** POST /api/v1/stock */
export interface CreateStockItemRequest {
  name: string
  category: string
  unit: string
  minimumQuantity: number
  location?: string
}

/** POST /api/v1/stock/:id/add  |  POST /api/v1/stock/:id/remove */
export interface StockAdjustmentRequest {
  quantity: number
  reason?: string
  relatedTicketId?: string
}

/** GET /api/v1/stock  |  GET /api/v1/stock/:id  |  GET /api/v1/stock/alerts */
export interface StockItemResponse {
  id: string
  name: string
  description: string | null
  category: string
  unit: string
  currentQuantity: number
  minimumQuantity: number
  location: string | null
  active: boolean
  isBelowMinimum: boolean
  createdAt: string
  updatedAt: string
}

/** GET /api/v1/stock/:id/movements  →  StockMovementResponse[] */
export interface StockMovementResponse {
  id: string
  stockItemId: string
  movementType: StockMovementType
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string | null
  performedById: string
  relatedTicketId: string | null
  createdAt: string
}
```

---

## 4. Axios instance — `src/lib/api.ts`

A instância Axios deve seguir este contrato exato:

```typescript
import axios from 'axios'
import { useAppStore } from '@/store/appStore'

// Base URL: sem /api no prefixo porque o server.servlet.context-path já é /api
// no application.yaml. Portanto os paths do controller começam em /v1/...
// porém como o context-path está configurado como /api, a URL real é:
// http://localhost:8080/api/v1/auth/login
// Para simplificar, definir baseURL como http://localhost:8080/api
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ── REQUEST INTERCEPTOR ───────────────────────────────────────────────────────
// 1. Lê accessToken e tenant do store Zustand
// 2. Adiciona Authorization: Bearer <token>
// 3. Adiciona X-Tenant-ID: <tenantSlug>
api.interceptors.request.use((config) => {
  const { accessToken, tenant } = useAppStore.getState()
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }
  if (tenant) {
    config.headers['X-Tenant-ID'] = tenant
  }
  return config
})

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
// Em 401:
//   1. Tenta refresh via POST /v1/auth/refresh com o refreshToken do store
//   2. Se sucesso: atualiza tokens no store e repete a requisição original
//   3. Se falha no refresh (segundo 401): limpa store e redireciona para /login
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (e: unknown) => void }> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const { refreshToken, clearAuth } = useAppStore.getState()

      try {
        const { data } = await axios.post(`${BASE_URL}/v1/auth/refresh`, {
          refreshToken,
        })
        const newAccessToken: string = data.accessToken
        useAppStore.getState().setAuth(
          useAppStore.getState().user!,
          useAppStore.getState().tenant!,
          newAccessToken,
          data.refreshToken,
          useAppStore.getState().permissions
        )
        processQueue(null, newAccessToken)
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
```

> **Atenção ao `context-path`:** o `application.yaml` define
> `server.servlet.context-path: /api`. Isso significa que a URL real de todos
> os endpoints é `http://localhost:8080/api/v1/...`. Configure `VITE_API_URL`
> no `.env.local` como `http://localhost:8080/api` e use paths `/v1/...` nas
> chamadas de serviço.

---

## 5. Zustand store — `src/store/appStore.ts`

```typescript
interface AppStore {
  // ── state ──────────────────────────────────────────────────────────────────
  user: AuthenticatedUser | null
  tenant: string | null          // tenantSlug — vai no header X-Tenant-ID
  accessToken: string | null
  refreshToken: string | null
  permissions: Set<string>       // Set para O(1) em hasPermission
  sidebarCollapsed: boolean

  // ── actions ────────────────────────────────────────────────────────────────
  /**
   * Chamado após login bem-sucedido.
   * Persiste tokens em localStorage para bootstrap entre reloads.
   */
  setAuth: (
    user: AuthenticatedUser,
    tenant: string,
    accessToken: string,
    refreshToken: string,
    permissions: Set<string>
  ) => void

  /**
   * Limpa todo o estado de autenticação e remove do localStorage.
   * Chamado em logout ou em 401 irrecuperável.
   */
  clearAuth: () => void

  /** Verifica se o usuário possui a permissão exata. */
  hasPermission: (permission: string) => boolean

  /** Verifica se possui qualquer uma das permissões listadas. */
  hasAnyPermission: (...permissions: string[]) => boolean

  toggleSidebar: () => void
}
```

**Permissões conhecidas** (extraídas dos controllers do backend):

| Código | Descrição | Módulo |
|--------|-----------|--------|
| `TICKET_CREATE` | Abrir chamados | Helpdesk |
| `TICKET_VIEW_ALL` | Ver todos os chamados | Helpdesk |
| `TICKET_ATTEND` | Atender chamados (técnico) | Helpdesk |
| `TICKET_ASSIGN` | Atribuir chamados a técnicos | Helpdesk |
| `TICKET_PAUSE` | Pausar / retomar chamados | Helpdesk |
| `TICKET_CLOSE` | Finalizar chamados | Helpdesk |
| `DEPT_MANAGE` | Criar/desativar departamentos e tipos de problema | Helpdesk |
| `REPORT_VIEW_ALL` | Ver métricas globais de governança | Governance |
| `SLA_CONFIG` | Ver e editar configurações de SLA | Governance |
| `INVENTORY_VIEW` | Listar ativos e estoque | Inventory |
| `INVENTORY_WRITE` | Criar, editar e mover ativos e estoque | Inventory |

---

## 6. React Query — `src/lib/queryClient.ts`

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // 30 s — padrão para todas as queries
      retry: 1,                // 1 retry em caso de falha de rede
      refetchOnWindowFocus: false,
    },
    mutations: {
      // sem retry padrão em mutations
    },
  },
})
```

**Tratamento global de 401:** o interceptor do Axios já cuida do refresh e do
redirect. O React Query não precisa de `onError` global para 401 — apenas para
erros de negócio (ex.: toast de erro). Se necessário adicionar notificações:

```typescript
// Em main.tsx, envolver QueryClientProvider com um ErrorBoundary ou usar
// queryClient.setDefaultOptions({ queries: { onError: globalErrorHandler } })
```

---

## 7. ProtectedRoute — `src/components/shared/ProtectedRoute.tsx`

```typescript
interface ProtectedRouteProps {
  permission?: string   // código exato da permissão (ver tabela na seção 5)
  children: React.ReactNode
}
```

**Lógica:**

1. Ler `user` e `hasPermission` do `useAppStore`.
2. Se `user === null` → `<Navigate to="/login" replace />`.
3. Se `permission` foi fornecido E `!hasPermission(permission)` →
   `<Navigate to="/app" replace />` (ou renderizar página 403 se preferir).
4. Caso contrário → renderizar `children`.

**Uso em `App.tsx`:**

```tsx
<Route
  path="helpdesk/todos"
  element={
    <ProtectedRoute permission="TICKET_VIEW_ALL">
      <AllTicketsPage />
    </ProtectedRoute>
  }
/>
```

---

## 8. Ordem de integração

| # | Passo | Endpoint(s) | Desbloqueio |
|---|-------|-------------|-------------|
| 1 | **Auth — Login** | `POST /v1/auth/login` | Todas as demais telas |
| 2 | **Bootstrap de sessão** | Restaurar tokens do `localStorage` no `main.tsx` antes de montar o app | Reloads sem re-login |
| 3 | **Logout** | `POST /v1/auth/logout` | UX de segurança |
| 4 | **Departamentos + Tipos de problema** | `GET /v1/departments`, `GET /v1/problem-types` | Formulário `NewCasePage` |
| 5 | **Helpdesk — Usuário** | `POST /v1/tickets`, `GET /v1/tickets/my`, `GET /v1/tickets/:id`, `GET + POST /v1/tickets/:id/comments` | `NewCasePage`, `MyCasesPage`, `TicketDetailUserPage` |
| 6 | **Helpdesk — Técnico** | `GET /v1/tickets/queue/:id`, `POST /v1/tickets/:id/attend`, `GET /v1/tickets/assigned`, `POST /v1/tickets/:id/assign`, `POST /v1/tickets/:id/pause`, `POST /v1/tickets/:id/resume`, `POST /v1/tickets/:id/close` | `TicketQueuePage`, `MyTicketsPage`, `TicketDetailTechPage` |
| 7 | **Queue Panel — WebSocket** | STOMP `/topic/queue-panel` (fallback: `GET /v1/tickets/queue-panel`) | `QueuePanelPage` |
| 8 | **Helpdesk — Admin** | `GET /v1/tickets`, `POST /v1/tickets/:id/assign`, `POST + DELETE /v1/departments`, `POST + DELETE /v1/problem-types`, `POST /v1/tickets/:id/child` | `AllTicketsPage`, `DepartmentsPage`, `ProblemTypesPage`, `TicketDetailManagerPage` |
| 9 | **Governance** | `GET /v1/governance/dashboard`, `GET /v1/governance/technicians/:id/sla`, `GET /v1/governance/sla/config`, `PUT /v1/governance/sla/config/:id` | `GovernanceDashboardPage`, `TechnicianSLADetailPage`, `SLAConfigPage` |
| 10 | **Admin (usuários, perfis, configurações)** | Endpoints ainda não implementados no backend — implementar telas com mock e conectar quando disponíveis | `UsersPage`, `ProfilesPage`, `TenantSettingsPage`, `SmtpPage`, `AISettingsPage` |
| 11 | **Inventário — Ativos** | `GET /v1/assets`, `GET /v1/assets/:id`, `POST /v1/assets`, `PUT /v1/assets/:id`, `POST /v1/assets/:id/assign`, `POST /v1/assets/:id/unassign`, `POST /v1/assets/:id/maintenance`, `POST /v1/assets/:id/discard`, `GET /v1/assets/:id/movements` | Módulo Inventário (build simultâneo) |
| 12 | **Inventário — Estoque** | `GET /v1/stock`, `GET /v1/stock/alerts`, `GET /v1/stock/:id`, `POST /v1/stock`, `POST /v1/stock/:id/add`, `POST /v1/stock/:id/remove`, `GET /v1/stock/:id/movements` | `ConsumablesPage` |

---

## 9. Hook pattern

### Query hook

```typescript
// src/hooks/helpdesk/useTickets.ts
import { useQuery } from '@tanstack/react-query'
import { helpdeskService } from '@/services/helpdesk.service'
import type { TicketSummaryResponse } from '@/types/helpdesk.types'

export function useMyTickets() {
  return useQuery<TicketSummaryResponse[]>({
    queryKey: ['tickets', 'my'],
    queryFn: () => helpdeskService.getMyTickets(),
    staleTime: 30_000,
  })
}

export function useTicketQueue(problemTypeId: string) {
  return useQuery<TicketSummaryResponse[]>({
    queryKey: ['tickets', 'queue', problemTypeId],
    queryFn: () => helpdeskService.getQueue(problemTypeId),
    staleTime: 15_000,  // fila tem stale mais curto
    enabled: !!problemTypeId,
  })
}
```

### Mutation hook

```typescript
// src/hooks/helpdesk/useCreateTicket.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { helpdeskService } from '@/services/helpdesk.service'
import type { CreateTicketRequest, TicketResponse } from '@/types/helpdesk.types'

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation<TicketResponse, Error, CreateTicketRequest>({
    mutationFn: (data) => helpdeskService.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', 'my'] })
    },
  })
}
```

### Hook com parâmetros de ID

```typescript
// src/hooks/helpdesk/useTicket.ts
import { useQuery } from '@tanstack/react-query'
import { helpdeskService } from '@/services/helpdesk.service'
import type { TicketResponse, CommentResponse } from '@/types/helpdesk.types'

export function useTicket(id: string) {
  return useQuery<TicketResponse>({
    queryKey: ['tickets', id],
    queryFn: () => helpdeskService.getTicket(id),
    enabled: !!id,
  })
}

export function useTicketComments(ticketId: string) {
  return useQuery<CommentResponse[]>({
    queryKey: ['tickets', ticketId, 'comments'],
    queryFn: () => helpdeskService.getComments(ticketId),
    staleTime: 10_000,
  })
}
```

---

## 10. Service layer pattern

```typescript
// src/services/helpdesk.service.ts
import { api } from '@/lib/api'
import type {
  TicketResponse, TicketSummaryResponse, CreateTicketRequest,
  AssignTicketRequest, AttendNextRequest, PauseTicketRequest,
  AddCommentRequest, CommentResponse, QueuePanelPayload,
} from '@/types/helpdesk.types'
import type { Department, CreateDepartmentRequest, ProblemType, CreateProblemTypeRequest } from '@/types/helpdesk.types'

export const helpdeskService = {
  // ── Tickets ─────────────────────────────────────────────────────────────────
  getAllTickets: (): Promise<TicketSummaryResponse[]> =>
    api.get('/v1/tickets').then(r => r.data),

  getMyTickets: (): Promise<TicketSummaryResponse[]> =>
    api.get('/v1/tickets/my').then(r => r.data),

  getAssignedTickets: (): Promise<TicketSummaryResponse[]> =>
    api.get('/v1/tickets/assigned').then(r => r.data),

  getQueue: (problemTypeId: string): Promise<TicketSummaryResponse[]> =>
    api.get(`/v1/tickets/queue/${problemTypeId}`).then(r => r.data),

  getTicket: (id: string): Promise<TicketResponse> =>
    api.get(`/v1/tickets/${id}`).then(r => r.data),

  getQueuePanel: (): Promise<QueuePanelPayload> =>
    api.get('/v1/tickets/queue-panel').then(r => r.data),

  createTicket: (data: CreateTicketRequest): Promise<TicketResponse> =>
    api.post('/v1/tickets', data).then(r => r.data),

  attendNext: (ticketId: string, data: AttendNextRequest): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${ticketId}/attend`, data).then(r => r.data),

  assignTicket: (id: string, data: AssignTicketRequest): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${id}/assign`, data).then(r => r.data),

  pauseTicket: (id: string, data: PauseTicketRequest): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${id}/pause`, data).then(r => r.data),

  resumeTicket: (id: string): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${id}/resume`).then(r => r.data),

  closeTicket: (id: string): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${id}/close`).then(r => r.data),

  createChildTicket: (parentId: string, data: CreateTicketRequest): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${parentId}/child`, data).then(r => r.data),

  getComments: (ticketId: string): Promise<CommentResponse[]> =>
    api.get(`/v1/tickets/${ticketId}/comments`).then(r => r.data),

  addComment: (ticketId: string, data: AddCommentRequest): Promise<CommentResponse> =>
    api.post(`/v1/tickets/${ticketId}/comments`, data).then(r => r.data),

  // ── Departments ──────────────────────────────────────────────────────────────
  getDepartments: (): Promise<Department[]> =>
    api.get('/v1/departments').then(r => r.data),

  createDepartment: (data: CreateDepartmentRequest): Promise<Department> =>
    api.post('/v1/departments', data).then(r => r.data),

  deactivateDepartment: (id: string): Promise<void> =>
    api.delete(`/v1/departments/${id}`).then(() => undefined),

  // ── Problem Types ─────────────────────────────────────────────────────────────
  getProblemTypes: (): Promise<ProblemType[]> =>
    api.get('/v1/problem-types').then(r => r.data),

  createProblemType: (data: CreateProblemTypeRequest): Promise<ProblemType> =>
    api.post('/v1/problem-types', data).then(r => r.data),

  deactivateProblemType: (id: string): Promise<void> =>
    api.delete(`/v1/problem-types/${id}`).then(() => undefined),
}
```

```typescript
// src/services/inventory.service.ts
import { api } from '@/lib/api'
import type {
  AssetResponse, AssetMovementResponse, RegisterAssetRequest,
  UpdateAssetRequest, AssignAssetRequest, AssetActionRequest,
  StockItemResponse, StockMovementResponse, CreateStockItemRequest,
  StockAdjustmentRequest,
} from '@/types/inventory.types'

export const inventoryService = {
  // ── Assets ───────────────────────────────────────────────────────────────────
  getAssets: (): Promise<AssetResponse[]> =>
    api.get('/v1/assets').then(r => r.data),

  getAsset: (id: string): Promise<AssetResponse> =>
    api.get(`/v1/assets/${id}`).then(r => r.data),

  getAssetMovements: (id: string): Promise<AssetMovementResponse[]> =>
    api.get(`/v1/assets/${id}/movements`).then(r => r.data),

  registerAsset: (data: RegisterAssetRequest): Promise<AssetResponse> =>
    api.post('/v1/assets', data).then(r => r.data),

  updateAsset: (id: string, data: UpdateAssetRequest): Promise<AssetResponse> =>
    api.put(`/v1/assets/${id}`, data).then(r => r.data),

  assignAsset: (id: string, data: AssignAssetRequest): Promise<AssetResponse> =>
    api.post(`/v1/assets/${id}/assign`, data).then(r => r.data),

  unassignAsset: (id: string): Promise<AssetResponse> =>
    api.post(`/v1/assets/${id}/unassign`).then(r => r.data),

  sendToMaintenance: (id: string, data: AssetActionRequest): Promise<AssetResponse> =>
    api.post(`/v1/assets/${id}/maintenance`, data).then(r => r.data),

  discardAsset: (id: string, data: AssetActionRequest): Promise<AssetResponse> =>
    api.post(`/v1/assets/${id}/discard`, data).then(r => r.data),

  // ── Stock ─────────────────────────────────────────────────────────────────────
  getStockItems: (): Promise<StockItemResponse[]> =>
    api.get('/v1/stock').then(r => r.data),

  getStockAlerts: (): Promise<StockItemResponse[]> =>
    api.get('/v1/stock/alerts').then(r => r.data),

  getStockItem: (id: string): Promise<StockItemResponse> =>
    api.get(`/v1/stock/${id}`).then(r => r.data),

  getStockMovements: (id: string): Promise<StockMovementResponse[]> =>
    api.get(`/v1/stock/${id}/movements`).then(r => r.data),

  createStockItem: (data: CreateStockItemRequest): Promise<StockItemResponse> =>
    api.post('/v1/stock', data).then(r => r.data),

  addStock: (id: string, data: StockAdjustmentRequest): Promise<StockItemResponse> =>
    api.post(`/v1/stock/${id}/add`, data).then(r => r.data),

  removeStock: (id: string, data: StockAdjustmentRequest): Promise<StockItemResponse> =>
    api.post(`/v1/stock/${id}/remove`, data).then(r => r.data),
}
```

```typescript
// src/services/governance.service.ts
import { api } from '@/lib/api'
import type { GovernanceMetrics, SlaConfig, UpdateSlaConfigRequest } from '@/types/governance.types'

export const governanceService = {
  getDashboard: (from?: string, to?: string): Promise<GovernanceMetrics> =>
    api.get('/v1/governance/dashboard', { params: { from, to } }).then(r => r.data),

  getTechnicianMetrics: (id: string, from?: string, to?: string): Promise<GovernanceMetrics> =>
    api.get(`/v1/governance/technicians/${id}/sla`, { params: { from, to } }).then(r => r.data),

  getSlaConfigs: (): Promise<SlaConfig[]> =>
    api.get('/v1/governance/sla/config').then(r => r.data),

  updateSlaConfig: (id: string, data: UpdateSlaConfigRequest): Promise<SlaConfig> =>
    api.put(`/v1/governance/sla/config/${id}`, data).then(r => r.data),
}
```

```typescript
// src/services/auth.service.ts
import { api } from '@/lib/api'
import type { LoginRequest, RefreshRequest, TokenPairResponse } from '@/types/auth.types'

export const authService = {
  login: (data: LoginRequest): Promise<TokenPairResponse> =>
    api.post('/v1/auth/login', data).then(r => r.data),

  refresh: (data: RefreshRequest): Promise<TokenPairResponse> =>
    api.post('/v1/auth/refresh', data).then(r => r.data),

  logout: (data: RefreshRequest): Promise<void> =>
    api.post('/v1/auth/logout', data).then(() => undefined),
}
```

---

## 11. WebSocket — QueuePanelPage + Chat

### Biblioteca

O backend usa **Spring WebSocket com STOMP + SockJS**. O endpoint SockJS está
em `/ws` (com `context-path: /api` → URL completa: `http://localhost:8080/api/ws`).
A biblioteca nativa `WebSocket` do browser **não** funciona com SockJS — é
necessário usar `sockjs-client` + `@stomp/stompjs`.

```bash
npm install sockjs-client@^1.6.1 @stomp/stompjs@^7.0.0
npm install -D @types/sockjs-client@^1.5.4
```

### Configuração STOMP

```typescript
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAppStore } from '@/store/appStore'

function createStompClient() {
  const { accessToken, tenant } = useAppStore.getState()
  return new Client({
    // SockJS como transport (necessário para Spring Boot)
    webSocketFactory: () => new SockJS(
      `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'}/ws`
    ),
    // Cabeçalhos enviados no frame CONNECT
    connectHeaders: {
      Authorization: `Bearer ${accessToken ?? ''}`,
      'X-Tenant-ID': tenant ?? '',
    },
    reconnectDelay: 5_000,
    heartbeatIncoming: 4_000,
    heartbeatOutgoing: 4_000,
  })
}
```

### `useQueuePanel()` — substituição do hook existente

O hook atual (`src/hooks/useQueuePanel.ts`) usa `WebSocket` nativo apontando
para `ws://localhost:8080/ws/queue-panel` — isso **não funciona** com o backend
Spring STOMP. Substituir pela versão STOMP abaixo.

```typescript
// src/hooks/helpdesk/useQueuePanel.ts  (substitui o existente em src/hooks/)
import { useState, useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAppStore } from '@/store/appStore'
import type { QueuePanelPayload } from '@/types/helpdesk.types'

const EMPTY: QueuePanelPayload = { openTickets: [], inProgressTickets: [], updatedAt: '' }

export function useQueuePanel() {
  const [data, setData]         = useState<QueuePanelPayload>(EMPTY)
  const [connected, setConnected] = useState(false)
  const clientRef               = useRef<Client | null>(null)
  const { accessToken, tenant } = useAppStore()

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${accessToken ?? ''}`,
        'X-Tenant-ID': tenant ?? '',
      },
      reconnectDelay: 5_000,
      onConnect: () => {
        setConnected(true)
        client.subscribe('/topic/queue-panel', (message) => {
          try {
            setData(JSON.parse(message.body) as QueuePanelPayload)
          } catch { /* ignore malformed */ }
        })
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
    })

    client.activate()
    clientRef.current = client

    return () => { client.deactivate() }
  }, [accessToken, tenant])

  return { data, connected }
}
```

### `useTicketChat(ticketId)` — novo hook

```typescript
// src/hooks/helpdesk/useTicketChat.ts
import { useState, useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useAppStore } from '@/store/appStore'
import type { ChatMessageResponse, ChatMessageRequest } from '@/types/helpdesk.types'

export function useTicketChat(ticketId: string) {
  const [messages, setMessages]   = useState<ChatMessageResponse[]>([])
  const [connected, setConnected] = useState(false)
  const clientRef                 = useRef<Client | null>(null)
  const { accessToken, tenant }   = useAppStore()

  useEffect(() => {
    if (!ticketId) return

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${accessToken ?? ''}`,
        'X-Tenant-ID': tenant ?? '',
      },
      reconnectDelay: 5_000,
      onConnect: () => {
        setConnected(true)
        client.subscribe(`/topic/ticket/${ticketId}/chat`, (message) => {
          try {
            const msg = JSON.parse(message.body) as ChatMessageResponse
            setMessages((prev) => [...prev, msg])
          } catch { /* ignore */ }
        })
      },
      onDisconnect: () => setConnected(false),
    })

    client.activate()
    clientRef.current = client

    return () => { client.deactivate() }
  }, [ticketId, accessToken, tenant])

  /** Envia mensagem via STOMP → /app/ticket/{ticketId}/chat */
  const sendMessage = useCallback((content: string) => {
    const payload: ChatMessageRequest = { content }
    clientRef.current?.publish({
      destination: `/app/ticket/${ticketId}/chat`,
      body: JSON.stringify(payload),
    })
  }, [ticketId])

  return { messages, connected, sendMessage }
}
```

### Estratégia de reconexão

- `reconnectDelay: 5_000` — o STOMP client reconecta automaticamente a cada 5s.
- Heartbeat: 4s incoming / 4s outgoing para detectar conexões mortas.
- Para o Queue Panel, há fallback via HTTP: `GET /v1/tickets/queue-panel`
  retorna o estado atual sem WebSocket — útil para o estado inicial enquanto o
  STOMP conecta.

---

## 12. Divergências de contrato (Frontend esperado vs. Backend real)

| Frontend espera | Backend expõe | Correção |
|-----------------|---------------|----------|
| `GET /api/v1/inventory/assets` | `GET /api/v1/assets` | Camada de serviço: usar `/v1/assets` |
| `GET /api/v1/inventory/assets/:id` | `GET /api/v1/assets/:id` | Camada de serviço: usar `/v1/assets/:id` |
| `GET /api/v1/inventory/consumables` | `GET /api/v1/stock` | Camada de serviço: usar `/v1/stock` |
| `POST /api/v1/inventory/consumables/:id/movements` | `POST /api/v1/stock/:id/add` ou `POST /api/v1/stock/:id/remove` | Usar dois endpoints separados; tipo da movimentação determina qual chamar |
| `GET /api/v1/inventory/movements` (log global) | Não existe endpoint global de movimentações — apenas `GET /v1/assets/:id/movements` e `GET /v1/stock/:id/movements` | `MovementsPage` precisará buscar e mesclar por entidade, ou aguardar endpoint dedicado no backend |
| `GET /api/v1/inventory/dashboard` | Não existe | `InventoryDashboardPage` precisará montar os KPIs a partir de `GET /v1/assets` + `GET /v1/stock` no front, ou aguardar endpoint dedicado |
| `GET /api/v1/inventory/categories` | Não existe (category é enum `AssetCategory`) | Hardcode dos valores do enum: `DESKTOP \| NOTEBOOK \| MONITOR \| PRINTER \| PHONE \| OTHER` |
| `GET /api/v1/inventory/locations` | Não existe | Aguardar implementação no backend; no formulário `NewAssetPage` usar campo `assignedDepartmentId` via `GET /v1/departments` como proxy |
| `GET /api/v1/inventory/assets/export` | Não existe | Aguardar implementação; esconder botão "Exportar" até disponível |
| `GET /api/v1/inventory/assets/import/*` | Não existe | Aguardar implementação; `ImportPage` completa bloqueada |
| `ws://localhost:8080/ws/queue-panel` (WebSocket nativo) | STOMP sobre SockJS em `/api/ws` | Substituir hook `useQueuePanel` por versão STOMP (ver seção 11) |
| `DELETE /api/v1/departments/:id` (esperado remover) | Chama `deactivate()` no domain — retorna `204` sem body | Tratar `204` como sucesso; não esperar body na resposta |
| `DELETE /api/v1/problem-types/:id` (esperado remover) | Mesma lógica de deactivate | Idem |
| Endpoints de usuários, perfis, SMTP, IA | Não implementados no backend | Manter mock nas páginas Admin até implementação |

---

## Variáveis de ambiente

Criar `nexops-web/.env.local` (não commitar):

```bash
VITE_API_URL=http://localhost:8080/api
```

Criar `nexops-web/.env.example` (commitar como referência):

```bash
# URL base da API (sem trailing slash)
# O context-path /api já está incluído
VITE_API_URL=http://localhost:8080/api
```
