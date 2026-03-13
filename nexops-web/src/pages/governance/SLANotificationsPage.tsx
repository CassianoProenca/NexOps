// [ROLE: MANAGER, ADMIN]

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  AlertTriangle, Clock, CheckCircle, Bell, 
  ChevronRight, Search, CheckCheck, 
  Trash2, MailOpen, Mail, ShieldAlert, Loader2 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, formatDateTime } from '@/lib/utils'
import { 
  useSlaNotifications, 
  useMarkNotificationAsRead, 
  useMarkAllNotificationsAsRead 
} from '@/hooks/governance/useGovernance'

// ── Types ─────────────────────────────────────────────────────────────────────

type NotifType = 'SLA_BREACH' | 'SLA_WARNING' | 'DAILY_SUMMARY'
type FilterValue = 'all' | NotifType

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_META: Record<NotifType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  SLA_BREACH:    { icon: ShieldAlert, color: 'text-red-600',    bg: 'bg-red-50',    label: 'Breach' },
  SLA_WARNING:   { icon: Clock,         color: 'text-amber-600',  bg: 'bg-amber-50',  label: 'Atenção' },
  DAILY_SUMMARY: { icon: CheckCircle,   color: 'text-brand',      bg: 'bg-brand/10',  label: 'Resumo' },
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SLANotificationsPage() {
  const navigate = useNavigate()
  const { data: notifications = [], isLoading } = useSlaNotifications()
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<FilterValue>('all')

  const filtered = useMemo(() => {
    return notifications.filter(n => {
      // In a real scenario, the backend might return titles/descriptions.
      // Since our domain model just has ticketId and type, we'll infer some labels.
      const matchType = filterType === 'all' || n.notificationType === filterType
      const matchSearch = n.ticketId?.toLowerCase().includes(search.toLowerCase())
      return matchType && matchSearch
    })
  }, [notifications, search, filterType])

  const unreadCount = notifications.filter(n => !n.readAt).length

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-zinc-50/30">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-zinc-50/30 overflow-hidden font-sans">
      
      {/* ── HEADER ── */}
      <header className="px-10 py-6 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-20">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">
            <Bell className="w-3 h-3 text-brand" /> Auditoria de Eventos
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-zinc-900 tracking-tight uppercase">Notificações de SLA</h1>
            {unreadCount > 0 && (
              <Badge className="bg-brand text-white font-black text-[10px] px-2 py-0.5 rounded-lg">{unreadCount} NOVAS</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-brand transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar chamado..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-11 pr-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:border-brand/30 transition-all w-64 shadow-sm"
            />
          </div>
          <Separator orientation="vertical" className="h-8 bg-zinc-100 mx-2" />
          <Button 
            variant="ghost" 
            onClick={() => markAllAsRead.mutate()}
            disabled={unreadCount === 0 || markAllAsRead.isPending}
            className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-brand gap-2"
          >
            <CheckCheck className="w-4 h-4" /> Marcar todas
          </Button>
        </div>
      </header>

      {/* ── FILTERS BAR ── */}
      <div className="px-10 py-4 bg-white/50 border-b border-zinc-100 flex items-center gap-2 shrink-0">
        {(['all', 'SLA_BREACH', 'SLA_WARNING', 'DAILY_SUMMARY'] as const).map(t => (
          <button 
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              filterType === t ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
            )}
          >
            {t === 'all' ? 'Tudo' : t === 'SLA_BREACH' ? 'Estouro (Breach)' : t === 'SLA_WARNING' ? 'Avisos (80%)' : 'Resumo'}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 grayscale gap-4">
            <MailOpen className="w-16 h-16 text-zinc-300" />
            <p className="text-[11px] font-black uppercase tracking-[0.3em]">Nenhuma notificação por aqui</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filtered.map((n) => {
              const meta = TYPE_META[n.notificationType as NotifType] || TYPE_META.DAILY_SUMMARY
              const Icon = meta.icon
              const isRead = !!n.readAt

              return (
                <div 
                  key={n.id} 
                  className={cn(
                    "px-10 py-5 flex items-start gap-6 transition-all group relative border-l-4",
                    isRead ? "bg-transparent border-transparent opacity-60" : "bg-white border-brand shadow-sm z-10"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2", meta.bg, meta.color.replace('text', 'border'))}>
                    <Icon className={cn("w-5 h-5", meta.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={cn("text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-md border", meta.bg, meta.color.replace('text', 'border'), meta.color)}>
                        {meta.label}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-tighter">{formatDateTime(n.sentAt)}</span>
                    </div>
                    <h3 className={cn("text-xs font-black uppercase tracking-tight mb-0.5", isRead ? "text-zinc-500" : "text-zinc-900")}>
                      Alerta do Sistema — Chamado #{n.ticketId.slice(0, 8)}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-medium leading-relaxed italic truncate">
                      "O chamado atingiu a condição de {meta.label.toLowerCase()} de acordo com as regras de governança."
                    </p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isRead && (
                      <button 
                        onClick={() => markAsRead.mutate(n.id)}
                        disabled={markAsRead.isPending}
                        title="Marcar como lida"
                        className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-400 hover:text-brand hover:border-brand/30 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => navigate(`/app/helpdesk/chamado/${n.ticketId}`)}
                      className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-400 hover:text-brand hover:border-brand/30 transition-all active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {}} // Delete not supported in backend yet
                      className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-400 hover:text-red-500 hover:border-red-500/30 transition-all active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── FOOTER STATS ── */}
      <footer className="px-10 py-4 bg-white border-t border-zinc-100 flex items-center justify-between shrink-0">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mostrando {filtered.length} notificações de {notifications.length}</p>
        <div className="flex items-center gap-4">
          <Separator orientation="vertical" className="h-4 bg-zinc-100" />
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Espaço utilizado: {((notifications.length / 1000) * 100).toFixed(1)}%</p>
        </div>
      </footer>

    </div>
  )
}
