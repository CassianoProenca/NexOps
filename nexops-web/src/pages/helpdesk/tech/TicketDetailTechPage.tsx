// [ROLE: TECHNICIAN]

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  PauseCircle, CheckCircle, Upload, Download,
  Send, X, AlertCircle, FileText, PlayCircle, 
  Info, Loader2, ChevronLeft, User, Clock, 
  Calendar, Building2, Tag, MessageSquare, History
} from 'lucide-react'
import { 
  useTicket, 
  useTicketComments, 
  usePauseTicket, 
  useResumeTicket, 
  useCloseTicket, 
  useTicketAttachments, 
  useUploadAttachment
} from '@/hooks/helpdesk/useTickets'
import { useTicketChat } from '@/hooks/helpdesk/useTicketChat'
import { useDepartments } from '@/hooks/helpdesk/useDepartments'
import { useProblemTypes } from '@/hooks/helpdesk/useProblemTypes'
import { useUsers } from '@/hooks/useUsers'
import { useAppStore } from '@/store/appStore'
import { helpdeskService } from '@/services/helpdesk.service'
import { formatDateTime, cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

// ── components ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    OPEN:        { bg: 'bg-blue-50',  txt: 'text-blue-700', border: 'border-blue-200', label: 'Aberto' },
    IN_PROGRESS: { bg: 'bg-green-50', txt: 'text-green-700', border: 'border-green-200', label: 'Atendimento' },
    PAUSED:      { bg: 'bg-amber-50', txt: 'text-amber-700', border: 'border-amber-200', label: 'Pausado' },
    CLOSED:      { bg: 'bg-zinc-100', txt: 'text-zinc-600', border: 'border-zinc-200', label: 'Finalizado' },
  }[status] || { bg: 'bg-zinc-50', txt: 'text-zinc-500', border: 'border-zinc-100', label: status }

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border shadow-sm', cfg.bg, cfg.txt, cfg.border)}>
      {cfg.label}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200">
        <div className="px-8 py-5 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-black text-zinc-900 uppercase tracking-tighter">Pausar Atendimento</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8 space-y-4">
          <textarea autoFocus value={reason} onChange={e => setReason(e.target.value)}
            className="w-full min-h-[120px] p-5 text-sm border-2 border-zinc-100 rounded-[24px] focus:border-brand/30 outline-none resize-none transition-all"
            placeholder="Motivo da pausa..." />
        </div>
        <div className="px-8 py-5 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-black uppercase text-zinc-400 hover:text-zinc-600">Cancelar</button>
          <button disabled={!reason.trim() || isPending} onClick={() => onConfirm(reason)}
            className="px-6 py-3 bg-zinc-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-800 disabled:opacity-40 transition-all shadow-lg">
            Confirmar Pausa
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200">
        <div className="px-8 py-5 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-black text-zinc-900 uppercase tracking-tighter text-lg">Finalizar Chamado</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8 space-y-6">
          <div className="flex gap-4 p-5 bg-blue-50 border border-blue-100 rounded-[24px] text-blue-800">
            <Info className="w-6 h-6 shrink-0" />
            <p className="text-xs font-bold leading-relaxed uppercase tracking-tight">Descreva detalhadamente a solução. Esta informação servirá para futuros atendimentos.</p>
          </div>
          <textarea autoFocus value={res} onChange={e => setRes(e.target.value)}
            className="w-full min-h-[180px] p-6 text-sm border-2 border-zinc-100 rounded-[32px] focus:border-green-500/30 outline-none resize-none transition-all"
            placeholder="Resolução aplicada..." />
        </div>
        <div className="px-8 py-5 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-black uppercase text-zinc-400">Cancelar</button>
          <button disabled={res.trim().length < 10 || isPending} onClick={() => onConfirm(res)}
            className="px-8 py-3 bg-green-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-green-700 disabled:opacity-40 transition-all shadow-xl shadow-green-600/20">
            Finalizar Agora
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TicketDetailTechPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const user = useAppStore(s => s.user)
  
  const { data: ticket, isLoading } = useTicket(id)
  const { data: comments = [] } = useTicketComments(id)
  const { data: attachments = [] } = useTicketAttachments(id)
  const { departments = [] } = useDepartments()
  const { problemTypes = [] } = useProblemTypes()
  const { data: users = [] } = useUsers()
  
  const pauseTicket = usePauseTicket()
  const resumeTicket = useResumeTicket()
  const closeTicket = useCloseTicket()
  const uploadFile = useUploadAttachment()
  const { messages: stompMsgs, connected, sendMessage: stompSend } = useTicketChat(id)

  const [chatText, setChatText] = useState('')
  const [modalPause, setModalPause] = useState(false)
  const [modalFinal, setModalFinal] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const allMessages = [
    ...comments.filter(c => c.type === 'MESSAGE'),
    ...stompMsgs.filter(sm => !comments.some(c => c.id === sm.id))
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const events = comments.filter(c => c.type !== 'MESSAGE').reverse()
  const requester = users.find(u => u.id === ticket?.requesterId)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages.length])

  if (isLoading || !ticket) return (
    <div className="h-full flex items-center justify-center bg-zinc-50"><Loader2 className="w-10 h-10 text-brand animate-spin" /></div>
  )

  const isClosed = ticket.status === 'CLOSED'
  const isPaused = ticket.status === 'PAUSED'

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden">
      
      {/* ── BARRA DE AÇÕES SUPERIOR ── */}
      <header className="px-8 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-50 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"><ChevronLeft className="w-5 h-5" /></button>
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <span className="font-mono text-[10px] font-black text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">#{ticket.id.slice(0, 8)}</span>
              <StatusBadge status={ticket.status} />
            </div>
            <h1 className="text-lg font-black text-zinc-900 truncate tracking-tight uppercase">{ticket.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isClosed && (
            <>
              {isPaused ? (
                <button onClick={() => resumeTicket.mutate(id)} disabled={resumeTicket.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-brand text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-[1.02] transition-all">
                  <PlayCircle className="w-4 h-4" /> Retomar
                </button>
              ) : (
                <>
                  <button onClick={() => setModalPause(true)} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-50 border border-zinc-200 text-zinc-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-100 transition-all">
                    <PauseCircle className="w-4 h-4" /> Pausar
                  </button>
                  <button onClick={() => setModalFinal(true)} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-green-600/20 hover:scale-[1.02] transition-all">
                    <CheckCircle className="w-4 h-4" /> Finalizar
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </header>

      {/* ── CONTEÚDO PRINCIPAL (SPLIT) ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LADO ESQUERDO: DETALHES */}
        <div className="flex-[1.2] overflow-y-auto custom-scrollbar p-10 space-y-10 border-r border-zinc-100">
          
          {/* SEÇÃO: INFORMAÇÕES BÁSICAS */}
          <section className="grid grid-cols-2 gap-y-8 gap-x-12">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2"><User className="w-3 h-3" /> Solicitante</span>
              <p className="text-sm font-bold text-zinc-800">{requester?.name || ticket.requesterId}</p>
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-tight">{requester?.email}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2"><Building2 className="w-3 h-3" /> Departamento</span>
              <p className="text-sm font-bold text-zinc-800 uppercase tracking-tight">{departments.find(d => d.id === ticket.departmentId)?.name || 'N/A'}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2"><Tag className="w-3 h-3" /> Categoria</span>
              <p className="text-sm font-bold text-zinc-800 uppercase tracking-tight">{problemTypes.find(p => p.id === ticket.problemTypeId)?.name || 'N/A'}</p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2"><Clock className="w-3 h-3" /> SLA Estimado</span>
              <p className="text-sm font-bold text-zinc-800">{ticket.slaLevel} — {formatDateTime(ticket.slaDeadline)}</p>
            </div>
          </section>

          <Separator className="bg-zinc-100" />

          {/* SEÇÃO: DESCRIÇÃO */}
          <section className="space-y-4">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] block">Descrição do Chamado</span>
            <div className="bg-zinc-50/50 p-8 rounded-[32px] border border-zinc-100/50">
              <p className="text-zinc-700 text-sm leading-[1.8] font-medium whitespace-pre-wrap italic">"{ticket.description}"</p>
            </div>
            
            {ticket.pauseReason && (
              <div className="flex gap-3 p-5 bg-amber-50/50 border border-amber-100 rounded-[24px] text-amber-800 text-xs font-bold uppercase tracking-tight">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Pausado: {ticket.pauseReason}</span>
              </div>
            )}
          </section>

          <Separator className="bg-zinc-100" />

          {/* SEÇÃO: ANEXOS */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Documentação ({attachments.length})</span>
              {!isClosed && (
                <button onClick={() => fileRef.current?.click()} className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline">+ Anexar Arquivo</button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {attachments.map(a => (
                <div key={a.id} className="p-4 bg-white border border-zinc-100 rounded-2xl flex items-center gap-4 hover:border-brand/30 transition-all group shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors"><FileText className="w-5 h-5" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-zinc-800 truncate uppercase tracking-tighter">{a.filename}</p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase">{(a.sizeBytes / 1024).toFixed(0)} KB</p>
                  </div>
                  <button className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors"><Download className="w-4 h-4" /></button>
                </div>
              ))}
              <input type="file" ref={fileRef} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile.mutate({ ticketId: id, file: f }) }} />
            </div>
          </section>

          <Separator className="bg-zinc-100" />

          {/* SEÇÃO: HISTÓRICO (Timeline minimalista) */}
          <section className="space-y-8">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2"><History className="w-3 h-3" /> Log de Atividades</span>
            <div className="space-y-6 pl-2 border-l-2 border-zinc-50 ml-2">
              {events.map((ev, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute -left-[11px] top-1 w-2 h-2 rounded-full bg-zinc-200 border-2 border-white shadow-sm" />
                  <p className="text-[11px] font-bold text-zinc-600 leading-tight mb-1">{ev.content}</p>
                  <p className="text-[9px] font-black text-zinc-300 uppercase">{formatDateTime(ev.createdAt)}</p>
                </div>
              ))}
              <div className="relative pl-6">
                <div className="absolute -left-[11px] top-1 w-2 h-2 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                <p className="text-[11px] font-black text-green-600 leading-tight mb-1 uppercase tracking-tighter">Chamado aberto com sucesso</p>
                <p className="text-[9px] font-black text-zinc-300 uppercase">{formatDateTime(ticket.openedAt)}</p>
              </div>
            </div>
          </section>
        </div>

        {/* LADO DIREITO: CHAT (Área fixa) */}
        <aside className="flex-[0.8] flex flex-col bg-zinc-50/30">
          <div className="px-8 py-5 border-b border-zinc-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Atendimento ao vivo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-1.5 h-1.5 rounded-full", connected ? "bg-green-500 animate-pulse" : "bg-zinc-300")} />
              <span className="text-[9px] font-black text-zinc-400 uppercase">{connected ? "Conectado" : "Offline"}</span>
            </div>
          </div>

          {/* LISTA DE MENSAGENS */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {allMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-300 opacity-40 grayscale">
                <MessageSquare className="w-12 h-12 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Inicie a conversa</p>
              </div>
            )}
            {allMessages.map((msg, i) => {
              const isMe = msg.authorId === user?.userId
              return (
                <div key={i} className={cn("flex flex-col max-w-[90%]", isMe ? "ml-auto items-end" : "items-start")}>
                  <div className={cn(
                    "px-5 py-3 rounded-[24px] text-sm leading-relaxed shadow-sm border font-medium",
                    isMe ? "bg-zinc-900 text-white border-zinc-800 rounded-tr-none" : "bg-white text-zinc-700 border-zinc-100 rounded-tl-none"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[9px] font-black text-zinc-300 mt-2 uppercase px-1">
                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>

          {/* ENTRADA DE TEXTO */}
          {!isClosed && (
            <div className="p-6 bg-white border-t border-zinc-100">
              <div className="relative group">
                <textarea value={chatText} onChange={e => setChatText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (chatText.trim() && connected) { stompSend(chatText.trim()); setChatText('') } } }}
                  placeholder="Escrever para o usuário..."
                  className="w-full min-h-[100px] p-6 pr-16 bg-zinc-50 border-2 border-zinc-100 rounded-[32px] focus:bg-white focus:border-brand/30 outline-none transition-all resize-none text-sm"
                />
                <button disabled={!chatText.trim() || !connected} onClick={() => { stompSend(chatText.trim()); setChatText('') }}
                  className="absolute right-6 bottom-6 p-1 text-zinc-400 hover:text-brand disabled:opacity-20 transition-colors active:scale-90">
                  <Send className={cn("w-6 h-6", chatText.trim() && "text-brand")} />
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      <PauseModal isOpen={modalPause} onClose={() => setModalPause(false)} onConfirm={handlePause} isPending={pauseTicket.isPending} />
      <FinalizeModal isOpen={modalFinal} onClose={() => setModalFinal(false)} onConfirm={handleFinalize} isPending={closeTicket.isPending} />

    </div>
  )

  function handlePause(reason: string) {
    pauseTicket.mutate({ id, data: { reason } }, { onSuccess: () => setModalPause(false) })
  }

  function handleFinalize(resolution: string) {
    closeTicket.mutate({ id, resolution }, { onSuccess: () => setModalFinal(false) })
  }
}
