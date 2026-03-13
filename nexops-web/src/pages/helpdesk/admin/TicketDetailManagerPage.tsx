import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CheckCircle, Download, Send, X, AlertCircle,
  FileText, Upload, RefreshCw, XCircle, UserPlus, Loader2,
} from 'lucide-react'
import { useTicket, useTicketComments, useAssignTicket, useCloseTicket, useTicketAttachments, useUploadAttachment } from '@/hooks/helpdesk/useTickets'
import { useTicketChat } from '@/hooks/helpdesk/useTicketChat'
import { useUsers } from '@/hooks/useUsers'
import { useAppStore } from '@/store/appStore'
import { helpdeskService } from '@/services/helpdesk.service'
import { formatDateTime } from '@/lib/utils'

// ── constants ─────────────────────────────────────────────────────────────────

const ACCENT  = '#4f6ef7'
const SUCCESS = '#16a34a'

// ── style maps ────────────────────────────────────────────────────────────────

const TIER_BADGE: Record<string, string> = {
  N1: 'bg-zinc-100 text-zinc-600',
  N2: 'bg-amber-50 text-amber-600',
  N3: 'bg-red-50 text-red-600',
}

const STATUS_BADGE: Record<string, string> = {
  OPEN:        'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-green-50 text-green-700',
  PAUSED:      'bg-amber-50 text-amber-700',
  CLOSED:      'bg-zinc-100 text-zinc-500',
}
const STATUS_LABEL: Record<string, string> = {
  OPEN:        'Aberto',
  IN_PROGRESS: 'Em Andamento',
  PAUSED:      'Pausado',
  CLOSED:      'Finalizado',
}

// ── shared sub-components ─────────────────────────────────────────────────────

function SectionTitle({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">{label}</h3>
      {action}
    </div>
  )
}

// ── modals ────────────────────────────────────────────────────────────────────

