import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  PauseCircle, CheckCircle, GitBranch, Upload, Download,
  MessageCircle, Lock, Send, Paperclip, X, AlertCircle,
  FileText, PlayCircle,
} from 'lucide-react'
import { useTicket, useTicketComments, useAddComment, usePauseTicket, useResumeTicket, useCloseTicket, useCreateChildTicket } from '@/hooks/helpdesk/useTickets'
import { useDepartments } from '@/hooks/helpdesk/useDepartments'
import { useProblemTypes } from '@/hooks/helpdesk/useProblemTypes'
import { useAppStore } from '@/store/useAppStore'
import { formatDateTime } from '@/lib/utils'

// ── constants ─────────────────────────────────────────────────────────────────

const ACCENT  = '#4f6ef7'
const SUCCESS = '#16a34a'

// ── types ─────────────────────────────────────────────────────────────────────

type ChatMode = 'message' | 'internal'

// ── helpers ───────────────────────────────────────────────────────────────────

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
  OPEN:        'Atribuído',
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

function PauseModal({ ticketId, reason, onChangeReason, onConfirm, onClose, isPending }: {
  ticketId: string; reason: string; onChangeReason: (v: string) => void
  onConfirm: () => void; onClose: () => void; isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Pausar Chamado <span className="font-mono text-zinc-400">#{ticketId.slice(0, 8)}</span></h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">Motivo da pausa</label>
          <textarea
            value={reason} onChange={(e) => onChangeReason(e.target.value)}
            placeholder="Ex: aguardando peça de reposição..." autoFocus
            className="w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            style={{ minHeight: 88 }}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} disabled={isPending} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-50">Cancelar</button>
          <button onClick={onConfirm} disabled={!reason.trim() || isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90"
            style={{ background: ACCENT }}>{isPending ? 'Pausando…' : 'Confirmar'}</button>
        </div>
      </div>
    </div>
  )
}

function FinalizeModal({ ticketId, resolution, onChangeResolution, onConfirm, onClose, isPending }: {
  ticketId: string; resolution: string; onChangeResolution: (v: string) => void
  onConfirm: () => void; onClose: () => void; isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Finalizar Chamado <span className="font-mono text-zinc-400">#{ticketId.slice(0, 8)}</span></h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">Resolução aplicada <span className="text-red-400">*</span></label>
          <textarea
            value={resolution} onChange={(e) => onChangeResolution(e.target.value)}
            placeholder="Descreva o que foi feito para resolver o chamado..." autoFocus
            className="w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            style={{ minHeight: 100 }}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} disabled={isPending} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-50">Cancelar</button>
          <button onClick={onConfirm} disabled={!resolution.trim() || isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90"
            style={{ background: SUCCESS }}>{isPending ? 'Finalizando…' : 'Confirmar Finalização'}</button>
        </div>
      </div>
    </div>
  )
}

function CreateChildModal({ parentId, depts, ptypes, onConfirm, onClose, isPending }: {
  parentId: string
  depts: { id: string; name: string }[]
  ptypes: { id: string; name: string }[]
  onConfirm: (departmentId: string, problemTypeId: string, title: string, description: string) => void
  onClose: () => void
  isPending: boolean
}) {
  const [form, setForm] = useState({ title: '', problemTypeId: '', departmentId: '', description: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))
  const canSubmit = form.title.trim() && form.problemTypeId && form.departmentId

  const inputCls = "w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1 bg-white"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Criar Chamado Filho <span className="font-mono text-zinc-400 text-sm">de #{parentId.slice(0, 8)}</span></h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600">Título do problema <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={set('title')} placeholder="Ex: Verificar IP da impressora" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">Tipo de Problema <span className="text-red-400">*</span></label>
              <select value={form.problemTypeId} onChange={set('problemTypeId')} className={inputCls}>
                <option value="">Selecionar...</option>
                {ptypes.map((pt) => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">Departamento <span className="text-red-400">*</span></label>
              <select value={form.departmentId} onChange={set('departmentId')} className={inputCls}>
                <option value="">Selecionar...</option>
                {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-600">Descrição <span className="text-zinc-400 font-normal">(opcional)</span></label>
            <textarea value={form.description} onChange={set('description')}
              placeholder="Detalhes adicionais sobre o problema..."
              className={`${inputCls} resize-none`} style={{ minHeight: 72 }} />
          </div>
        </div>

        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
          <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            O chamado filho será encaminhado para a fila do departamento selecionado.
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} disabled={isPending} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-50">Cancelar</button>
          <button
            onClick={() => canSubmit && onConfirm(form.departmentId, form.problemTypeId, form.title, form.description)}
            disabled={!canSubmit || isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90"
            style={{ background: ACCENT }}>
            <GitBranch className="w-4 h-4" />
            {isPending ? 'Criando…' : 'Criar Chamado Filho'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

const ATTACHMENTS = [
  { name: 'foto-erro.jpg',   size: '1.2 MB' },
  { name: 'config-rede.pdf', size: '340 KB' },
]

export default function TicketDetailTechPage() {
  const navigate    = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const user        = useAppStore((s) => s.user)
  const senderName  = user?.name ?? user?.email ?? 'Técnico'

  const { data: ticket, isLoading } = useTicket(id)
  const { data: comments = []      } = useTicketComments(id)
  const { data: departments = []   } = useDepartments()
  const { data: problemTypes = []  } = useProblemTypes()

  const pauseTicket   = usePauseTicket()
  const resumeTicket  = useResumeTicket()
  const closeTicket   = useCloseTicket()
  const createChild   = useCreateChildTicket()
  const addComment    = useAddComment()

  // modal states
  const [showPause,       setShowPause]       = useState(false)
  const [pauseReason,     setPauseReason]     = useState('')
  const [showFinalize,    setShowFinalize]    = useState(false)
  const [finalizeRes,     setFinalizeRes]     = useState('')
  const [showCreateChild, setShowCreateChild] = useState(false)

  // chat state
  const [chatText, setChatText] = useState('')
  const [chatMode, setChatMode] = useState<ChatMode>('message')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  // ── actions ──

  function confirmPause() {
    if (!pauseReason.trim()) return
    pauseTicket.mutate({ id, data: { reason: pauseReason } }, {
      onSuccess: () => { setShowPause(false); setPauseReason('') },
    })
  }

  function confirmFinalize() {
    if (!finalizeRes.trim()) return
    closeTicket.mutate(id, {
      onSuccess: () => { setShowFinalize(false); setFinalizeRes('') },
    })
  }

  function handleResume() {
    resumeTicket.mutate(id)
  }

  function handleCreateChild(departmentId: string, problemTypeId: string, title: string, description: string) {
    createChild.mutate({ parentId: id, data: { title, description: description || title, departmentId, problemTypeId } }, {
      onSuccess: () => setShowCreateChild(false),
    })
  }

  function sendMessage() {
    if (!chatText.trim()) return
    const type = chatMode === 'internal' ? 'TECHNICIAN_MESSAGE' : 'USER_MESSAGE'
    addComment.mutate({ ticketId: id, data: { content: chatText.trim() } }, {
      onSuccess: () => setChatText(''),
    })
    void type
  }

  // ── derived data ──

  const chatMessages  = comments.filter((c) => c.type === 'USER_MESSAGE' || c.type === 'TECHNICIAN_MESSAGE')
  const timelineEvents = comments.filter((c) => c.type === 'SYSTEM_EVENT')

  const isDone = ticket?.status === 'CLOSED'

  if (isLoading || !ticket) {
    return (
      <div className="p-8 space-y-3">
        {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-zinc-100 rounded-lg animate-pulse" />)}
      </div>
    )
  }

  return (
    <div
      className="flex overflow-hidden"
      style={{ height: 'calc(100vh - 104px)' }}
    >

      {/* ── Left column — 2fr ── */}
      <div className="flex flex-col overflow-hidden bg-white" style={{ flex: 2, borderRight: '1px solid #e4e4e7' }}>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#e4e4e7 transparent' }}>

          {/* ── Ticket header ── */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-zinc-400">#{ticket.id.slice(0, 8)}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_BADGE[ticket.slaLevel]}`}>{ticket.slaLevel}</span>
            </div>
            <h1 className="font-bold text-zinc-900 leading-snug" style={{ fontSize: 18 }}>{ticket.title}</h1>
            <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[ticket.status]}`}>
              {STATUS_LABEL[ticket.status]}
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

          {/* ── Descrição ── */}
          <div>
            <SectionTitle label="Descrição" />
            <div className="bg-zinc-50 rounded-md px-4 py-3 text-sm text-zinc-600 leading-relaxed" style={{ borderRadius: 6 }}>
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
            <SectionTitle
              label="Chamados Filho"
              action={
                <button
                  onClick={() => setShowCreateChild(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 transition-colors"
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  + Criar Filho
                </button>
              }
            />
            {ticket.parentTicketId ? (
              <p className="text-xs text-zinc-500">
                Este é um chamado filho de{' '}
                <button onClick={() => navigate(`/app/helpdesk/chamado/${ticket.parentTicketId}`)}
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
              {ATTACHMENTS.map((a) => (
                <div key={a.name} className="flex items-center gap-3 px-3 py-2 rounded-lg border border-zinc-200 bg-zinc-50">
                  <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="flex-1 text-sm text-zinc-700 truncate">{a.name}</span>
                  <span className="text-xs text-zinc-400 shrink-0">{a.size}</span>
                  <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="border-2 border-dashed border-zinc-200 rounded-lg p-5 flex flex-col items-center gap-1.5 text-zinc-400 cursor-pointer hover:border-zinc-300 hover:bg-zinc-50 transition-colors">
              <Upload className="w-5 h-5" />
              <p className="text-sm">Arraste arquivos ou clique para anexar</p>
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* ── Timeline ── */}
          <div>
            <SectionTitle label="Histórico" />
            <div>
              {/* Always show ticket open event first */}
              {[
                { dot: 'bg-green-500', text: 'Chamado aberto', time: formatDateTime(ticket.openedAt) },
                ...(ticket.assignedAt ? [{ dot: 'bg-blue-500', text: 'Chamado atribuído', time: formatDateTime(ticket.assignedAt) }] : []),
                ...(ticket.pausedAt   ? [{ dot: 'bg-amber-400', text: `Pausado — ${ticket.pauseReason ?? ''}`, time: formatDateTime(ticket.pausedAt) }] : []),
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

        {/* Fixed footer — actions */}
        {!isDone && (
          <div className="shrink-0 bg-white border-t border-zinc-200 px-6 py-4 flex items-center gap-2">
            <button
              onClick={() => { setPauseReason(''); setShowPause(true) }}
              disabled={ticket.status === 'PAUSED'}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <PauseCircle className="w-4 h-4" />
              Pausar
            </button>
            <button
              onClick={() => setShowCreateChild(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 transition-colors"
            >
              <GitBranch className="w-4 h-4" />
              Criar Filho
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
        {isDone && (
          <div className="shrink-0 bg-green-50 border-t border-green-100 px-6 py-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Chamado finalizado com sucesso.</span>
          </div>
        )}
      </div>

      {/* ── Right column — 3fr ── */}
      <div className="flex flex-col overflow-hidden bg-zinc-50" style={{ flex: 3 }}>

        {/* Chat header */}
        <div className="shrink-0 px-6 py-4 bg-white border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Chat do Chamado</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-zinc-400">Conectado</span>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#e4e4e7 transparent' }}
        >
          {chatMessages.map((msg) => {
            const isUserMsg = msg.type === 'USER_MESSAGE'
            const initials  = msg.authorId.slice(0, 2).toUpperCase()
            const time      = new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

            if (isUserMsg) return (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                  {initials}
                </div>
                <div className="max-w-[78%]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-zinc-600 font-mono">{msg.authorId.slice(0, 8)}</span>
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
                  <span className="text-xs font-medium text-zinc-600">{senderName}</span>
                </div>
                <div
                  className="max-w-[78%] text-white rounded-xl rounded-br-none px-4 py-2.5 text-sm leading-relaxed"
                  style={{ background: ACCENT }}
                >
                  {msg.content}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input footer */}
        <div className="shrink-0 bg-white border-t border-zinc-200 px-6 py-4">
          {/* Mode tabs */}
          <div className="flex gap-1 mb-3">
            <button
              onClick={() => setChatMode('message')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{
                background: chatMode === 'message' ? '#eef1ff' : 'transparent',
                color:      chatMode === 'message' ? ACCENT    : '#71717a',
              }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Mensagem
            </button>
            <button
              onClick={() => setChatMode('internal')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{
                background: chatMode === 'internal' ? '#fffbeb' : 'transparent',
                color:      chatMode === 'internal' ? '#d97706' : '#71717a',
              }}
            >
              <Lock className="w-3.5 h-3.5" />
              Nota Interna
            </button>
          </div>

          {/* Textarea */}
          <textarea
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            maxLength={1000}
            placeholder={chatMode === 'message'
              ? 'Escreva uma mensagem...'
              : 'Escreva uma nota interna — não será visível ao solicitante...'}
            className="w-full resize-none rounded-lg p-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{
              minHeight:   80,
              maxHeight:   160,
              border:      chatMode === 'internal' ? '1px solid #fbbf24' : '1px solid #e4e4e7',
              background:  chatMode === 'internal' ? 'rgba(255,251,235,0.5)' : '#fff',
            } as React.CSSProperties}
          />

          {/* Controls row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <span className="text-xs text-zinc-400">{chatText.length}/1000</span>
            </div>
            <button
              onClick={sendMessage}
              disabled={!chatText.trim() || addComment.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              style={{ background: chatMode === 'internal' ? '#d97706' : ACCENT }}
            >
              <Send className="w-4 h-4" />
              Enviar
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPause && (
        <PauseModal ticketId={id} reason={pauseReason} onChangeReason={setPauseReason}
          onConfirm={confirmPause} onClose={() => setShowPause(false)} isPending={pauseTicket.isPending} />
      )}
      {showFinalize && (
        <FinalizeModal ticketId={id} resolution={finalizeRes} onChangeResolution={setFinalizeRes}
          onConfirm={confirmFinalize} onClose={() => setShowFinalize(false)} isPending={closeTicket.isPending} />
      )}
      {showCreateChild && (
        <CreateChildModal
          parentId={id}
          depts={departments.filter((d) => d.active)}
          ptypes={problemTypes.filter((p) => p.active)}
          onConfirm={handleCreateChild}
          onClose={() => setShowCreateChild(false)}
          isPending={createChild.isPending}
        />
      )}

      {/* Resume button overlay when paused */}
      {ticket.status === 'PAUSED' && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={handleResume}
            disabled={resumeTicket.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: ACCENT }}
          >
            <PlayCircle className="w-4 h-4" />
            {resumeTicket.isPending ? 'Retomando…' : 'Retomar Atendimento'}
          </button>
        </div>
      )}

    </div>
  )
}
