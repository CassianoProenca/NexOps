// [ROLE: END_USER]

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Download, Send, FileText, Loader2, ChevronLeft, 
  MessageSquare, Clock, ShieldCheck, History, User
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
import { Separator } from '@/components/ui/separator'

// ── components ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    OPEN:        { bg: 'bg-blue-50',  txt: 'text-blue-700', border: 'border-blue-200', label: 'Aberto' },
    IN_PROGRESS: { bg: 'bg-green-50', txt: 'text-green-700', border: 'border-green-200', label: 'Em Atendimento' },
    PAUSED:      { bg: 'bg-amber-50', txt: 'text-amber-700', border: 'border-amber-200', label: 'Pausado' },
    CLOSED:      { bg: 'bg-zinc-100', txt: 'text-zinc-600', border: 'border-zinc-200', label: 'Finalizado' },
  }[status] || { bg: 'bg-zinc-50', txt: 'text-zinc-500', border: 'border-zinc-100', label: status }

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border shadow-sm', cfg.bg, cfg.txt, cfg.border)}>
      {cfg.label}
    </span>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

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

  // Message Merging
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

  if (isLoading || !ticket) return (
    <div className="h-full flex items-center justify-center bg-zinc-50">
      <Loader2 className="w-10 h-10 text-brand animate-spin" />
    </div>
  )

  const isClosed = ticket.status === 'CLOSED'

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden">
      
      {/* ── BARRA SUPERIOR ── */}
      <header className="px-8 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0 z-20 bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-50 rounded-full text-zinc-400 hover:text-zinc-900 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <span className="font-mono text-[10px] font-black text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">#{ticket.id.slice(0, 8)}</span>
              <StatusBadge status={ticket.status} />
            </div>
            <h1 className="text-lg font-black text-zinc-900 truncate tracking-tight uppercase">{ticket.title}</h1>
          </div>
        </div>

        {isClosed && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Finalizado
          </div>
        )}
      </header>

      {/* ── CONTEÚDO PRINCIPAL (SPLIT) ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LADO ESQUERDO: DETALHES DA SOLICITAÇÃO */}
        <div className="flex-[1.2] overflow-y-auto custom-scrollbar p-10 space-y-10 border-r border-zinc-100">
          
          {/* RESOLUÇÃO (Destaque se fechado) */}
          {isClosed && (
            <section className="bg-green-50 border border-green-100 rounded-[32px] p-8 space-y-4">
              <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Resolução do Atendimento
              </span>
              <div className="bg-white/60 p-6 rounded-2xl">
                <p className="text-green-900 text-sm leading-relaxed font-bold italic">
                  "{ticket.resolution || 'Atendimento concluído com sucesso.'}"
                </p>
              </div>
            </section>
          )}

          {/* INFORMAÇÕES DO CHAMADO */}
          <section className="grid grid-cols-2 gap-y-8 gap-x-12">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Data de Abertura</span>
              <p className="text-sm font-bold text-zinc-800">{formatDateTime(ticket.openedAt)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Prioridade SLA</span>
              <p className="text-sm font-bold text-zinc-800">{ticket.slaLevel}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Previsão de Retorno</span>
              <div className="flex items-center gap-2 text-zinc-800 font-bold text-sm">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {formatDateTime(ticket.slaDeadline)}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Responsável</span>
              <p className="text-sm font-bold text-zinc-800">{ticket.assigneeId ? 'Técnico Atribuído' : 'Aguardando Técnico'}</p>
            </div>
          </section>

          <Separator className="bg-zinc-100" />

          {/* DESCRIÇÃO ORIGINAL */}
          <section className="space-y-4">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Minha Solicitação Original</span>
            <div className="bg-zinc-50/50 p-8 rounded-[32px] border border-zinc-100/50">
              <p className="text-zinc-700 text-sm leading-[1.8] font-medium whitespace-pre-wrap italic">"{ticket.description}"</p>
            </div>
          </section>

          <Separator className="bg-zinc-100" />

          {/* ANEXOS */}
          <section className="space-y-6">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Arquivos e Documentos ({attachments.length})</span>
            {attachments.length === 0 ? (
              <p className="text-xs text-zinc-400 font-medium">Nenhum anexo disponível.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {attachments.map(a => (
                  <div key={a.id} className="p-4 bg-white border border-zinc-100 rounded-2xl flex items-center gap-4 hover:border-brand/30 transition-all group shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors"><FileText className="w-5 h-5" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-zinc-800 truncate uppercase tracking-tighter">{a.filename}</p>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">{(a.sizeBytes / 1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={() => handleDownload(a.id, a.filename)} className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors"><Download className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <Separator className="bg-zinc-100" />

          {/* HISTÓRICO */}
          <section className="space-y-8">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2"><History className="w-3 h-3" /> Jornada do Chamado</span>
            <div className="space-y-6 pl-2 border-l-2 border-zinc-50 ml-2">
              {timelineEvents.map((ev, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute -left-[11px] top-1 w-2 h-2 rounded-full bg-zinc-200 border-2 border-white shadow-sm" />
                  <p className="text-[11px] font-bold text-zinc-600 leading-tight mb-1">{ev.content}</p>
                  <p className="text-[9px] font-black text-zinc-300 uppercase">{formatDateTime(ev.createdAt)}</p>
                </div>
              ))}
              <div className="relative pl-6">
                <div className="absolute -left-[11px] top-1 w-2 h-2 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                <p className="text-[11px] font-black text-blue-600 leading-tight mb-1 uppercase tracking-tighter">Chamado aberto com sucesso</p>
                <p className="text-[9px] font-black text-zinc-300 uppercase">{formatDateTime(ticket.openedAt)}</p>
              </div>
            </div>
          </section>
        </div>

        {/* LADO DIREITO: CHAT COM O TÉCNICO */}
        <aside className="flex-[0.8] flex flex-col bg-zinc-50/30">
          <div className="px-8 py-5 border-b border-zinc-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Conversa com Suporte</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-1.5 h-1.5 rounded-full", connected ? "bg-green-500 animate-pulse" : "bg-zinc-300")} />
              <span className="text-[9px] font-black text-zinc-400 uppercase">{connected ? "Online" : "Offline"}</span>
            </div>
          </div>

          {/* LISTA DE MENSAGENS */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {allMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-300 opacity-40 text-center px-10">
                <MessageSquare className="w-12 h-12 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Aguarde o técnico ou envie uma mensagem</p>
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
              {!ticket.assigneeId ? (
                <div className="p-6 bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[32px] flex flex-col items-center justify-center text-center gap-2">
                  <Clock className="w-5 h-5 text-zinc-300 animate-pulse" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Aguardando técnico assumir...</p>
                </div>
              ) : (
                <div className="relative group">
                  <textarea value={chatText} onChange={e => setChatText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (chatText.trim() && connected) { stompSend(chatText.trim()); setChatText('') } } }}
                    placeholder="Escrever para o suporte..."
                    className="w-full min-h-[100px] p-6 pr-16 bg-zinc-50 border-2 border-zinc-100 rounded-[32px] focus:bg-white focus:border-brand/30 outline-none transition-all resize-none text-sm"
                  />
                  <button disabled={!chatText.trim() || !connected} onClick={() => { stompSend(chatText.trim()); setChatText('') }}
                    className="absolute right-6 bottom-6 p-1 text-zinc-400 hover:text-brand disabled:opacity-20 transition-colors active:scale-90">
                    <Send className={cn("w-6 h-6", chatText.trim() && "text-brand")} />
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

    </div>
  )
}
