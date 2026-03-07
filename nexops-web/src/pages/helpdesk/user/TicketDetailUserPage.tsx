// [ROLE: END_USER]

import { useState, useEffect, useRef } from 'react'
import { Download, Send, FileText } from 'lucide-react'

// ── constants ─────────────────────────────────────────────────────────────────

const ACCENT = '#4f6ef7'

// ── types ─────────────────────────────────────────────────────────────────────

type TicketStatus = 'assigned' | 'inProgress' | 'paused' | 'done'
type MessageType  = 'user' | 'tech' | 'internal'

interface ChatMessage {
  id:        number
  type:      MessageType
  sender:    string
  initials?: string
  text:      string
  time:      string
}

// ── mock data ─────────────────────────────────────────────────────────────────

const TICKET = {
  id:          1042,
  title:       'Impressora não responde',
  description: 'Impressora HP do setor de RH não imprime desde ontem. A impressora aparece como offline no computador, mas está ligada e o painel não mostra erros visíveis.',
  type:        'Impressora',
  tier:        'N2',
  openedAt:    '07/03/2026 às 09:14',
  status:      'inProgress' as TicketStatus,
  requester:   { name: 'Maria Silva', initials: 'MS', department: 'RH' },
}

const ATTACHMENTS = [
  { name: 'foto-erro.jpg',   size: '1.2 MB' },
  { name: 'config-rede.pdf', size: '340 KB' },
]

const TIMELINE = [
  { dot: 'bg-green-500', text: 'Chamado aberto por Maria Silva',           time: '09:14' },
  { dot: 'bg-blue-500',  text: 'Atribuído a Cassiano Proença pelo gestor', time: '09:45' },
  { dot: 'bg-amber-400', text: 'Atendimento iniciado',                     time: '10:02' },
  { dot: 'bg-zinc-400',  text: 'Pausado — Aguardando peça de reposição',   time: '11:30' },
  { dot: 'bg-blue-500',  text: 'Atendimento retomado',                     time: '14:05' },
]

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, type: 'user',     sender: 'Maria Silva',      initials: 'MS', text: 'Minha impressora HP não imprime desde ontem. Aparece erro offline.',                 time: '09:14' },
  { id: 2, type: 'tech',     sender: 'Cassiano Proença',                 text: 'Bom dia! Já recebi seu chamado. Vou verificar o status da impressora remotamente.', time: '10:03' },
  { id: 3, type: 'internal', sender: 'Cassiano Proença',                 text: 'Verificar se o IP da impressora mudou após reinicialização do roteador ontem.',     time: '10:05' },
  { id: 4, type: 'user',     sender: 'Maria Silva',      initials: 'MS', text: 'Preciso imprimir documentos urgentes para reunião às 15h.',                         time: '10:15' },
  { id: 5, type: 'tech',     sender: 'Cassiano Proença',                 text: 'Entendido! Estou priorizando sua solicitação.',                                     time: '10:17' },
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

// ── page ──────────────────────────────────────────────────────────────────────

export default function TicketDetailUserPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [chatText, setChatText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    if (!chatText.trim()) return
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => [...prev, {
      id:       Date.now(),
      type:     'user',
      sender:   TICKET.requester.name,
      initials: TICKET.requester.initials,
      text:     chatText.trim(),
      time:     now,
    }])
    setChatText('')
  }

  // Internal notes are hidden from the end user
  const visibleMessages = messages.filter((m) => m.type !== 'internal')

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
              <span className="font-mono text-sm text-zinc-400">#{TICKET.id}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_BADGE[TICKET.tier]}`}>{TICKET.tier}</span>
              <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{TICKET.type}</span>
            </div>
            <h1 className="font-bold text-zinc-900 leading-snug" style={{ fontSize: 18 }}>{TICKET.title}</h1>
            <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[TICKET.status]}`}>
              {STATUS_LABEL[TICKET.status]}
            </span>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Descrição</h3>
            <div className="bg-zinc-50 rounded-md px-4 py-3 text-sm text-zinc-600 leading-relaxed">
              {TICKET.description}
            </div>
          </div>

          <div className="border-t border-zinc-100" />

          {/* Attachments — download only, no upload */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Anexos</h3>
            {ATTACHMENTS.length === 0 ? (
              <p className="text-sm text-zinc-400">Nenhum anexo.</p>
            ) : (
              <div className="space-y-2">
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
            )}
          </div>

          <div className="border-t border-zinc-100" />

          {/* Timeline — read-only */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">Histórico</h3>
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
        {/* No action footer — end user has no tech actions */}
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

        {/* Messages — internal notes filtered out */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#e4e4e7 transparent' }}
        >
          {visibleMessages.map((msg) => {
            const isMe = msg.type === 'user'

            if (isMe) return (
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

            // tech message — rendered on the left
            return (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                  CP
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
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input footer — message only, no internal note mode */}
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
              disabled={!chatText.trim()}
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
