import { useState, useEffect } from 'react'
import { ArrowLeftRight, Sun, Moon } from 'lucide-react'
import { useQueuePanel, type QueueTicket, type InProgressTicket } from '@/hooks/useQueuePanel'

// ── theme ─────────────────────────────────────────────────────────────────────

type Theme = {
  isDark:                 boolean
  pageBg:                 string
  cardBg:                 string
  cardBorder:             string
  headerBorder:           string
  dividerBg:              string
  titleText:              string
  subtitleText:           string
  sectionLabel:           string
  countBadgeBg:           string
  countBadgeText:         string
  typeBadgeBg:            string
  typeBadgeText:          string
  dot:                    string
  departmentText:         string
  inProgressTime:         string
  dividerIndicatorBg:     string
  dividerIndicatorBorder: string
  arrowIcon:              string
  techName:               string
  scrollbarColor:         string
  emptyText:              string
  toggleBg:               string
  toggleIcon:             string
  reconnectBg:            string
  reconnectBorder:        string
  techDivider:            string
}

const DARK: Theme = {
  isDark:                 true,
  pageBg:                 '#09090b',
  cardBg:                 '#18181b',
  cardBorder:             '#27272a',
  headerBorder:           '#27272a',
  dividerBg:              '#27272a',
  titleText:              '#ffffff',
  subtitleText:           '#a1a1aa',
  sectionLabel:           '#a1a1aa',
  countBadgeBg:           '#27272a',
  countBadgeText:         '#d4d4d8',
  typeBadgeBg:            '#27272a',
  typeBadgeText:          '#a1a1aa',
  dot:                    '#52525b',
  departmentText:         '#52525b',
  inProgressTime:         '#a1a1aa',
  dividerIndicatorBg:     '#18181b',
  dividerIndicatorBorder: '#27272a',
  arrowIcon:              '#52525b',
  techName:               '#d4d4d8',
  scrollbarColor:         '#3f3f46',
  emptyText:              '#52525b',
  toggleBg:               '#27272a',
  toggleIcon:             '#a1a1aa',
  reconnectBg:            'rgba(120,53,15,0.4)',
  reconnectBorder:        'rgba(146,64,14,0.4)',
  techDivider:            '#27272a',
}

const LIGHT: Theme = {
  isDark:                 false,
  pageBg:                 '#f4f4f5',
  cardBg:                 '#ffffff',
  cardBorder:             '#e4e4e7',
  headerBorder:           '#e4e4e7',
  dividerBg:              '#e4e4e7',
  titleText:              '#18181b',
  subtitleText:           '#71717a',
  sectionLabel:           '#71717a',
  countBadgeBg:           '#e4e4e7',
  countBadgeText:         '#52525b',
  typeBadgeBg:            '#f4f4f5',
  typeBadgeText:          '#71717a',
  dot:                    '#a1a1aa',
  departmentText:         '#a1a1aa',
  inProgressTime:         '#71717a',
  dividerIndicatorBg:     '#ffffff',
  dividerIndicatorBorder: '#e4e4e7',
  arrowIcon:              '#a1a1aa',
  techName:               '#52525b',
  scrollbarColor:         '#d4d4d8',
  emptyText:              '#a1a1aa',
  toggleBg:               '#e4e4e7',
  toggleIcon:             '#52525b',
  reconnectBg:            '#fffbeb',
  reconnectBorder:        '#fde68a',
  techDivider:            '#f4f4f5',
}

// ── helpers ───────────────────────────────────────────────────────────────────

function useClock(): string {
  const [time, setTime] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function queueTimeColor(minutes: number, isDark: boolean): string {
  if (minutes > 240) return isDark ? '#f87171' : '#ef4444'
  if (minutes > 120) return isDark ? '#fbbf24' : '#d97706'
  return isDark ? '#a1a1aa' : '#71717a'
}

function tierBadgeStyle(tier: string, isDark: boolean): { background: string; color: string } {
  if (isDark) {
    if (tier === 'N2') return { background: 'rgba(120,53,15,0.5)',  color: '#fbbf24' }
    if (tier === 'N3') return { background: 'rgba(127,29,29,0.5)',  color: '#f87171' }
    return                     { background: '#27272a',              color: '#d4d4d8' }
  } else {
    if (tier === 'N2') return { background: '#fffbeb', color: '#d97706' }
    if (tier === 'N3') return { background: '#fef2f2', color: '#dc2626' }
    return                     { background: '#f4f4f5', color: '#52525b' }
  }
}

const TIER_LEFT_BORDER: Record<string, string> = {
  N1: '#71717a',
  N2: '#f59e0b',
  N3: '#ef4444',
}

const ACCENT = '#4f6ef7'

// ── sub-components ────────────────────────────────────────────────────────────

function WaitingCard({ ticket, theme }: { ticket: QueueTicket; theme: Theme }) {
  return (
    <div
      className="rounded-lg p-4 space-y-2.5"
      style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
          style={tierBadgeStyle(ticket.tier, theme.isDark)}
        >
          {ticket.tier}
        </span>
        <span className="font-medium leading-snug" style={{ color: theme.titleText }}>
          {ticket.title}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: theme.typeBadgeBg, color: theme.typeBadgeText }}
        >
          {ticket.type}
        </span>
        <span className="text-xs" style={{ color: theme.dot }}>·</span>
        <span className="text-xs font-medium" style={{ color: queueTimeColor(ticket.minutesInQueue, theme.isDark) }}>
          {formatMinutes(ticket.minutesInQueue)} na fila
        </span>
        <span className="text-xs ml-auto" style={{ color: theme.departmentText }}>
          {ticket.department}
        </span>
      </div>
    </div>
  )
}

