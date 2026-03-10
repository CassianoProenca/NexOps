import { api } from '@/lib/api'
import type {
  TicketResponse,
  TicketSummaryResponse,
  CreateTicketRequest,
  AssignTicketRequest,
  AttendNextRequest,
  PauseTicketRequest,
  AddCommentRequest,
  CommentResponse,
  QueuePanelPayload,
  Department,
  CreateDepartmentRequest,
  ProblemType,
  CreateProblemTypeRequest,
} from '@/types/helpdesk.types'

export const helpdeskService = {
  // ── Tickets ──────────────────────────────────────────────────────────────

  getAllTickets: (): Promise<TicketSummaryResponse[]> =>
    api.get('/v1/tickets').then((r) => r.data),

  getMyTickets: (): Promise<TicketSummaryResponse[]> =>
    api.get('/v1/tickets/my').then((r) => r.data),

  getAssignedTickets: (): Promise<TicketSummaryResponse[]> =>
    api.get('/v1/tickets/assigned').then((r) => r.data),

  getQueue: (problemTypeId: string): Promise<TicketSummaryResponse[]> =>
    api.get(`/v1/tickets/queue/${problemTypeId}`).then((r) => r.data),

  getTicket: (id: string): Promise<TicketResponse> =>
    api.get(`/v1/tickets/${id}`).then((r) => r.data),

  getQueuePanel: (): Promise<QueuePanelPayload> =>
    api.get('/v1/tickets/queue-panel').then((r) => r.data),

  createTicket: (data: CreateTicketRequest): Promise<TicketResponse> =>
    api.post('/v1/tickets', data).then((r) => r.data),

  attendNext: (ticketId: string, data: AttendNextRequest): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${ticketId}/attend`, data).then((r) => r.data),

  assignTicket: (id: string, data: AssignTicketRequest): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${id}/assign`, data).then((r) => r.data),

  pauseTicket: (id: string, data: PauseTicketRequest): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${id}/pause`, data).then((r) => r.data),

  resumeTicket: (id: string): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${id}/resume`).then((r) => r.data),

  closeTicket: (id: string): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${id}/close`).then((r) => r.data),

  createChildTicket: (parentId: string, data: CreateTicketRequest): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${parentId}/child`, data).then((r) => r.data),

  getComments: (ticketId: string): Promise<CommentResponse[]> =>
    api.get(`/v1/tickets/${ticketId}/comments`).then((r) => r.data),

  addComment: (ticketId: string, data: AddCommentRequest): Promise<CommentResponse> =>
    api.post(`/v1/tickets/${ticketId}/comments`, data).then((r) => r.data),

  // ── Departments ───────────────────────────────────────────────────────────

  getDepartments: (): Promise<Department[]> =>
    api.get('/v1/departments').then((r) => r.data),

  createDepartment: (data: CreateDepartmentRequest): Promise<Department> =>
    api.post('/v1/departments', data).then((r) => r.data),

  /** DELETE retorna 204 sem body — backend chama deactivate() */
  deactivateDepartment: (id: string): Promise<void> =>
    api.delete(`/v1/departments/${id}`).then(() => undefined),

  // ── Problem Types ─────────────────────────────────────────────────────────

  getProblemTypes: (): Promise<ProblemType[]> =>
    api.get('/v1/problem-types').then((r) => r.data),

  createProblemType: (data: CreateProblemTypeRequest): Promise<ProblemType> =>
    api.post('/v1/problem-types', data).then((r) => r.data),

  /** DELETE retorna 204 sem body — backend chama deactivate() */
  deactivateProblemType: (id: string): Promise<void> =>
    api.delete(`/v1/problem-types/${id}`).then(() => undefined),
}
