import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, MessageCircle, AlertCircle, CheckCircle,
  CheckCheck, AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

type NotifType = 'sla' | 'chat' | 'assigned' | 'resolved' | 'system'
type Tab       = 'all' | 'unread' | 'tickets' | 'system'

interface Notif {
  id:          number
  type:        NotifType
  title:       string
  description: string
  timestamp:   string
  read:        boolean
  href?:       string
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const INITIAL: Notif[] = [
  {
    id: 1, type: 'sla',
    title:       'SLA em risco — #1003 Acesso ao sistema SIAD',
    description: 'Chamado N3 há 4h sem atendimento. Prazo: 24h.',
    timestamp:   'há 5min',
    read:        false,
    href:        '/app/helpdesk/todos',
  },
  {
    id: 2, type: 'chat',
    title:       'Nova mensagem — #1042 Impressora não responde',
    description: 'Maria Silva: Preciso imprimir documentos urgentes.',
    timestamp:   'há 18min',
    read:        false,
    href:        '/app/helpdesk/chamado/1042',
  },
  {
    id: 3, type: 'assigned',
    title:       'Novo chamado atribuído — #1048',
    description: "Gestor atribuiu o chamado 'VPN sem conexão' a você.",
    timestamp:   'há 45min',
    read:        false,
    href:        '/app/helpdesk/fila',
  },
  {
    id: 4, type: 'resolved',
    title:       'Chamado finalizado — #1035',
    description: 'Reset de senha SAM foi finalizado por Rafael Oliveira.',
    timestamp:   'há 2h',
    read:        true,
  },
  {
    id: 5, type: 'system',
    title:       'Convite aceito',
    description: 'Thiago Mendes aceitou o convite e criou sua conta.',
    timestamp:   'há 1 dia',
    read:        true,
  },
  {
    id: 6, type: 'resolved',
    title:       'Chamado finalizado — #1029',
    description: 'Notebook da diretoria foi finalizado.',
    timestamp:   'há 2 dias',
    read:        true,
  },
  {
    id: 7, type: 'system',
    title:       'Sistema atualizado',
    description: 'NexOps v0.1.1-alpha foi implantado com sucesso.',
    timestamp:   'há 3 dias',
    read:        true,
  },
]

// ── Icon + color map ───────────────────────────────────────────────────────────

const ICON_MAP: Record<NotifType, { Icon: React.ElementType; color: string; bg: string }> = {
  sla:      { Icon: AlertCircle,    color: '#d97706', bg: '#fffbeb' },
  chat:     { Icon: MessageCircle,  color: '#2563eb', bg: '#eff6ff' },
  assigned: { Icon: Bell,           color: '#71717a', bg: '#f4f4f5' },
  resolved: { Icon: CheckCircle,    color: '#16a34a', bg: '#f0fdf4' },
  system:   { Icon: Bell,           color: '#71717a', bg: '#f4f4f5' },
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function isTicket(type: NotifType) {
  return type !== 'system'
}

// ── Disabled toggle (preferences — visual only) ────────────────────────────────

function DisabledToggle() {
  return (
    <div className="relative group/tog">
      <div className="relative inline-flex h-5 w-9 rounded-full bg-zinc-200 border-2 border-transparent cursor-not-allowed opacity-50">
        <span className="inline-block h-4 w-4 rounded-full bg-white shadow translate-x-0" />
      </div>
      <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover/tog:block z-10 pointer-events-none">
        <div className="bg-zinc-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
          Em breve
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-zinc-900" />
        </div>
      </div>
    </div>
  )
}

// ── Notification card ──────────────────────────────────────────────────────────

function NotifCard({ notif, onRead }: { notif: Notif; onRead: (id: number) => void }) {
  const navigate = useNavigate()
  const { Icon, color, bg } = ICON_MAP[notif.type]

  function handleClick() {
    if (!notif.read) onRead(notif.id)
    if (notif.href) navigate(notif.href)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 px-4 py-4 rounded-lg cursor-pointer transition-colors',
        notif.read
          ? 'bg-zinc-50 hover:bg-zinc-100/80'
          : 'bg-white hover:bg-zinc-50'
      )}
      style={notif.read ? undefined : { borderLeft: '3px solid #4f6ef7' }}
    >
      {/* Unread dot */}
      <div className="shrink-0 mt-1 w-2 flex justify-center">
        {!notif.read && (
          <span className="w-2 h-2 rounded-full bg-[#4f6ef7] shrink-0" />
        )}
      </div>

      {/* Type icon */}
      <div
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm leading-snug',
          notif.read ? 'font-normal text-zinc-500' : 'font-medium text-zinc-900'
        )}>
          {notif.title}
        </p>
        <p className="text-sm text-zinc-500 mt-0.5 leading-snug truncate">{notif.description}</p>
        <p className="text-xs text-zinc-400 mt-1">{notif.timestamp}</p>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL)
  const [tab, setTab]       = useState<Tab>('all')

  const unreadCount      = notifs.filter((n) => !n.read).length
  const unreadTickets    = notifs.filter((n) => !n.read && isTicket(n.type)).length
  const unreadSla        = notifs.filter((n) => !n.read && n.type === 'sla').length
  const unreadChatAssign = notifs.filter((n) => !n.read && (n.type === 'chat' || n.type === 'assigned')).length
  const unreadSystem     = notifs.filter((n) => !n.read && n.type === 'system').length

  function markRead(id: number) {
    setNotifs((ns) => ns.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  function markAllRead() {
    setNotifs((ns) => ns.map((n) => ({ ...n, read: true })))
  }

  const filtered = notifs.filter((n) => {
    if (tab === 'unread')  return !n.read
    if (tab === 'tickets') return isTicket(n.type)
    if (tab === 'system')  return n.type === 'system'
    return true
  })

  const TABS: { key: Tab; label: string }[] = [
    { key: 'all',     label: 'Todas'     },
    { key: 'unread',  label: 'Não lidas' },
    { key: 'tickets', label: 'Chamados'  },
    { key: 'system',  label: 'Sistema'   },
  ]

  const PREFERENCES = [
    'Notificações de SLA',
    'Mensagens de chat',
    'Chamados atribuídos',
    'Atualizações do sistema',
  ]

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">

        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-zinc-900">Notificações</h1>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold bg-[#eef1ff] text-[#4f6ef7] px-2.5 py-0.5 rounded-full">
                  {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-zinc-200">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  'px-3.5 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                  tab === key
                    ? 'border-[#4f6ef7] text-[#4f6ef7]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden divide-y divide-zinc-100">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-zinc-400">
                <Bell className="w-8 h-8" />
                <p className="text-sm">Nenhuma notificação aqui.</p>
              </div>
            ) : (
              filtered.map((n) => (
                <NotifCard key={n.id} notif={n} onRead={markRead} />
              ))
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Summary card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-800">Resumo</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#eef1ff] flex items-center justify-center shrink-0">
                  <Bell className="w-3.5 h-3.5 text-[#4f6ef7]" />
                </div>
                <span className="flex-1 text-sm text-zinc-500">Não lidas</span>
                <span className="text-sm font-semibold text-zinc-900">{unreadCount}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <span className="flex-1 text-sm text-zinc-500">De chamados</span>
                <span className="text-sm font-semibold text-zinc-900">{unreadChatAssign}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <span className="flex-1 text-sm text-zinc-500">De SLA</span>
                <span className="text-sm font-semibold text-zinc-900">{unreadSla}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                  <Bell className="w-3.5 h-3.5 text-zinc-400" />
                </div>
                <span className="flex-1 text-sm text-zinc-500">De sistema</span>
                <span className="text-sm font-semibold text-zinc-900">{unreadSystem}</span>
              </div>

              {unreadTickets > 0 && (
                <div className="flex items-center gap-3 pt-1 border-t border-zinc-100">
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <span className="flex-1 text-sm text-zinc-500">Ticket total não lidas</span>
                  <span className="text-sm font-semibold text-zinc-900">{unreadTickets}</span>
                </div>
              )}
            </div>
          </div>

          {/* Preferences card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-800">Preferências de notificação</h2>

            <div className="space-y-3">
              {PREFERENCES.map((label) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-500">{label}</span>
                  <DisabledToggle />
                </div>
              ))}
            </div>

            <p className="text-xs text-zinc-400 pt-1 border-t border-zinc-100">
              Configurações de notificação disponíveis em breve.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
