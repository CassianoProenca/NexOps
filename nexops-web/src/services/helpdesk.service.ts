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
  AttachmentResponse,
} from '@/types/helpdesk.types'

export interface Department {
  id: string
  name: string
  description: string
  active: boolean
  createdAt: string
}

export interface ProblemType {
  id: string
  name: string
  description: string
  slaLevel: 'N1' | 'N2' | 'N3'
  active: boolean
  createdAt: string
}

export const helpdeskService = {
  // ─── Tickets ──────────────────────────────────────────────────────────────
  
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

  createChildTicket: (parentId: string, data: CreateTicketRequest): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${parentId}/child`, data).then(r => r.data),

  assignTicket: (id: string, data: AssignTicketRequest): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${id}/assign`, data).then(r => r.data),

  attendNext: (data: AttendNextRequest): Promise<TicketResponse> =>
    api.post('/v1/tickets/attend', data).then(r => r.data),

  pauseTicket: (id: string, data: PauseTicketRequest): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${id}/pause`, data).then(r => r.data),

  resumeTicket: (id: string): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${id}/resume`).then(r => r.data),

  closeTicket: (id: string, resolution: string): Promise<TicketResponse> =>
    api.post(`/v1/tickets/${id}/close`, { resolution }).then(r => r.data),

  getComments: (ticketId: string): Promise<CommentResponse[]> =>
    api.get(`/v1/tickets/${ticketId}/comments`).then(r => r.data),

  addComment: (ticketId: string, data: AddCommentRequest): Promise<CommentResponse> =>
    api.post(`/v1/tickets/${ticketId}/comments`, data).then(r => r.data),

  // ─── Attachments ──────────────────────────────────────────────────────────

  listAttachments: (ticketId: string): Promise<AttachmentResponse[]> =>
    api.get(`/v1/tickets/${ticketId}/attachments`).then(r => r.data),

  uploadAttachment: (ticketId: string, file: File): Promise<AttachmentResponse> => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/v1/tickets/${ticketId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },

  downloadAttachment: (attachmentId: string): Promise<Blob> =>
    api.get(`/v1/attachments/${attachmentId}`, { responseType: 'blob' }).then(r => r.data),

  // ─── Departments ──────────────────────────────────────────────────────────
  
  getDepartments: (): Promise<Department[]> =>
    api.get('/v1/departments').then((r) => r.data),

  createDepartment: (data: Partial<Department>): Promise<Department> =>
    api.post('/v1/departments', data).then((r) => r.data),

  updateDepartment: (id: string, data: Partial<Department>): Promise<Department> =>
    api.put(`/v1/departments/${id}`, data).then((r) => r.data),

  deleteDepartment: (id: string): Promise<void> =>
    api.delete(`/v1/departments/${id}`).then(() => undefined),

  reactivateDepartment: (id: string): Promise<void> =>
    api.patch(`/v1/departments/${id}/reactivate`).then(() => undefined),

  // ─── Problem Types ────────────────────────────────────────────────────────
  
  getProblemTypes: (): Promise<ProblemType[]> =>
    api.get('/v1/problem-types').then((r) => r.data),

  createProblemType: (data: Partial<ProblemType>): Promise<ProblemType> =>
    api.post('/v1/problem-types', data).then((r) => r.data),

  updateProblemType: (id: string, data: Partial<ProblemType>): Promise<ProblemType> =>
    api.put(`/v1/problem-types/${id}`, data).then((r) => r.data),

  deleteProblemType: (id: string): Promise<void> =>
    api.delete(`/v1/problem-types/${id}`).then(() => undefined),

  reactivateProblemType: (id: string): Promise<void> =>
    api.patch(`/v1/problem-types/${id}/reactivate`).then(() => undefined),
}