function InProgressCard({ ticket, theme }: { ticket: InProgressTicket; theme: Theme }) {
  return (
    <div
      className="rounded-lg p-4 space-y-2.5"
      style={{
        background:      theme.cardBg,
        border:          `1px solid ${theme.cardBorder}`,
        borderLeftColor: TIER_LEFT_BORDER[ticket.tier],
        borderLeftWidth: 3,
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
          style={tierBadgeStyle(ticket.tier, theme.isDark)}
        >
          {ticket.tier}
        </span>
        <span className="font-medium leading-snug" style={{ color: theme.titleText }}>
          {ticket.title}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: theme.typeBadgeBg, color: theme.typeBadgeText }}
        >
          {ticket.type}
        </span>
        <span className="text-xs" style={{ color: theme.dot }}>·</span>
        <span className="text-xs" style={{ color: theme.inProgressTime }}>
          {formatMinutes(ticket.minutesInProgress)} em andamento
        </span>
        <span className="text-xs ml-auto" style={{ color: theme.departmentText }}>
          {ticket.department}
        </span>
      </div>
      <div
        className="flex items-center gap-2 pt-1.5"
        style={{ borderTop: `1px solid ${theme.techDivider}` }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
          style={{ background: ACCENT }}
        >
          {ticket.technicianInitials}
        </div>
        <span className="text-sm" style={{ color: theme.techName }}>
          {ticket.technicianName}
        </span>
      </div>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function QueuePanelPage() {
  const { waiting, inProgress, connected } = useQueuePanel()
  const clock = useClock()
  const [isDark, setIsDark] = useState(true)
  const theme = isDark ? DARK : LIGHT

  const sortedWaiting    = [...waiting].sort((a, b) => b.minutesInQueue - a.minutesInQueue)
  const sortedInProgress = [...inProgress].sort((a, b) => a.minutesInProgress - b.minutesInProgress)

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ fontSize: 15, background: theme.pageBg, color: theme.titleText }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&display=swap');`}</style>

      {/* Reconectando banner */}
      {!connected && (
        <div
          className="px-6 py-1.5 text-center shrink-0"
          style={{ background: theme.reconnectBg, borderBottom: `1px solid ${theme.reconnectBorder}` }}
        >
          <span className="text-xs font-medium tracking-wide" style={{ color: '#d97706' }}>
            Reconectando...
          </span>
        </div>
      )}

      {/* Header */}
      <header
        className="flex items-center px-8 shrink-0"
        style={{ height: 56, borderBottom: `1px solid ${theme.headerBorder}` }}
      >
        <span
          className="text-xl font-bold w-40"
          style={{ fontFamily: 'Syne, sans-serif', color: theme.titleText }}
        >
          NexOps
        </span>

        <p className="flex-1 text-center text-sm tracking-wide" style={{ color: theme.subtitleText }}>
          Central de Atendimento — TI
        </p>

        <div className="flex items-center gap-3 w-40 justify-end">
          {/* Toggle dark/light */}
          <button
            onClick={() => setIsDark((v) => !v)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: theme.toggleBg }}
            title={isDark ? 'Modo claro' : 'Modo escuro'}
          >
            {isDark
              ? <Sun  className="w-3.5 h-3.5" style={{ color: theme.toggleIcon }} />
              : <Moon className="w-3.5 h-3.5" style={{ color: theme.toggleIcon }} />
            }
          </button>

          <span className="font-mono text-base tabular-nums" style={{ color: theme.titleText }}>
            {clock}
          </span>
        </div>
      </header>

      {/* Colunas */}
      <div className="flex flex-1 overflow-hidden">

        {/* Coluna esquerda — Aguardando */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-3 px-8 py-4 shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.sectionLabel }}>
              Aguardando Atendimento
            </h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: theme.countBadgeBg, color: theme.countBadgeText }}
            >
              {sortedWaiting.length}
            </span>
          </div>
          <div
            className="flex-1 overflow-y-auto px-8 pb-8 space-y-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: `${theme.scrollbarColor} transparent` }}
          >
            {sortedWaiting.map((ticket) => (
              <WaitingCard key={ticket.id} ticket={ticket} theme={theme} />
            ))}
            {sortedWaiting.length === 0 && (
              <p className="text-sm italic text-center pt-8" style={{ color: theme.emptyText }}>
                Nenhum chamado aguardando.
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div
          className="relative flex items-center justify-center shrink-0"
          style={{ width: 1, background: theme.dividerBg }}
        >
          <div
            className="absolute flex items-center justify-center w-8 h-8 rounded-full z-10"
            style={{ background: theme.dividerIndicatorBg, border: `1px solid ${theme.dividerIndicatorBorder}` }}
          >
            <ArrowLeftRight className="w-4 h-4" style={{ color: theme.arrowIcon }} />
          </div>
        </div>

        {/* Coluna direita — Em Atendimento */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-3 px-8 py-4 shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.sectionLabel }}>
              Em Atendimento
            </h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: theme.countBadgeBg, color: theme.countBadgeText }}
            >
              {sortedInProgress.length}
            </span>
          </div>
          <div
            className="flex-1 overflow-y-auto px-8 pb-8 space-y-3"
            style={{ scrollbarWidth: 'thin', scrollbarColor: `${theme.scrollbarColor} transparent` }}
          >
            {sortedInProgress.map((ticket) => (
              <InProgressCard key={ticket.id} ticket={ticket} theme={theme} />
            ))}
            {sortedInProgress.length === 0 && (
              <p className="text-sm italic text-center pt-8" style={{ color: theme.emptyText }}>
                Nenhum chamado em andamento.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
