import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { helpdeskService } from '@/services/helpdesk.service'
import type {
  CreateTicketRequest,
  AssignTicketRequest,
  AttendNextRequest,
  PauseTicketRequest,
  AddCommentRequest,
} from '@/types/helpdesk.types'

export const attachmentKeys = {
  list: (ticketId: string) => ['attachments', ticketId] as const,
}

// ── Query keys ────────────────────────────────────────────────────────────────
export const ticketKeys = {
  all:      ['tickets'] as const,
  lists:    () => [...ticketKeys.all, 'list'] as const,
  my:       () => [...ticketKeys.all, 'my'] as const,
  assigned: () => [...ticketKeys.all, 'assigned'] as const,
  queue:    (ptId: string) => [...ticketKeys.all, 'queue', ptId] as const,
  detail:   (id: string) => [...ticketKeys.all, id] as const,
  comments: (id: string) => [...ticketKeys.all, id, 'comments'] as const,
  panel:    () => [...ticketKeys.all, 'panel'] as const,
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useAllTickets() {
  return useQuery({
    queryKey: ticketKeys.lists(),
    queryFn: helpdeskService.getAllTickets,
  })
}

export function useMyTickets() {
  return useQuery({
    queryKey: ticketKeys.my(),
    queryFn: helpdeskService.getMyTickets,
  })
}

export function useAssignedTickets() {
  return useQuery({
    queryKey: ticketKeys.assigned(),
    queryFn: helpdeskService.getAssignedTickets,
  })
}

export function useTicketQueue(problemTypeId: string) {
  return useQuery({
    queryKey: ticketKeys.queue(problemTypeId),
    queryFn: () => helpdeskService.getQueue(problemTypeId),
    staleTime: 15_000,
    enabled: !!problemTypeId,
  })
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => helpdeskService.getTicket(id),
    enabled: !!id,
  })
}

export function useTicketComments(ticketId: string) {
  return useQuery({
    queryKey: ticketKeys.comments(ticketId),
    queryFn: () => helpdeskService.getComments(ticketId),
    staleTime: 10_000,
    enabled: !!ticketId,
  })
}

export function useQueuePanelHttp() {
  return useQuery({
    queryKey: ticketKeys.panel(),
    queryFn: helpdeskService.getQueuePanel,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTicketRequest) => helpdeskService.createTicket(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.my() })
    },
  })
}

export function useAttendNext() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AttendNextRequest) =>
      helpdeskService.attendNext(data),
    onSuccess: (ticket) => {
      qc.invalidateQueries({ queryKey: ticketKeys.assigned() })
      qc.invalidateQueries({ queryKey: ticketKeys.detail(ticket.id) })
    },
  })
}

export function useAssignTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignTicketRequest }) =>
      helpdeskService.assignTicket(id, data),
    onSuccess: (ticket) => {
      qc.invalidateQueries({ queryKey: ticketKeys.lists() })
      qc.invalidateQueries({ queryKey: ticketKeys.detail(ticket.id) })
    },
  })
}

export function usePauseTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PauseTicketRequest }) =>
      helpdeskService.pauseTicket(id, data),
    onSuccess: (ticket) => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(ticket.id) })
      qc.invalidateQueries({ queryKey: ticketKeys.assigned() })
    },
  })
}

export function useResumeTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => helpdeskService.resumeTicket(id),
    onSuccess: (ticket) => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(ticket.id) })
      qc.invalidateQueries({ queryKey: ticketKeys.assigned() })
    },
  })
}

export function useCloseTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: string }) => 
      helpdeskService.closeTicket(id, resolution),
    onSuccess: (ticket) => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(ticket.id) })
      qc.invalidateQueries({ queryKey: ticketKeys.assigned() })
      qc.invalidateQueries({ queryKey: ticketKeys.lists() })
    },
  })
}

export function useCreateChildTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ parentId, data }: { parentId: string; data: CreateTicketRequest }) =>
      helpdeskService.createChildTicket(parentId, data),
    onSuccess: (ticket) => {
      qc.invalidateQueries({ queryKey: ticketKeys.detail(ticket.parentTicketId ?? ticket.id) })
    },
  })
}

export function useAddComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: AddCommentRequest }) =>
      helpdeskService.addComment(ticketId, data),
    onSuccess: (comment) => {
      qc.invalidateQueries({ queryKey: ticketKeys.comments(comment.ticketId) })
    },
  })
}

export function useTicketAttachments(ticketId: string) {
  return useQuery({
    queryKey: attachmentKeys.list(ticketId),
    queryFn: () => helpdeskService.listAttachments(ticketId),
    enabled: !!ticketId,
  })
}

export function useUploadAttachment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, file }: { ticketId: string; file: File }) =>
      helpdeskService.uploadAttachment(ticketId, file),
    onSuccess: (attachment) => {
      qc.invalidateQueries({ queryKey: attachmentKeys.list(attachment.ticketId) })
    },
  })
}
