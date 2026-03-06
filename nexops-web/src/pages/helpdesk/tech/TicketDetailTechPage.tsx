import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PauseCircle, CheckCircle, GitBranch, Upload, Download,
  MessageCircle, Lock, Send, Paperclip, X, AlertCircle,
  FileText, PlayCircle,
} from 'lucide-react'

// ── constants ─────────────────────────────────────────────────────────────────

const ACCENT  = '#4f6ef7'
const SUCCESS = '#16a34a'

// ── types ─────────────────────────────────────────────────────────────────────

type TicketStatus  = 'assigned' | 'inProgress' | 'paused' | 'done'
type ChildStatus   = 'open' | 'inProgress' | 'done'
type ChatMode      = 'message' | 'internal'
type MessageType   = 'user' | 'tech' | 'internal'

interface ChildTicket { id: number; title: string; status: ChildStatus }
interface ChatMessage  { id: number; type: MessageType; sender: string; initials?: string; text: string; time: string }

// ── mock data ─────────────────────────────────────────────────────────────────

const TICKET = {
  id:          1042,
  title:       'Impressora não responde',
  description: 'Impressora HP do setor de RH não imprime desde ontem. A impressora aparece como offline no computador, mas está ligada e o painel não mostra erros visíveis.',
  type:        'Impressora',
  tier:        'N2',
  openedAt:    '07/03/2026 às 09:14',
  requester:   { name: 'Maria Silva', initials: 'MS', department: 'RH' },
}

const INITIAL_CHILDREN: ChildTicket[] = [
  { id: 1043, title: 'Verificar configuração de rede', status: 'inProgress' },
]

const ATTACHMENTS = [
  { name: 'foto-erro.jpg',    size: '1.2 MB' },
  { name: 'config-rede.pdf',  size: '340 KB' },
]

const TIMELINE = [
  { dot: 'bg-green-500',  text: 'Chamado aberto por Maria Silva',                   time: '09:14' },
  { dot: 'bg-blue-500',   text: 'Atribuído a Cassiano Proença pelo gestor',         time: '09:45' },
  { dot: 'bg-amber-400',  text: 'Atendimento iniciado',                             time: '10:02' },
  { dot: 'bg-zinc-400',   text: 'Pausado — Aguardando peça de reposição',           time: '11:30' },
  { dot: 'bg-blue-500',   text: 'Atendimento retomado',                             time: '14:05' },
]

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, type: 'user',     sender: 'Maria Silva',      initials: 'MS', text: 'Minha impressora HP não imprime desde ontem. Aparece erro offline.',                                   time: '09:14' },
  { id: 2, type: 'tech',     sender: 'Cassiano Proença',                 text: 'Bom dia! Já recebi seu chamado. Vou verificar o status da impressora remotamente.',                   time: '10:03' },
  { id: 3, type: 'internal', sender: 'Cassiano Proença',                 text: 'Verificar se o IP da impressora mudou após reinicialização do roteador ontem.',                       time: '10:05' },
  { id: 4, type: 'user',     sender: 'Maria Silva',      initials: 'MS', text: 'Preciso imprimir documentos urgentes para reunião às 15h.',                                           time: '10:15' },
  { id: 5, type: 'tech',     sender: 'Cassiano Proença',                 text: 'Entendido! Estou priorizando sua solicitação.',                                                       time: '10:17' },
]

// ── helpers ───────────────────────────────────────────────────────────────────

const TIER_BADGE: Record<string, string> = {
  N1: 'bg-zinc-100 text-zinc-600',
  N2: 'bg-amber-50 text-amber-600',
  N3: 'bg-red-50 text-red-600',
}

const STATUS_BADGE: Record<TicketStatus, string> = {
  assigned:   'bg-blue-50 text-blue-700',
  inProgress: 'bg-green-50 text-green-700',
  paused:     'bg-amber-50 text-amber-700',
  done:       'bg-zinc-100 text-zinc-500',
}
const STATUS_LABEL: Record<TicketStatus, string> = {
  assigned:   'Atribuído',
  inProgress: 'Em Andamento',
  paused:     'Pausado',
  done:       'Finalizado',
}

