// [ROLE: END_USER]

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Download, Send, FileText, Loader2, ChevronLeft, 
  MessageCircle, Clock, Calendar, ShieldCheck, AlertCircle 
} from 'lucide-react'
import { 
  useTicket, 
  useTicketComments, 
  useTicketAttachments 
} from '@/hooks/helpdesk/useTickets'
import { useTicketChat } from '@/hooks/helpdesk/useTicketChat'
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

// ── main page ─────────────────────────────────────────────────────────────────

export default function TicketDetailUserPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const user = useAppStore(s => s.user)
  
  // Data
  const { data: ticket, isLoading } = useTicket(id)
  const { data: comments = [] } = useTicketComments(id)
  const { data: attachments = [] } = useTicketAttachments(id)
  
  // Chat
  const { messages: stompMsgs, connected, sendMessage: stompSend } = useTicketChat(id)
  const [chatText, setChatText] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Message Merging (Users see all messages and system events)
  const allMessages = [
    ...comments.filter(c => c.type === 'MESSAGE'),
    ...stompMsgs.filter(sm => !comments.some(c => c.id === sm.id))
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const timelineEvents = comments.filter(c => c.type !== 'MESSAGE').reverse()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages.length])

  // Handlers
  const handleSendChat = () => {
    if (!chatText.trim() || !connected) return
    stompSend(chatText.trim())
    setChatText('')
  }

  async function handleDownload(attachmentId: string, filename: string) {
    const blob = await helpdeskService.downloadAttachment(attachmentId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading || !ticket) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
          <p className="text-sm font-medium text-zinc-500">Carregando seu chamado...</p>
        </div>
      </div>
    )
  }

  const isClosed = ticket.status === 'CLOSED'

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-zinc-50 overflow-hidden">
      
      {/* HEADER */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="h-8 w-px bg-zinc-200" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded tracking-tighter uppercase">#{ticket.id.slice(0, 8)}</span>
              <StatusBadge status={ticket.status} />
            </div>
            <h1 className="text-base font-bold text-zinc-900 truncate tracking-tight">{ticket.title}</h1>
          </div>
        </div>

        {isClosed && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-bold">
            <ShieldCheck className="w-4 h-4" /> Chamado Finalizado
          </div>
        )}
      </header>

      {/* CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: MAIN INFO */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 flex flex-col gap-8">
          
          {/* DESCRIPTION */}
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-3 bg-zinc-50/50 border-b border-zinc-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Minha Solicitação</span>
              <span className="text-[10px] font-bold text-zinc-400">{formatDateTime(ticket.openedAt)}</span>
            </div>
            <div className="p-6">
              <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </section>

          {/* RESOLUTION (If closed) */}
          {isClosed && (
            <section className="bg-green-50 border border-green-100 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-24 h-24 text-green-600" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-green-700 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Resolução do Atendimento
                </h3>
                <div className="bg-white/60 rounded-xl p-4 text-green-900 text-sm leading-relaxed font-medium">
                  {ticket.resolution || 'Chamado finalizado pelo suporte.'}
                </div>
              </div>
            </section>
          )}

          {/* ATTACHMENTS */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Arquivos Anexados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {attachments.length === 0 ? (
                <div className="col-span-full py-8 border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-zinc-400 gap-2">
                  <FileText className="w-8 h-8 opacity-20" />
                  <span className="text-xs font-medium uppercase tracking-tighter">Nenhum anexo disponível</span>
                </div>
              ) : (
                attachments.map(a => (
                  <div key={a.id} className="group p-3 bg-white border border-zinc-200 rounded-xl flex items-center gap-3 hover:border-brand/40 transition-all shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors"><FileText className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-700 truncate uppercase tracking-tight">{a.filename}</p>
                      <p className="text-[9px] text-zinc-400">{(a.sizeBytes / 1024).toFixed(0)} KB</p>
                    </div>
                    <button 
                      onClick={() => handleDownload(a.id, a.filename)}
                      className="p-2 text-zinc-300 hover:text-brand transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* TIMELINE */}
          <section className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Histórico do Atendimento</h3>
            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
              {timelineEvents.map((ev, i) => (
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
                  <p className="text-sm font-bold text-zinc-700 mb-1">Chamado aberto com sucesso</p>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{formatDateTime(ticket.openedAt)}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: CHAT */}
        <aside className="w-full max-w-[400px] border-l border-zinc-200 bg-white flex flex-col shrink-0">
          
          {/* HELP INFO */}
          <div className="p-6 border-b border-zinc-100 bg-zinc-50/30 space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Expectativa de Retorno</p>
                <p className="text-xs font-bold text-zinc-700 mt-0.5">{ticket.slaLevel} — Até {formatDateTime(ticket.slaDeadline)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-zinc-500">Utilize o chat ao lado para enviar informações adicionais ou tirar dúvidas com o técnico responsável.</p>
            </div>
          </div>

          {/* CHAT INTERFACE */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-3 border-b border-zinc-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Conversa com Suporte</span>
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
                  <p className="text-[10px] font-black uppercase tracking-widest text-center px-8">Aguarde o técnico iniciar o atendimento ou envie uma mensagem</p>
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
                    placeholder="Falar com o suporte..."
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

    </div>
  )
}
