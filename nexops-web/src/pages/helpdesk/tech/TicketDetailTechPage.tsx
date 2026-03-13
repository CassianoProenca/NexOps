import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  PauseCircle, CheckCircle, GitBranch, Upload, Download,
  MessageCircle, Send, X, AlertCircle,
  FileText, PlayCircle, Info, Loader2, ChevronLeft,
  User, Clock, Calendar, Building2, Tag
} from 'lucide-react'
import { 
  useTicket, 
  useTicketComments, 
  usePauseTicket, 
  useResumeTicket, 
  useCloseTicket, 
  useCreateChildTicket, 
  useTicketAttachments, 
  useUploadAttachment,
  useAddComment
} from '@/hooks/helpdesk/useTickets'
import { useTicketChat } from '@/hooks/helpdesk/useTicketChat'
import { useDepartments } from '@/hooks/helpdesk/useDepartments'
import { useProblemTypes } from '@/hooks/helpdesk/useProblemTypes'
import { useUsers } from '@/hooks/useUsers'
import { useAppStore } from '@/store/appStore'
import { helpdeskService } from '@/services/helpdesk.service'
import { formatDateTime, cn } from '@/lib/utils'

// ── components ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    OPEN:        { bg: 'bg-blue-50',  txt: 'text-blue-700', border: 'border-blue-200', label: 'Aberto' },
    IN_PROGRESS: { bg: 'bg-green-50', txt: 'text-green-700', border: 'border-green-200', label: 'Em Atendimento' },
    PAUSED:      { bg: 'bg-amber-50', txt: 'text-amber-700', border: 'border-amber-200', label: 'Pausado' },
    CLOSED:      { bg: 'bg-zinc-100', txt: 'text-zinc-600', border: 'border-zinc-200', label: 'Finalizado' },
  }[status] || { bg: 'bg-zinc-50', txt: 'text-zinc-500', border: 'border-zinc-100', label: status }

  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm', cfg.bg, cfg.txt, cfg.border)}>
      <span className={cn('w-1.5 h-1.5 rounded-full mr-2', cfg.txt.replace('text', 'bg'))} />
      {cfg.label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const color = {
    CRITICAL: 'text-red-600 bg-red-50 border-red-100',
    HIGH:     'text-orange-600 bg-orange-50 border-orange-100',
    MEDIUM:   'text-amber-600 bg-amber-50 border-amber-100',
    LOW:      'text-blue-600 bg-blue-50 border-blue-100',
  }[priority] || 'text-zinc-600 bg-zinc-50 border-zinc-100'

  return (
    <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider', color)}>
      {priority}
    </span>
  )
}

// ── Modals ────────────────────────────────────────────────────────────────────

