// ─── Enums ───────────────────────────────────────────────────────────────────

export type TicketStatus    = 'OPEN' | 'IN_PROGRESS' | 'PAUSED' | 'CLOSED'
export type SlaLevel        = 'N1' | 'N2' | 'N3'
export type InternalPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type CommentType     = 'MESSAGE' | 'STATUS_CHANGE' | 'ASSIGNMENT' | 'PAUSE' | 'SYSTEM'

// ─── Department ──────────────────────────────────────────────────────────────
// GET    /v1/departments      → Department[]
// POST   /v1/departments      → Department
// DELETE /v1/departments/:id  → 204 (sem body)

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
// GET    /v1/problem-types      → ProblemType[]
// POST   /v1/problem-types      → ProblemType
// DELETE /v1/problem-types/:id  → 204 (sem body)

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

/** POST /v1/tickets */
export interface CreateTicketRequest {
  title: string
  description: string
  departmentId: string
  problemTypeId: string
}

/** GET /v1/tickets/:id  |  POST /v1/tickets  etc. */
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
  isSlaBreached: boolean
  createdAt: string
  updatedAt: string
}

/** GET /v1/tickets  |  GET /v1/tickets/my  |  GET /v1/tickets/assigned  etc. */
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

/** POST /v1/tickets/:id/assign */
export interface AssignTicketRequest {
  technicianId: string
}

/** POST /v1/tickets/:id/attend */
export interface AttendNextRequest {
  problemTypeId: string
}

/** POST /v1/tickets/:id/pause */
export interface PauseTicketRequest {
  reason: string
}

// ─── Comments ────────────────────────────────────────────────────────────────

/** POST /v1/tickets/:id/comments */
export interface AddCommentRequest {
  content: string
}

/** GET /v1/tickets/:id/comments → CommentResponse[] */
export interface CommentResponse {
  id: string
  ticketId: string
  authorId: string
  content: string
  type: CommentType
  createdAt: string
}

// ─── WebSocket — Queue Panel ─────────────────────────────────────────────────
// STOMP topic: /topic/queue-panel  (broadcast a cada 15s pelo Spring)
// HTTP fallback: GET /v1/tickets/queue-panel

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
// STOMP destino  (envio):      /app/ticket/{ticketId}/chat
// STOMP tópico  (recebimento): /topic/ticket/{ticketId}/chat

/** Payload enviado via STOMP para o chat de um ticket */
export interface ChatMessageRequest {
  content: string
}

/** Payload recebido via STOMP do chat de um ticket */
export interface ChatMessageResponse {
  id: string
  ticketId: string
  authorId: string
  authorName: string
  content: string
  type: CommentType
  createdAt: string
}
