import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Clock, CheckCircle, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type NotifType = 'breach' | 'warning' | 'resolved'
type FilterValue = 'all' | 'breach' | 'warning' | 'resolved'

interface Notification {
  id: number
  type: NotifType
  title: string
  description: string
  timestamp: string
  ticketId: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const ALL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: 'breach',
    title: 'Breach de SLA — Chamado #1042',
    description: 'Impressora não responde · Secretaria de Finanças · N2 · 2h 15min em atraso',
    timestamp: 'Hoje às 14:32',
    ticketId: '1042',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Aviso 80% — Chamado #1039',
    description: 'VPN sem acesso · RH · N2 · Prazo expira em 48min',
    timestamp: 'Hoje às 13:10',
    ticketId: '1039',
  },
  {
    id: 3,
    type: 'breach',
    title: 'Breach de SLA — Chamado #1031',
    description: 'Servidor de arquivos offline · Saúde · N3 · 5h 40min em atraso',
    timestamp: 'Hoje às 11:05',
    ticketId: '1031',
  },
  {
    id: 4,
    type: 'resolved',
    title: 'SLA Resolvido — Chamado #1028',
    description: 'Reset de senha AD · RH · N1 · Resolvido dentro do prazo',
    timestamp: 'Hoje às 09:44',
    ticketId: '1028',
  },
  {
    id: 5,
    type: 'breach',
    title: 'Breach de SLA — Chamado #1024',
    description: 'Switch de andar offline · Educação · N3 · 1h 20min em atraso',
    timestamp: 'Ontem às 17:58',
    ticketId: '1024',
  },
  {
    id: 6,
    type: 'warning',
    title: 'Aviso 80% — Chamado #1019',
    description: 'Monitor com tela piscando · Secretaria de Finanças · N1 · Prazo expira em 30min',
    timestamp: 'Ontem às 15:22',
    ticketId: '1019',
  },
  {
    id: 7,
    type: 'resolved',
    title: 'SLA Resolvido — Chamado #1014',
    description: 'E-mail não sincroniza · Educação · N1 · Resolvido dentro do prazo',
    timestamp: 'Ontem às 10:11',
    ticketId: '1014',
  },
  {
    id: 8,
    type: 'resolved',
    title: 'SLA Resolvido — Chamado #1008',
    description: 'Troca de HD defeituoso · Saúde · N3 · Resolvido dentro do prazo',
    timestamp: '07/03 às 16:30',
    ticketId: '1008',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_META: Record<NotifType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  breach:   { icon: AlertTriangle, color: 'text-red-500',    bg: 'bg-red-50',    label: 'Breach'      },
  warning:  { icon: Clock,         color: 'text-amber-500',  bg: 'bg-amber-50',  label: 'Aviso (80%)' },
  resolved: { icon: CheckCircle,   color: 'text-green-500',  bg: 'bg-green-50',  label: 'Resolvido'   },
}

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'all',      label: 'Todas'        },
  { value: 'breach',   label: 'Breach'       },
  { value: 'warning',  label: 'Aviso (80%)'  },
  { value: 'resolved', label: 'Resolvidas'   },
]

// ── Page ─────────────────────────────────────────────────────────────────────
// [ROLE: MANAGER, ADMIN]

export default function SLANotificationsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterValue>('all')

  const filtered = filter === 'all'
    ? ALL_NOTIFICATIONS
    : ALL_NOTIFICATIONS.filter((n) => n.type === filter)

  const todayBreaches  = ALL_NOTIFICATIONS.filter((n) => n.type === 'breach'   && n.timestamp.startsWith('Hoje')).length
  const activeBreaches = ALL_NOTIFICATIONS.filter((n) => n.type === 'breach').length
  const resolvedMonth  = ALL_NOTIFICATIONS.filter((n) => n.type === 'resolved').length

  return (
    <div className="p-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <span>Governança</span>
            <span className="text-zinc-300">/</span>
            <span className="text-[#4f6ef7]">Notificações de SLA</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Notificações de SLA
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-zinc-500">Alertas proativos sobre conformidade e breaches</p>
            <Badge className="bg-zinc-100 text-zinc-500 hover:bg-zinc-100 font-normal text-xs">
              Requer permissão REPORT_VIEW_ALL
            </Badge>
          </div>
        </div>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterValue)}
          className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 cursor-pointer shrink-0"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Alertas hoje</p>
          <p className="text-3xl font-bold text-zinc-900">{todayBreaches + 1}</p>
          <p className="text-xs text-zinc-400">breaches + avisos</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Breaches ativos</p>
          <p className="text-3xl font-bold text-red-600">{activeBreaches}</p>
          <p className="text-xs text-zinc-400">aguardando resolução</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Resolvidos este mês</p>
          <p className="text-3xl font-bold text-green-600">28</p>
          <p className="text-xs text-zinc-400">dentro do prazo</p>
        </div>
      </div>

      {/* ── Notifications feed ── */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
            <Bell className="h-10 w-10 text-zinc-300" />
            <p className="text-sm">Nenhuma notificação encontrada.</p>
          </div>
        ) : (
          <ul>
            {filtered.map((notif, i) => {
              const meta = TYPE_META[notif.type]
              const Icon = meta.icon
              return (
                <li
                  key={notif.id}
                  className={cn(
                    'flex items-start gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors',
                    i < filtered.length - 1 && 'border-b border-zinc-100'
                  )}
                >
                  {/* Icon */}
                  <div className={cn('mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0', meta.bg)}>
                    <Icon className={cn('h-4 w-4', meta.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-800">{notif.title}</p>
                    <p className="text-sm text-zinc-500 mt-0.5 truncate">{notif.description}</p>
                    <p className="text-xs text-zinc-400 mt-1">{notif.timestamp}</p>
                  </div>

                  {/* Action */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs text-zinc-500 hover:text-[#4f6ef7] h-8 px-3"
                    onClick={() => navigate(`/app/helpdesk/chamado/${notif.ticketId}`)}
                  >
                    Ver chamado
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

    </div>
  )
}