function PauseModal({ isOpen, onClose, onConfirm, isPending }: { 
  isOpen: boolean; onClose: () => void; onConfirm: (reason: string) => void; isPending: boolean 
}) {
  const [reason, setReason] = useState('')
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900">Pausar Atendimento</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-zinc-500">Informe o motivo da interrupção do atendimento:</p>
          <textarea 
            autoFocus value={reason} onChange={e => setReason(e.target.value)}
            className="w-full min-h-[100px] p-4 text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none resize-none transition-all"
            placeholder="Ex: Aguardando peça de reposição..."
          />
        </div>
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800">Cancelar</button>
          <button 
            disabled={!reason.trim() || isPending}
            onClick={() => onConfirm(reason)}
            className="px-6 py-2 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 disabled:opacity-40 transition-all"
          >
            {isPending ? 'Pausando...' : 'Confirmar Pausa'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FinalizeModal({ isOpen, onClose, onConfirm, isPending }: { 
  isOpen: boolean; onClose: () => void; onConfirm: (res: string) => void; isPending: boolean 
}) {
  const [res, setRes] = useState('')
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-bold text-zinc-900">Finalizar Chamado</h3>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800">
            <Info className="w-5 h-5 shrink-0" />
            <div className="text-xs leading-relaxed">
              <p className="font-bold mb-1 uppercase tracking-wider">Resolução Obrigatória</p>
              Descreva detalhadamente a solução aplicada. Esta informação ficará disponível para o usuário e servirá de base de conhecimento.
            </div>
          </div>
          <textarea 
            autoFocus value={res} onChange={e => setRes(e.target.value)}
            className="w-full min-h-[160px] p-4 text-sm border border-zinc-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none resize-none transition-all"
            placeholder="Ex: Realizada a troca do cabo de rede e configurado o IP estático conforme padrão da rede..."
          />
        </div>
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-800">Cancelar</button>
          <button 
            disabled={res.trim().length < 10 || isPending}
            onClick={() => onConfirm(res)}
            className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-40 transition-all shadow-lg shadow-green-600/20"
          >
            {isPending ? 'Finalizando...' : 'Finalizar Chamado'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function TicketDetailTechPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const user = useAppStore(s => s.user)
  
  // Data
  const { data: ticket, isLoading } = useTicket(id)
  const { data: comments = [] } = useTicketComments(id)
  const { data: attachments = [] } = useTicketAttachments(id)
  const { departments } = useDepartments()
  const { problemTypes } = useProblemTypes()
  const { data: users = [] } = useUsers()
  
  // Actions
  const addComment = useAddComment()
  const pauseTicket = usePauseTicket()
  const resumeTicket = useResumeTicket()
  const closeTicket = useCloseTicket()
  const uploadFile = useUploadAttachment()
  const { messages: stompMsgs, connected, sendMessage: stompSend } = useTicketChat(id)

  // Local UI State
  const [chatText, setChatText] = useState('')
  const [modalPause, setModalPause] = useState(false)
  const [modalFinal, setModalFinal] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Mapping
  const requester = users.find(u => u.id === ticket?.requesterId)
  const requesterName = requester?.name ?? 'Solicitante'

  // Message Merging & Deduplication
  const allMessages = [
    ...comments.filter(c => c.type === 'MESSAGE'),
    ...stompMsgs.filter(sm => !comments.some(c => c.id === sm.id))
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const events = comments.filter(c => c.type !== 'MESSAGE').reverse()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages.length])

  // Handlers
  const handleSendChat = () => {
    if (!chatText.trim() || !connected) return
    stompSend(chatText.trim())
    setChatText('')
  }

  const handlePause = (reason: string) => {
    pauseTicket.mutate({ id, data: { reason } }, { onSuccess: () => setModalPause(false) })
  }

  const handleFinalize = (resolution: string) => {
    closeTicket.mutate({ id, resolution }, { 
      onSuccess: () => setModalFinal(false) 
    })
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile.mutate({ ticketId: id, file })
  }

  if (isLoading || !ticket) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
          <p className="text-sm font-medium text-zinc-500">Carregando detalhes...</p>
        </div>
      </div>
    )
  }

  const isClosed = ticket.status === 'CLOSED'
  const isPaused = ticket.status === 'PAUSED'

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-zinc-50 overflow-hidden">
      
      {/* HEADER */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"><ChevronLeft className="w-5 h-5" /></button>
          <div className="h-8 w-px bg-zinc-200 mx-1" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded tracking-tighter uppercase">#{ticket.id.slice(0, 8)}</span>
              <PriorityBadge priority={ticket.internalPriority} />
              <StatusBadge status={ticket.status} />
            </div>
            <h1 className="text-base font-bold text-zinc-900 truncate tracking-tight">{ticket.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isClosed && (
            <>
              {isPaused ? (
                <button 
                  onClick={() => resumeTicket.mutate(id)}
                  disabled={resumeTicket.isPending}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand text-white text-sm font-bold shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <PlayCircle className="w-4 h-4" /> Retomar Atendimento
                </button>
              ) : (
                <>
                  <button onClick={() => setModalPause(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-600 text-sm font-bold rounded-xl hover:bg-zinc-50 transition-all">
                    <PauseCircle className="w-4 h-4" /> Pausar
                  </button>
                  <button onClick={() => setModalFinal(true)} className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <CheckCircle className="w-4 h-4" /> Finalizar
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </header>

      {/* CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: MAIN INFO */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 flex flex-col gap-8">
          
          {/* DESCRIPTION */}
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-3 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Descrição do Chamado</span>
              <span className="text-[10px] font-bold text-zinc-400">{formatDateTime(ticket.openedAt)}</span>
            </div>
            <div className="p-6">
              <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
              
              {ticket.pauseReason && (
                <div className="mt-6 flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 italic text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
                  <span><strong>Pausado por:</strong> {ticket.pauseReason}</span>
                </div>
              )}
            </div>
          </section>

          {/* ATTACHMENTS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Documentos e Anexos
              </h3>
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-200 px-2 py-0.5 rounded-full uppercase">{attachments.length} arquivos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {attachments.map(a => (
                <div key={a.id} className="group p-3 bg-white border border-zinc-200 rounded-xl flex items-center gap-3 hover:border-brand/40 transition-all shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors"><FileText className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-700 truncate uppercase tracking-tight">{a.filename}</p>
                    <p className="text-[9px] text-zinc-400">{(a.sizeBytes / 1024).toFixed(0)} KB</p>
                  </div>
                  <button className="p-2 text-zinc-300 hover:text-brand transition-colors"><Download className="w-4 h-4" /></button>
                </div>
              ))}
              {!isClosed && (
                <button 
                  onClick={() => fileRef.current?.click()}
                  className="p-4 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:bg-zinc-100/50 hover:border-zinc-300 transition-all"
                >
                  {uploadFile.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  <span className="text-[10px] font-black uppercase tracking-tighter">Anexar Arquivo</span>
                </button>
              )}
              <input type="file" ref={fileRef} className="hidden" onChange={handleFile} />
            </div>
          </section>

          {/* TIMELINE / EVENTS */}
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Histórico de Atividades</h3>
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
              {events.map((ev, i) => (
                <div key={ev.id || i} className="relative">
                  <div className="absolute -left-8 top-1 w-6 h-6 rounded-full border-4 border-zinc-50 bg-zinc-300 z-10" />
                  <div>
                    <p className="text-sm font-bold text-zinc-700 mb-1">{ev.content}</p>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{formatDateTime(ev.createdAt)}</p>
                  </div>
                </div>
              ))}
              <div className="relative">
                <div className="absolute -left-8 top-1 w-6 h-6 rounded-full border-4 border-zinc-50 bg-green-500 z-10" />
                <div>
                  <p className="text-sm font-bold text-zinc-700 mb-1">Chamado aberto pelo solicitante</p>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{formatDateTime(ticket.openedAt)}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: PERSISTENT SIDEBAR & CHAT */}
        <aside className="w-full max-w-[400px] border-l border-zinc-200 bg-white flex flex-col shrink-0">
          
          {/* TICKET STATS */}
          <div className="p-6 border-b border-zinc-100 grid grid-cols-2 gap-4 bg-zinc-50/30">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"><User className="w-3 h-3" /> Solicitante</span>
              <p className="text-xs font-bold text-zinc-700 truncate">{requesterName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Departamento</span>
              <p className="text-xs font-bold text-zinc-700 truncate">{departments.find(d => d.id === ticket.departmentId)?.name || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"><Tag className="w-3 h-3" /> Tipo de Problema</span>
              <p className="text-xs font-bold text-zinc-700 truncate">{problemTypes.find(p => p.id === ticket.problemTypeId)?.name || '—'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" /> SLA</span>
              <p className="text-xs font-bold text-zinc-700 truncate">{ticket.slaLevel} (Até {formatDateTime(ticket.slaDeadline)})</p>
            </div>
          </div>

          {/* CHAT INTERFACE */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-3 border-b border-zinc-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Conversa</span>
              <div className="flex items-center gap-1.5">
                <span className={cn("w-1.5 h-1.5 rounded-full", connected ? "bg-green-500" : "bg-zinc-300")} />
                <span className="text-[9px] font-bold text-zinc-400 uppercase">{connected ? "Online" : "Offline"}</span>
              </div>
            </div>

            {/* CHAT MESSAGES */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/20 custom-scrollbar">
              {allMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-300 opacity-60">
                  <MessageCircle className="w-10 h-10 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma mensagem enviada</p>
                </div>
              )}
              {allMessages.map((msg, i) => {
                const isMe = msg.authorId === user?.userId
                return (
                  <div key={msg.id || i} className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "items-start")}>
                    <div className={cn(
                      "px-4 py-2.5 rounded-2xl text-sm shadow-sm border",
                      isMe ? "bg-brand text-white border-brand/10 rounded-br-none" : "bg-white text-zinc-700 border-zinc-100 rounded-bl-none"
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400 mt-1 uppercase">
                      {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })}
              <div ref={chatEndRef} />
            </div>

            {/* CHAT INPUT */}
            {!isClosed && (
              <div className="p-4 bg-white border-t border-zinc-100">
                <div className="relative">
                  <textarea 
                    value={chatText} onChange={e => setChatText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat() } }}
                    placeholder="Digite sua mensagem..."
                    className="w-full min-h-[80px] p-4 pr-12 text-sm border-2 border-zinc-100 rounded-2xl focus:border-brand/30 outline-none resize-none transition-all"
                  />
                  <button 
                    onClick={handleSendChat}
                    disabled={!chatText.trim() || !connected}
                    className="absolute right-4 bottom-4 p-1 text-zinc-400 hover:text-brand disabled:opacity-20 transition-colors active:scale-90"
                  >
                    <Send className={cn("w-5 h-5", chatText.trim() && "text-brand")} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* MODALS */}
      <PauseModal isOpen={modalPause} onClose={() => setModalPause(false)} onConfirm={handlePause} isPending={pauseTicket.isPending} />
      <FinalizeModal isOpen={modalFinal} onClose={() => setModalFinal(false)} onConfirm={handleFinalize} isPending={closeTicket.isPending} />

    </div>
  )
}
