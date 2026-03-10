// [ROLE: END_USER]

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Send, FileText, Loader2 } from 'lucide-react'
import { useTicket, useTicketComments, useAddComment } from '@/hooks/helpdesk/useTickets'
import { useAppStore } from '@/store/appStore'
import { formatDateTime, formatRelativeTime } from '@/lib/utils'
import type { TicketStatus } from '@/types/helpdesk.types'

// ── constants ─────────────────────────────────────────────────────────────────

const ACCENT = '#4f6ef7'

// ── helpers ───────────────────────────────────────────────────────────────────

const TIER_BADGE: Record<string, string> = {
  N1: 'bg-zinc-100 text-zinc-600',
  N2: 'bg-amber-50 text-amber-600',
  N3: 'bg-red-50 text-red-600',
}

const STATUS_BADGE: Record<TicketStatus, string> = {
  OPEN:        'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-green-50 text-green-700',
  PAUSED:      'bg-amber-50 text-amber-700',
  CLOSED:      'bg-zinc-100 text-zinc-500',
}

const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN:        'Aberto',
  IN_PROGRESS: 'Em Andamento',
  PAUSED:      'Pausado',
  CLOSED:      'Finalizado',
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function TicketDetailUserPage() {
  const { id = '' } = useParams<{ id: string }>()
  const user = useAppStore((s) => s.user)
  const [chatText, setChatText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: ticket, isLoading: loadingTicket } = useTicket(id)
  const { data: comments = [], isLoading: loadingComments } = useTicketComments(id)
  const addComment = useAddComment()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  function sendMessage() {
    if (!chatText.trim() || !id) return
    addComment.mutate({ ticketId: id, data: { content: chatText.trim() } })
    setChatText('')
  }

  // Public comments only — no internal notes shown to end user
  const publicComments  = comments.filter((c) => c.type === 'USER_MESSAGE' || c.type === 'TECHNICIAN_MESSAGE')

  if (loadingTicket) {
    return (
      <div className="flex items-center justify-center h-full py-24 gap-3 text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Carregando chamado...</span>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <p className="text-sm text-zinc-500">Chamado não encontrado.</p>
      </div>
    )
  }

  const shortId = ticket.id.slice(0, 8).toUpperCase()

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 104px)' }}>

      {/* ── Left column — 2fr ── */}
      <div className="flex flex-col overflow-hidden bg-white" style={{ flex: 2, borderRight: '1px solid #e4e4e7' }}>
        <div
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#e4e4e7 transparent' }}
        >

          {/* Ticket header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-zinc-400">#{shortId}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_BADGE[ticket.slaLevel]}`}>{ticket.slaLevel}</span>
            </div>
            <h1 className="font-bold text-zinc-900 leading-snug" style={{ fontSize: 18 }}>{ticket.title}</h1>
            <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[ticket.status]}`}>
              {STATUS_LABEL[ticket.status]}
            </span>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Descrição</h3>
            <div className="bg-zinc-50 rounded-md px-4 py-3 text-sm text-zinc-600 leading-relaxed">
              {ticket.description}
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Info — opened at */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Informações</h3>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500">Aberto em: <span className="font-medium text-zinc-700">{formatDateTime(ticket.openedAt)}</span></p>
              {ticket.slaDeadline && (
                <p className="text-xs text-zinc-500">Prazo SLA: <span className={`font-medium ${ticket.isSlaBreached ? 'text-red-600' : 'text-zinc-700'}`}>{formatRelativeTime(ticket.slaDeadline)}</span></p>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Attachments — placeholder */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Anexos</h3>
            <p className="text-sm text-zinc-400">Nenhum anexo.</p>
          </div>

        </div>
      </div>

      {/* ── Right column — 3fr ── */}
      <div className="flex flex-col overflow-hidden bg-zinc-50" style={{ flex: 3 }}>

        {/* Chat header */}
        <div className="shrink-0 px-6 py-4 bg-white border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-700">Chat do Chamado</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-zinc-400">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#e4e4e7 transparent' }}
        >
          {loadingComments ? (
            <div className="flex items-center justify-center py-10 gap-2 text-zinc-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Carregando mensagens...</span>
            </div>
          ) : publicComments.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-sm text-zinc-400">Nenhuma mensagem ainda. Inicie a conversa!</p>
            </div>
          ) : (
            publicComments.map((msg) => {
              const isMe = msg.authorId === user?.userId || msg.type === 'USER_MESSAGE'
              const time = new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

              if (isMe) return (
                <div key={msg.id} className="flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-zinc-400">{time}</span>
                    <span className="text-xs font-medium text-zinc-600">Você</span>
                  </div>
                  <div
                    className="max-w-[78%] text-white rounded-xl rounded-br-none px-4 py-2.5 text-sm leading-relaxed"
                    style={{ background: ACCENT }}
                  >
                    {msg.content}
                  </div>
                </div>
              )

              return (
                <div key={msg.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                    TI
                  </div>
                  <div className="max-w-[78%]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-zinc-600">Técnico</span>
                      <span className="text-xs text-zinc-400">{time}</span>
                    </div>
                    <div className="bg-zinc-100 text-zinc-800 rounded-xl rounded-bl-none px-4 py-2.5 text-sm leading-relaxed">
                      {msg.content}
                    </div>
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
            placeholder="Escreva uma mensagem para o técnico..."
            className="w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
            style={{ minHeight: 80, maxHeight: 160 }}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-zinc-400">{chatText.length}/1000</span>
            <button
              onClick={sendMessage}
              disabled={!chatText.trim() || addComment.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              style={{ background: ACCENT }}
            >
              <Send className="w-4 h-4" />
              Enviar
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// Prevent unused import warnings
export { FileText, Download }