const CHILD_BADGE: Record<ChildStatus, string> = {
  open:       'bg-zinc-100 text-zinc-600',
  inProgress: 'bg-blue-50 text-blue-600',
  done:       'bg-green-50 text-green-700',
}
const CHILD_LABEL: Record<ChildStatus, string> = {
  open:       'Aberto',
  inProgress: 'Em Andamento',
  done:       'Finalizado',
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

function PauseModal({ ticketId, reason, onChangeReason, onConfirm, onClose }: {
  ticketId: number; reason: string; onChangeReason: (v: string) => void; onConfirm: () => void; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Pausar Chamado <span className="font-mono text-zinc-400">#{ticketId}</span></h3>
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
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700">Cancelar</button>
          <button onClick={onConfirm} disabled={!reason.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90"
            style={{ background: ACCENT }}>Confirmar</button>
        </div>
      </div>
    </div>
  )
}

function FinalizeModal({ ticketId, resolution, onChangeResolution, hasOpenChildren, onConfirm, onClose }: {
  ticketId: number; resolution: string; onChangeResolution: (v: string) => void
  hasOpenChildren: boolean; onConfirm: () => void; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Finalizar Chamado <span className="font-mono text-zinc-400">#{ticketId}</span></h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X className="w-4 h-4" /></button>
        </div>
        {hasOpenChildren && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">Existem chamados filho ainda não finalizados. Finalize-os primeiro.</p>
          </div>
        )}
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
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700">Cancelar</button>
          <button onClick={onConfirm} disabled={!resolution.trim() || hasOpenChildren}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90"
            style={{ background: SUCCESS }}>Confirmar Finalização</button>
        </div>
      </div>
    </div>
  )
}

function CreateChildModal({ parentId, onConfirm, onClose }: {
  parentId: number
  onConfirm: (title: string, type: string, department: string, description: string) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({ title: '', type: '', department: '', description: '' })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))
  const canSubmit = form.title.trim() && form.type && form.department

  const inputCls = "w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1 bg-white"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Criar Chamado Filho <span className="font-mono text-zinc-400 text-sm">de #{parentId}</span></h3>
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
              <select value={form.type} onChange={set('type')} className={inputCls}>
                <option value="">Selecionar...</option>
                <option>Hardware</option>
                <option>Software</option>
                <option>Acessos</option>
                <option>Impressora</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">Departamento <span className="text-red-400">*</span></label>
              <select value={form.department} onChange={set('department')} className={inputCls}>
                <option value="">Selecionar...</option>
                <option>RH</option>
                <option>Finanças</option>
                <option>Saúde</option>
                <option>Educação</option>
                <option>Administração</option>
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
            Este chamado só poderá ser finalizado após todos os filhos serem finalizados.
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700">Cancelar</button>
          <button onClick={() => canSubmit && onConfirm(form.title, form.type, form.department, form.description)}
            disabled={!canSubmit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90"
            style={{ background: ACCENT }}>
            <GitBranch className="w-4 h-4" />
            Criar Chamado Filho
          </button>
        </div>
      </div>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function TicketDetailTechPage() {
  const navigate = useNavigate()

  // ticket state
  const [ticketStatus,    setTicketStatus]    = useState<TicketStatus>('inProgress')
  const [children,        setChildren]        = useState<ChildTicket[]>(INITIAL_CHILDREN)

  // modal states
  const [showPause,       setShowPause]       = useState(false)
  const [pauseReason,     setPauseReason]     = useState('')
  const [showFinalize,    setShowFinalize]    = useState(false)
  const [finalizeRes,     setFinalizeRes]     = useState('')
  const [showCreateChild, setShowCreateChild] = useState(false)

  // chat state
  const [messages,  setMessages]  = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [chatText,  setChatText]  = useState('')
  const [chatMode,  setChatMode]  = useState<ChatMode>('message')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── actions ──

  function confirmPause() {
    if (!pauseReason.trim()) return
    setTicketStatus('paused')
    setShowPause(false)
    setPauseReason('')
  }

  function confirmFinalize() {
    if (!finalizeRes.trim()) return
    setTicketStatus('done')
    setShowFinalize(false)
    setFinalizeRes('')
  }

  function createChild(title: string, type: string, department: string, description: string) {
    const id = 1060 + children.length
    setChildren((p) => [...p, { id, title: `[${type}/${department}] ${title}`, status: 'open' }])
    setShowCreateChild(false)
    void description
  }

  function sendMessage() {
    if (!chatText.trim()) return
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    setMessages((p) => [...p, {
      id:      Date.now(),
      type:    chatMode === 'message' ? 'tech' : 'internal',
      sender:  'Cassiano Proença',
      text:    chatText.trim(),
      time:    now,
    }])
    setChatText('')
  }

  const hasOpenChildren = children.some((c) => c.status !== 'done')
  const isDone          = ticketStatus === 'done'

  return (
    // -m cancels the parent wrapper p-4/p-8, height fills viewport minus Header (h-16) + Footer (h-10)
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
              <span className="font-mono text-sm text-zinc-400">#{TICKET.id}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_BADGE[TICKET.tier]}`}>{TICKET.tier}</span>
              <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{TICKET.type}</span>
            </div>
            <h1 className="font-bold text-zinc-900 leading-snug" style={{ fontSize: 18 }}>{TICKET.title}</h1>
            <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[ticketStatus]}`}>
              {STATUS_LABEL[ticketStatus]}
            </span>
          </div>

          <div className="border-t border-zinc-100" />

          {/* ── Solicitante ── */}
          <div>
            <SectionTitle label="Solicitante" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                {TICKET.requester.initials}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">{TICKET.requester.name}</p>
                <p className="text-xs text-zinc-500">{TICKET.requester.department} · Aberto em {TICKET.openedAt}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* ── Descrição ── */}
          <div>
            <SectionTitle label="Descrição" />
            <div className="bg-zinc-50 rounded-md px-4 py-3 text-sm text-zinc-600 leading-relaxed" style={{ borderRadius: 6 }}>
              {TICKET.description}
            </div>
          </div>

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
            {children.length === 0 ? (
              <p className="text-sm text-zinc-400">Nenhum chamado filho criado.</p>
            ) : (
              <div className="space-y-2">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => navigate(`/app/helpdesk/chamado/${child.id}`)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-100 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left ${child.status === 'done' ? 'opacity-50' : ''}`}
                  >
                    <span className="font-mono text-xs text-zinc-400 shrink-0">#{child.id}</span>
                    <span className={`flex-1 text-sm text-zinc-700 truncate ${child.status === 'done' ? 'line-through' : ''}`}>
                      {child.title}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${CHILD_BADGE[child.status]}`}>
                      {CHILD_LABEL[child.status]}
                    </span>
                  </button>
                ))}
              </div>
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
              {[...TIMELINE].reverse().map((event, i) => (
                <div key={i} className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${event.dot}`} />
                    {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-zinc-200 my-1" />}

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
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-50 transition-colors"
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
          {messages.map((msg) => {
            if (msg.type === 'user') return (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                  {msg.initials}
                </div>
                <div className="max-w-[78%]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-zinc-600">{msg.sender}</span>
                    <span className="text-xs text-zinc-400">{msg.time}</span>
                  </div>
                  <div className="bg-zinc-100 text-zinc-800 rounded-xl rounded-bl-none px-4 py-2.5 text-sm leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              </div>
            )

            if (msg.type === 'tech') return (
              <div key={msg.id} className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-zinc-400">{msg.time}</span>
                  <span className="text-xs font-medium text-zinc-600">{msg.sender}</span>
                </div>
                <div
                  className="max-w-[78%] text-white rounded-xl rounded-br-none px-4 py-2.5 text-sm leading-relaxed"
                  style={{ background: ACCENT }}
                >
                  {msg.text}
                </div>
              </div>
            )

            // internal note
            return (
              <div key={msg.id} className="flex flex-col items-end">
                <div className="max-w-[78%]">
                  <div className="flex items-center gap-1.5 mb-1 justify-end">
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span className="text-xs text-amber-600 font-medium">Nota interna — visível apenas para o time de TI</span>
                  </div>
                  <div className="bg-amber-50 text-amber-900 rounded-xl px-4 py-2.5 text-sm leading-relaxed"
                    style={{ borderLeft: '3px solid #fbbf24' }}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-2 mt-1 justify-end">
                    <span className="text-xs text-zinc-400">{msg.time}</span>
                    <span className="text-xs font-medium text-zinc-600">{msg.sender}</span>
                  </div>
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
              '--tw-ring-color': chatMode === 'internal' ? '#fbbf24' : ACCENT,
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
              disabled={!chatText.trim()}
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
        <PauseModal ticketId={TICKET.id} reason={pauseReason} onChangeReason={setPauseReason}
          onConfirm={confirmPause} onClose={() => setShowPause(false)} />
      )}
      {showFinalize && (
        <FinalizeModal ticketId={TICKET.id} resolution={finalizeRes} onChangeResolution={setFinalizeRes}
          hasOpenChildren={hasOpenChildren} onConfirm={confirmFinalize} onClose={() => setShowFinalize(false)} />
      )}
      {showCreateChild && (
        <CreateChildModal parentId={TICKET.id} onConfirm={createChild} onClose={() => setShowCreateChild(false)} />
      )}

      {/* Resume button overlay when paused */}
      {ticketStatus === 'paused' && !showPause && (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => setTicketStatus('inProgress')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: ACCENT }}
          >
            <PlayCircle className="w-4 h-4" />
            Retomar Atendimento
          </button>
        </div>
      )}

    </div>
  )
}
