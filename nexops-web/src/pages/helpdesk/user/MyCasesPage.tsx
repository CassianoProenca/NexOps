// [ROLE: END_USER]

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Inbox } from 'lucide-react'
import { useMyTickets } from '@/hooks/helpdesk/useTickets'
import { useDepartments } from '@/hooks/helpdesk/useDepartments'
import { useProblemTypes } from '@/hooks/helpdesk/useProblemTypes'
import { formatRelativeTime } from '@/lib/utils'
import type { TicketStatus } from '@/types/helpdesk.types'

// ── Display mappings ──────────────────────────────────────────────────────────

type DisplayStatus = 'Aberto' | 'Em Andamento' | 'Pausado' | 'Finalizado'

const STATUS_DISPLAY: Record<TicketStatus, DisplayStatus> = {
  OPEN: 'Aberto', IN_PROGRESS: 'Em Andamento', PAUSED: 'Pausado', CLOSED: 'Finalizado',
}

const STATUS_STYLE: Record<DisplayStatus, { bg: string; color: string }> = {
  'Aberto':       { bg: '#eef1ff', color: '#4f6ef7' },
  'Em Andamento': { bg: '#fffbeb', color: '#d97706' },
  'Pausado':      { bg: '#f4f4f5', color: '#71717a' },
  'Finalizado':   { bg: '#f0fdf4', color: '#16a34a' },
}

const STATUS_DOT: Record<DisplayStatus, string> = {
  'Aberto': '#4f6ef7', 'Em Andamento': '#d97706', 'Pausado': '#71717a', 'Finalizado': '#16a34a',
}

const STATUS_OPTIONS = ['Todos', 'Aberto', 'Em Andamento', 'Pausado', 'Finalizado'] as const
const PERIOD_OPTIONS = ['Este mês', 'Últimos 7 dias', 'Últimos 30 dias', 'Tudo'] as const

const SELECT_STYLE: React.CSSProperties = {
  height: '36px', padding: '0 32px 0 12px', borderRadius: '8px', border: '1px solid #e4e4e7',
  backgroundColor: '#ffffff', fontSize: '13px', color: '#18181b', outline: 'none', cursor: 'pointer',
  fontFamily: 'inherit', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
}

export default function MyCasesPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [periodFilter, setPeriodFilter] = useState('Este mês')

  const { data: tickets = [], isLoading } = useMyTickets()
  const { data: departments = [] } = useDepartments()
  const { data: problemTypes = [] } = useProblemTypes()

  // Build lookup maps
  const deptMap = useMemo(
    () => Object.fromEntries(departments.map((d) => [d.id, d.name])),
    [departments]
  )
  const ptMap = useMemo(
    () => Object.fromEntries(problemTypes.map((p) => [p.id, p.name])),
    [problemTypes]
  )

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const display = STATUS_DISPLAY[t.status]
      if (statusFilter !== 'Todos' && display !== statusFilter) return false

      if (periodFilter !== 'Tudo') {
        const openedMs = new Date(t.openedAt).getTime()
        const nowDate = new Date()
        const days = (nowDate.getTime() - openedMs) / 86_400_000
        if (periodFilter === 'Últimos 7 dias'  && days > 7)  return false
        if (periodFilter === 'Últimos 30 dias' && days > 30) return false
        if (periodFilter === 'Este mês') {
          const d = new Date(t.openedAt)
          if (d.getMonth() !== nowDate.getMonth() || d.getFullYear() !== nowDate.getFullYear()) return false
        }
      }
      return true
    })
  }, [tickets, statusFilter, periodFilter])

  const hasActiveFilters = statusFilter !== 'Todos' || periodFilter !== 'Este mês'

  function clearFilters() {
    setStatusFilter('Todos')
    setPeriodFilter('Este mês')
  }

  return (
    <div className="p-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
        <span>Home</span>
        <span className="text-border">/</span>
        <span>Helpdesk</span>
        <span className="text-border">/</span>
        <span className="text-brand">Meus Chamados</span>
      </div>

      {/* Título */}
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-semibold text-zinc-900">Meus Chamados</h1>
        {!isLoading && (
          <span className="text-sm text-text-secondary">{filtered.length} chamados encontrados</span>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-text-muted">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={SELECT_STYLE}>
            {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-text-muted">Período</label>
          <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} style={SELECT_STYLE}>
            {PERIOD_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '0 4px' }}>
            Limpar filtros
          </button>
        )}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl border border-[#e4e4e7] bg-zinc-50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
          <Inbox className="w-10 h-10" />
          <p className="text-sm font-medium">Nenhum chamado encontrado</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-brand hover:underline"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const displayStatus = STATUS_DISPLAY[t.status]
            const deptName = deptMap[t.departmentId] ?? '—'
            const typeName = ptMap[t.problemTypeId] ?? '—'
            return (
              <button
                key={t.id}
                onClick={() => navigate(`/app/helpdesk/chamado-usuario/${t.id}`)}
                className="w-full text-left group"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
              >
                <div className="flex items-center gap-4 p-4 rounded-xl border border-[#e4e4e7] bg-surface group-hover:border-[#4f6ef7]/40 group-hover:shadow-sm transition-all">
                  <div className="shrink-0 w-2.5 h-2.5 rounded-full mt-0.5" style={{ backgroundColor: STATUS_DOT[displayStatus] }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-text-muted">#{t.id.slice(0, 8)}</span>
                      <span className="text-sm font-semibold text-text-primary truncate">{t.title}</span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: STATUS_STYLE[displayStatus].bg, color: STATUS_STYLE[displayStatus].color }}
                      >
                        {displayStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text-muted">{typeName}</span>
                      <span className="text-text-muted text-xs">·</span>
                      <span className="text-xs text-text-muted">{deptName}</span>
                      <span className="text-text-muted text-xs">·</span>
                      <span className="text-xs text-text-muted">{formatRelativeTime(t.openedAt)}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-[#4f6ef7] shrink-0 transition-colors" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
