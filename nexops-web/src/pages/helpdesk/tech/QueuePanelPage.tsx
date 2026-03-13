import { useState, useEffect } from 'react'
import { Building2, Clock, Sun, Moon, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQueuePanelHttp } from '@/hooks/helpdesk/useTickets'
import { useQueuePanel } from '@/hooks/helpdesk/useQueuePanel'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMinutes(min: number): string {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function timeColorDark(min: number): string {
  if (min > 120) return 'text-red-400'
  if (min >= 60)  return 'text-amber-400'
  return 'text-zinc-400'
}

function timeColorLight(min: number): string {
  if (min > 120) return 'text-red-600'
  if (min >= 60)  return 'text-amber-600'
  return 'text-zinc-400'
}

function zeroPad(n: number): string {
  return String(n).padStart(2, '0')
}

// ── Theme tokens ──────────────────────────────────────────────────────────────

const dark = {
  page:          'bg-zinc-900',
  separator:     'border-zinc-700',
  logoText:      'text-white',
  subtitle:      'text-zinc-400',
  clock:         'text-zinc-300',
  colTitle:      'text-white',
  openBadge:     'bg-zinc-700 text-zinc-300',
  activeBadge:   'bg-blue-900 text-blue-300',
  card:          'bg-zinc-800 border-zinc-700',
  cardId:        'text-zinc-500',
  statusOpen:    'bg-zinc-700 text-zinc-400',
  statusActive:  'bg-blue-900/50 text-blue-400',
  cardTitle:     'text-white',
  cardDept:      'text-zinc-500',
  cardDeptText:  'text-zinc-400',
  techName:      'text-zinc-300',
  footer:        'text-zinc-600',
  footerRight:   'text-zinc-500',
  toggleBtn:     'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500',
  timeColor:     timeColorDark,
}

const light = {
  page:          'bg-zinc-50',
  separator:     'border-zinc-200',
  logoText:      'text-zinc-900',
  subtitle:      'text-zinc-500',
  clock:         'text-zinc-700',
  colTitle:      'text-zinc-800',
  openBadge:     'bg-zinc-200 text-zinc-600',
  activeBadge:   'bg-blue-100 text-blue-700',
  card:          'bg-white border-zinc-200',
  cardId:        'text-zinc-400',
  statusOpen:    'bg-zinc-100 text-zinc-500',
  statusActive:  'bg-blue-50 text-blue-600',
  cardTitle:     'text-zinc-900',
  cardDept:      'text-zinc-400',
  cardDeptText:  'text-zinc-500',
  techName:      'text-zinc-700',
  footer:        'text-zinc-400',
  footerRight:   'text-zinc-500',
  toggleBtn:     'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:border-zinc-300',
  timeColor:     timeColorLight,
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function QueuePanelPage() {
  const { data: wsData, connected, isLoading: wsLoading } = useQueuePanel()
  const { data: httpData, isLoading: httpLoading } = useQueuePanelHttp()
  
  // Prioriza WS se conectado, senão usa HTTP. Considera loading se ambos estiverem carregando.
  const data = wsData && wsData.updatedAt ? wsData : httpData
  const isLoading = (wsLoading && httpLoading) && !data
  
  const [time,   setTime]   = useState(new Date())
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse uppercase tracking-widest text-xs">Iniciando Painel de Monitoramento...</p>
      </div>
    )
  }

  const openTickets   = data?.openTickets   ?? []
  const activeTickets = data?.inProgressTickets ?? []
  const T = isDark ? dark : light

  const hh = zeroPad(time.getHours())
  const mm = zeroPad(time.getMinutes())
  const ss = zeroPad(time.getSeconds())

  return (
    <div className={cn('h-screen w-screen overflow-hidden flex flex-col p-6 gap-4 font-sans transition-colors duration-300', T.page)}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4f6ef7] flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg leading-none">N</span>
          </div>
          <div>
            <span className={cn('font-bold text-lg tracking-tight', T.logoText)}>NexOps</span>
            <p className={cn('text-xs leading-tight', T.subtitle)}>Painel de Atendimento</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* WS connection indicator */}
          <div className="flex items-center gap-1.5">
            {connected
              ? <Wifi className={cn('h-4 w-4', isDark ? 'text-green-400' : 'text-green-500')} />
              : <WifiOff className={cn('h-4 w-4', isDark ? 'text-zinc-600' : 'text-zinc-400')} />
            }
            <span className={cn('text-xs', isDark ? 'text-zinc-500' : 'text-zinc-400')}>
              {connected ? 'Tempo real' : 'Polling'}
            </span>
          </div>

          <span className={cn('text-xl font-mono tracking-widest', T.clock)}>
            {hh}:{mm}:{ss}
          </span>

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark((d) => !d)}
            className={cn(
              'h-8 w-8 rounded-lg border flex items-center justify-center transition-colors duration-200',
              T.toggleBtn
            )}
            title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {isDark
              ? <Sun  className="h-4 w-4" />
              : <Moon className="h-4 w-4" />
            }
          </button>
        </div>
      </div>

      <div className={cn('border-t shrink-0', T.separator)} />

      {/* ── Main grid ── */}
      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">

        {/* ── Left: Em Aberto ── */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex items-center gap-2 shrink-0">
            <h2 className={cn('font-semibold text-base', T.colTitle)}>Em Aberto</h2>
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', T.openBadge)}>
              {openTickets.length}
            </span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto scrollbar-none">
            {openTickets.map((t) => (
              <div key={t.id} className={cn('border rounded-lg p-4 space-y-1.5 transition-colors duration-300', T.card)}>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-mono', T.cardId)}>#{t.id.slice(0, 8)}</span>
                  <span className={cn('text-xs rounded-full px-2 py-px', T.statusOpen)}>Aberto</span>
                  {t.isSlaBreached && (
                    <span className="text-xs rounded-full px-2 py-px bg-red-500/20 text-red-500">SLA</span>
                  )}
                </div>
                <p className={cn('font-medium text-sm', T.cardTitle)}>{t.title}</p>
                <div className="flex items-center gap-1.5">
                  <Building2 className={cn('h-3 w-3 shrink-0', T.cardDept)} />
                  <span className={cn('text-xs', T.cardDeptText)}>{t.departmentName}</span>
                </div>
                <div className={cn('flex items-center gap-1.5', T.timeColor(t.minutesOpen))}>
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="text-xs font-semibold">Aberto há {formatMinutes(t.minutesOpen)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Em Andamento ── */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex items-center gap-2 shrink-0">
            <h2 className={cn('font-semibold text-base', T.colTitle)}>Em Andamento</h2>
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', T.activeBadge)}>
              {activeTickets.length}
            </span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto scrollbar-none">
            {activeTickets.map((t) => {
              const initials = t.assigneeName
                ? t.assigneeName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
                : '?'
              return (
                <div
                  key={t.id}
                  className={cn('border border-l-[3px] border-l-[#4f6ef7] rounded-lg p-4 space-y-1.5 transition-colors duration-300', T.card)}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-mono', T.cardId)}>#{t.id.slice(0, 8)}</span>
                    <span className={cn('text-xs rounded-full px-2 py-px', T.statusActive)}>Em Andamento</span>
                    {t.isSlaBreached && (
                      <span className="text-xs rounded-full px-2 py-px bg-red-500/20 text-red-500">SLA</span>
                    )}
                  </div>
                  <p className={cn('font-medium text-sm', T.cardTitle)}>{t.title}</p>
                  <div className="flex items-center gap-1.5">
                    <Building2 className={cn('h-3 w-3 shrink-0', T.cardDept)} />
                    <span className={cn('text-xs', T.cardDeptText)}>{t.departmentName}</span>
                  </div>
                  {t.assigneeName && (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#4f6ef7] flex items-center justify-center shrink-0">
                        <span className="text-white text-[10px] font-bold leading-none">{initials}</span>
                      </div>
                      <span className={cn('text-sm', T.techName)}>{t.assigneeName}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className={cn('border-t shrink-0', T.separator)} />
      <div className="flex items-center justify-between shrink-0">
        <p className={cn('text-xs', T.footer)}>
        {connected ? 'Atualização em tempo real via WebSocket' : 'Polling HTTP a cada 30s'} · NexOps
      </p>
        {data?.updatedAt && (
          <p className={cn('text-xs', T.footerRight)}>
            Última atualização: {new Date(data.updatedAt).toLocaleTimeString('pt-BR')}
          </p>
        )}
      </div>

    </div>
  )
}