function AssignModal({
  currentTechId, selectedTechId, onSelectTech, onConfirm, onClose, isPending, users,
}: {
  currentTechId:  string | null
  selectedTechId: string
  onSelectTech:   (id: string) => void
  onConfirm:      () => void
  onClose:        () => void
  isPending:      boolean
  users:          { id: string; name: string; email: string }[]
}) {
  const isReassign = currentTechId !== null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">
            {isReassign ? 'Reatribuir Chamado' : 'Atribuir Técnico'}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isReassign && (
          <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5">
            <p className="text-xs text-zinc-600">
              Técnico atual será substituído.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">
            Técnico <span className="text-red-400">*</span>
          </label>
          <select
            value={selectedTechId}
            onChange={(e) => onSelectTech(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1 bg-white"
          >
            <option value="">Selecionar técnico...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.email}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} disabled={isPending} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-50">Cancelar</button>
          <button onClick={onConfirm} disabled={!selectedTechId || isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90"
            style={{ background: ACCENT }}>
            {isPending ? 'Atribuindo…' : 'Confirmar Atribuição'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CancelTicketModal({ ticketShortId, reason, onChangeReason, onConfirm, onClose }: {
  ticketShortId: string; reason: string; onChangeReason: (v: string) => void
  onConfirm: () => void; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Cancelar Chamado <span className="font-mono text-zinc-400">#{ticketShortId}</span></h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800">O solicitante será notificado do cancelamento.</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">Motivo do cancelamento <span className="text-red-400">*</span></label>
          <textarea value={reason} onChange={(e) => onChangeReason(e.target.value)}
            placeholder="Descreva o motivo do cancelamento..." autoFocus
            className="w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
            style={{ minHeight: 88 }} />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700">Voltar</button>
          <button onClick={onConfirm} disabled={!reason.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 transition-colors">
            Confirmar Cancelamento
          </button>
        </div>
      </div>
    </div>
  )
}

function FinalizeModal({ ticketShortId, resolution, onChangeResolution, onConfirm, onClose, isPending }: {
  ticketShortId: string; resolution: string; onChangeResolution: (v: string) => void
  onConfirm: () => void; onClose: () => void; isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Finalizar Chamado <span className="font-mono text-zinc-400">#{ticketShortId}</span></h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">Resolução aplicada <span className="text-red-400">*</span></label>
          <textarea value={resolution} onChange={(e) => onChangeResolution(e.target.value)}
            placeholder="Descreva o que foi feito para resolver o chamado..." autoFocus
            className="w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            style={{ minHeight: 100 }} />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} disabled={isPending} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-50">Cancelar</button>
          <button onClick={onConfirm} disabled={!resolution.trim() || isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90"
            style={{ background: SUCCESS }}>
            {isPending ? 'Finalizando…' : 'Confirmar Finalização'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function TicketDetailManagerPage() {
  const navigate    = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const user        = useAppStore((s) => s.user)

  const { data: ticket, isLoading }            = useTicket(id)
  const { data: httpComments = [] }            = useTicketComments(id)
  const { data: attachments = [] }             = useTicketAttachments(id)
  const { data: users = [] }                   = useUsers()
  const { messages: stompMessages, connected, sendMessage: stompSend } = useTicketChat(id)

  const assignTicket   = useAssignTicket()
  const closeTicket    = useCloseTicket()
  const uploadAttachment = useUploadAttachment()

  const fileInputRef   = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // modal states
  const [showAssign,   setShowAssign]   = useState(false)
  const [assignTechId, setAssignTechId] = useState('')
  const [showCancel,   setShowCancel]   = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelled,    setCancelled]    = useState(false)
  const [showFinalize, setShowFinalize] = useState(false)
  const [finalizeRes,  setFinalizeRes]  = useState('')

  // chat state
  const [chatText, setChatText] = useState('')

  // Merge HTTP initial comments + STOMP real-time messages, dedup by id
  const httpIds = new Set(httpComments.map((c) => c.id))
  const allMessages = [
    ...httpComments.filter((c) => c.type === 'MESSAGE'),
    ...stompMessages.filter((m) => !httpIds.has(m.id) && m.type === 'MESSAGE'),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const timelineEvents = httpComments.filter((c) => c.type !== 'MESSAGE')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages.length])

  // ── actions ──

  function openAssignModal() {
    setAssignTechId(ticket?.assigneeId ?? '')
    setShowAssign(true)
  }

  function confirmAssign() {
    if (!assignTechId) return
    assignTicket.mutate({ id, data: { technicianId: assignTechId } }, {
      onSuccess: () => setShowAssign(false),
    })
  }

  function confirmCancel() {
    if (!cancelReason.trim()) return
    setCancelled(true)
    setShowCancel(false)
    setCancelReason('')
  }

  function confirmFinalize() {
    if (!finalizeRes.trim()) return
    closeTicket.mutate(id, {
      onSuccess: () => { setShowFinalize(false); setFinalizeRes('') },
    })
  }

  function sendMessage() {
    if (!chatText.trim() || !id) return
    stompSend(chatText.trim())
    setChatText('')
  }

  async function downloadAttachment(attachmentId: string, filename: string) {
    const blob = await helpdeskService.downloadAttachment(attachmentId)
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !id) return
    uploadAttachment.mutate({ ticketId: id, file })
    e.target.value = ''
  }

  // ── derived ──

  const isClosed = cancelled || ticket?.status === 'CLOSED'

  if (isLoading || !ticket) {
    return (
      <div className="p-8 space-y-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-zinc-100 rounded-lg animate-pulse" />)}
      </div>
    )
  }

  const shortId = ticket.id.slice(0, 8)

  // Find assignee name from users list
  const assigneeName = users.find((u) => u.id === ticket.assigneeId)?.name

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 104px)' }}>

      {/* ── Left column — 2fr ── */}
      <div className="flex flex-col overflow-hidden bg-white" style={{ flex: 2, borderRight: '1px solid #e4e4e7' }}>

        <div
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#e4e4e7 transparent' }}
        >

          {/* ── Ticket header ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-zinc-400">#{shortId}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_BADGE[ticket.slaLevel]}`}>{ticket.slaLevel}</span>
            </div>
            <h1 className="font-bold text-zinc-900 leading-snug" style={{ fontSize: 18 }}>{ticket.title}</h1>
            <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${cancelled ? 'bg-red-50 text-red-600' : STATUS_BADGE[ticket.status]}`}>
              {cancelled ? 'Cancelado' : STATUS_LABEL[ticket.status]}
            </span>
          </div>

          <div className="border-t border-zinc-100" />

          {/* ── Solicitante ── */}
          <div>
            <SectionTitle label="Solicitante" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                {ticket.requesterId.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 font-mono">{ticket.requesterId.slice(0, 8)}…</p>
                <p className="text-xs text-zinc-500">Aberto em {formatDateTime(ticket.openedAt)}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* ── Atribuição ── */}
          <div>
            <SectionTitle label="Atribuição" />
            {ticket.assigneeId ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                    {(assigneeName ?? ticket.assigneeId).slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm text-zinc-700">
                    {assigneeName ?? <span className="font-mono text-zinc-400">{ticket.assigneeId.slice(0, 8)}…</span>}
                  </span>
                </div>
                {!isClosed && (
                  <button
                    onClick={openAssignModal}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reatribuir
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Não atribuído</span>
                {!isClosed && (
                  <button
                    onClick={openAssignModal}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                    style={{ background: ACCENT }}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Atribuir Técnico
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-100" />

          {/* ── Descrição ── */}
          <div>
            <SectionTitle label="Descrição" />
            <div className="bg-zinc-50 rounded-md px-4 py-3 text-sm text-zinc-600 leading-relaxed">
              {ticket.description}
            </div>
          </div>

          {ticket.pauseReason && (
            <>
              <div className="border-t border-zinc-100" />
              <div>
                <SectionTitle label="Motivo da Pausa" />
                <div className="bg-amber-50 border border-amber-100 rounded-md px-4 py-3 text-sm text-amber-800 leading-relaxed">
                  {ticket.pauseReason}
                </div>
              </div>
            </>
          )}

          <div className="border-t border-zinc-100" />

          {/* ── Chamados Filho ── */}
          <div>
            <SectionTitle label="Chamados Filho" />
            {ticket.parentTicketId ? (
              <p className="text-xs text-zinc-500">
                Este é um chamado filho de{' '}
                <button onClick={() => navigate(`/app/helpdesk/chamado-gestor/${ticket.parentTicketId}`)}
                  className="text-[#4f6ef7] underline font-mono">
                  #{ticket.parentTicketId.slice(0, 8)}
                </button>
              </p>
            ) : (
              <p className="text-sm text-zinc-400">Nenhum chamado filho criado.</p>
            )}
          </div>

          <div className="border-t border-zinc-100" />

          {/* ── Anexos ── */}
          <div>
            <SectionTitle label="Anexos" />
            <div className="space-y-2 mb-3">
              {attachments.length === 0 ? (
                <p className="text-sm text-zinc-400">Nenhum anexo.</p>
              ) : (
                attachments.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50">
                    <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span className="flex-1 text-sm text-zinc-700 truncate">{a.filename}</span>
                    <span className="text-xs text-zinc-400 shrink-0">{(a.sizeBytes / 1024).toFixed(0)} KB</span>
                    <button
                      onClick={() => downloadAttachment(a.id, a.filename)}
                      className="text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            {!isClosed && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAttachment.isPending}
                  className="w-full border-2 border-dashed border-zinc-200 rounded-lg p-5 flex flex-col items-center gap-1.5 text-zinc-400 hover:border-zinc-300 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  {uploadAttachment.isPending
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <Upload className="w-5 h-5" />
                  }
                  <p className="text-sm">{uploadAttachment.isPending ? 'Enviando...' : 'Clique para anexar'}</p>
                </button>
              </>
            )}
          </div>

          <div className="border-t border-zinc-100" />

          {/* ── Timeline ── */}
          <div>
            <SectionTitle label="Histórico" />
            <div>
              {[
                { dot: 'bg-green-500',  text: 'Chamado aberto',                                       time: formatDateTime(ticket.openedAt)  },
                ...(ticket.assignedAt ? [{ dot: 'bg-blue-500',   text: 'Chamado atribuído',            time: formatDateTime(ticket.assignedAt) }] : []),
                ...(ticket.pausedAt   ? [{ dot: 'bg-amber-400', text: `Pausado — ${ticket.pauseReason ?? ''}`, time: formatDateTime(ticket.pausedAt) }] : []),
                ...(ticket.closedAt   ? [{ dot: 'bg-green-500', text: 'Chamado finalizado',            time: formatDateTime(ticket.closedAt)  }] : []),
                ...timelineEvents.map((e) => ({ dot: 'bg-zinc-400', text: e.content, time: formatDateTime(e.createdAt) })),
              ].reverse().map((event, i, arr) => (
                <div key={i} className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${event.dot}`} />
                    {i < arr.length - 1 && <div className="w-px flex-1 bg-zinc-200 my-1" />}
                  </div>
                  <div className="pb-4 flex-1">
                    <p className="text-sm text-zinc-600">{event.text}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Fixed footer — manager actions */}
        {!isClosed && (
          <div className="shrink-0 bg-white border-t border-zinc-200 px-6 py-4 flex items-center gap-2">
            <button
              onClick={openAssignModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reatribuir
            </button>
            <button
              onClick={() => { setCancelReason(''); setShowCancel(true) }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Cancelar Chamado
            </button>
            <button
              onClick={() => { setFinalizeRes(''); setShowFinalize(true) }}
              className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: SUCCESS }}
            >
              <CheckCircle className="w-4 h-4" />
              Finalizar Chamado
            </button>
          </div>
        )}
        {(ticket.status === 'CLOSED' && !cancelled) && (
          <div className="shrink-0 bg-green-50 border-t border-green-100 px-6 py-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Chamado finalizado com sucesso.</span>
          </div>
        )}
        {cancelled && (
          <div className="shrink-0 bg-red-50 border-t border-red-100 px-6 py-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-700">Chamado cancelado.</span>
          </div>
        )}
      </div>

      {/* ── Right column — 3fr ── */}
      <div className="flex flex-col overflow-hidden bg-zinc-50" style={{ flex: 3 }}>

        {/* Chat header */}
        <div className="shrink-0 px-6 py-4 bg-white border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Chat do Chamado</h2>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`} />
            <span className="text-xs text-zinc-400">{connected ? 'Tempo real' : 'Conectando...'}</span>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#e4e4e7 transparent' }}
        >
          {allMessages.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-zinc-400">Nenhuma mensagem ainda.</p>
            </div>
          ) : (
            allMessages.map((msg) => {
              const isUserMsg = msg.authorId === ticket.requesterId
              const isMe      = msg.authorId === user?.userId
              const initials  = msg.authorId.slice(0, 2).toUpperCase()
              const time      = new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              const senderLabel = users.find((u) => u.id === msg.authorId)?.name ?? (isUserMsg ? 'Solicitante' : 'Técnico')

              if (isUserMsg) return (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                    {initials}
                  </div>
                  <div className="max-w-[78%]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-zinc-600">{senderLabel}</span>
                      <span className="text-xs text-zinc-400">{time}</span>
                    </div>
                    <div className="bg-zinc-100 text-zinc-800 rounded-xl rounded-bl-none px-4 py-2.5 text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                </div>
              )

              return (
                <div key={msg.id} className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-zinc-400">{time}</span>
                    <span className="text-xs font-medium text-zinc-600">{isMe ? 'Você' : senderLabel}</span>
                  </div>
                  <div
                    className="max-w-[78%] text-white rounded-xl rounded-br-none px-4 py-2.5 text-sm leading-relaxed"
                    style={{ background: ACCENT }}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input footer */}
        <div className="shrink-0 bg-white border-t border-zinc-200 px-6 py-4">
          <textarea
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            maxLength={1000}
            placeholder="Escreva uma mensagem..."
            className="w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
            style={{ minHeight: 80, maxHeight: 160 }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-zinc-400">{chatText.length}/1000</span>
            <button
              onClick={sendMessage}
              disabled={!chatText.trim() || !connected}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              style={{ background: ACCENT }}
            >
              <Send className="w-4 h-4" />
              Enviar
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAssign && (
        <AssignModal
          currentTechId={ticket.assigneeId}
          selectedTechId={assignTechId}
          onSelectTech={setAssignTechId}
          onConfirm={confirmAssign}
          onClose={() => setShowAssign(false)}
          isPending={assignTicket.isPending}
          users={users}
        />
      )}
      {showCancel && (
        <CancelTicketModal
          ticketShortId={shortId}
          reason={cancelReason}
          onChangeReason={setCancelReason}
          onConfirm={confirmCancel}
          onClose={() => setShowCancel(false)}
        />
      )}
      {showFinalize && (
        <FinalizeModal
          ticketShortId={shortId}
          resolution={finalizeRes}
          onChangeResolution={setFinalizeRes}
          onConfirm={confirmFinalize}
          onClose={() => setShowFinalize(false)}
          isPending={closeTicket.isPending}
        />
      )}
    </div>
  )
}
