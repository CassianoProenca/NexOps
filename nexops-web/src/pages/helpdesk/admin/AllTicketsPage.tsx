import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Circle, Clock, PauseCircle, CheckCircle,
  Search, SearchX, Download, ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAllTickets } from '@/hooks/helpdesk/useTickets'
import { useDepartments } from '@/hooks/helpdesk/useDepartments'
import type { TicketStatus as ApiStatus, SlaLevel } from '@/types/helpdesk.types'
import { formatRelativeTime } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

type DisplayStatus = 'Aberto' | 'Em Andamento' | 'Pausado' | 'Finalizado'

const STATUS_MAP: Record<ApiStatus, DisplayStatus> = {
  OPEN:        'Aberto',
  IN_PROGRESS: 'Em Andamento',
  PAUSED:      'Pausado',
  CLOSED:      'Finalizado',
}

const STATUSES: DisplayStatus[] = ['Aberto', 'Em Andamento', 'Pausado', 'Finalizado']

const PAGE_SIZE = 10

// ── Styles ─────────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<DisplayStatus, string> = {
  'Aberto':       'bg-zinc-100 text-zinc-600',
  'Em Andamento': 'bg-blue-50 text-blue-600',
  'Pausado':      'bg-amber-50 text-amber-600',
  'Finalizado':   'bg-green-50 text-green-600',
}

const TIER_STYLE: Record<SlaLevel, string> = {
  N1: 'bg-zinc-100 text-zinc-600',
  N2: 'bg-amber-50 text-amber-600',
  N3: 'bg-red-50 text-red-600',
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div className={cn(
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm font-medium shadow-xl transition-all duration-300',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
      {message}
    </div>
  )
}

function KpiCard({
  label, value, icon, extra,
}: {
  label: string
  value: number
  icon: React.ReactNode
  extra?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">{label}</span>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-zinc-900">{value}</p>
        {extra && <div className="mt-1">{extra}</div>}
      </div>
    </div>
  )
}

function FilterSelect({
  value, onChange, placeholder, children,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'appearance-none border border-zinc-200 rounded-lg px-3 py-2 pr-7 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors',
          value ? 'text-zinc-800' : 'text-zinc-400'
        )}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AllTicketsPage() {
  const navigate   = useNavigate()
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: tickets = [], isLoading } = useAllTickets()
  const { data: departments = [] } = useDepartments()

  const deptMap = useMemo(() => Object.fromEntries(departments.map((d) => [d.id, d.name])), [departments])

  // KPIs computed from real data
  const kpi = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return {
      open:        tickets.filter((t) => t.status === 'OPEN').length,
      inProgress:  tickets.filter((t) => t.status === 'IN_PROGRESS').length,
      paused:      tickets.filter((t) => t.status === 'PAUSED').length,
      closedToday: tickets.filter((t) => t.status === 'CLOSED' && t.openedAt.slice(0, 10) === today).length,
    }
  }, [tickets])

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dept,   setDept]   = useState('')
  const [tier,   setTier]   = useState<SlaLevel | ''>('')
  const [period, setPeriod] = useState('mes')
  const [page,   setPage]   = useState(1)
  const [toast,  setToast]  = useState({ message: '', visible: false })

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message: msg, visible: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000)
  }

  const hasActiveFilter = search !== '' || status !== '' || dept !== '' || tier !== ''

  function clearFilters() {
    setSearch('')
    setStatus('')
    setDept('')
    setTier('')
    setPage(1)
  }

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const displayStatus = STATUS_MAP[t.status]
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.id.includes(search)) return false
      if (status && displayStatus !== status) return false
      if (dept && t.departmentId !== dept) return false
      if (tier && t.slaLevel !== tier) return false
      return true
    })
  }, [tickets, search, status, dept, tier])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const rangeStart  = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const rangeEnd    = Math.min(currentPage * PAGE_SIZE, filtered.length)

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Todos os Chamados</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Visão geral de todos os chamados do tenant</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Em Aberto"
          value={kpi.open}
          icon={<Circle className="w-5 h-5 text-zinc-400" />}
        />
        <KpiCard label="Em Andamento"    value={kpi.inProgress}  icon={<Clock        className="w-5 h-5 text-blue-400"  />} />
        <KpiCard label="Pausados"         value={kpi.paused}      icon={<PauseCircle  className="w-5 h-5 text-amber-400" />} />
        <KpiCard label="Finalizados hoje" value={kpi.closedToday} icon={<CheckCircle  className="w-5 h-5 text-green-500" />} />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar chamado ou #"
            className="pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand w-52"
          />
        </div>

        <FilterSelect value={status} onChange={(v) => { setStatus(v); setPage(1) }} placeholder="Status">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </FilterSelect>

        <FilterSelect value={dept} onChange={(v) => { setDept(v); setPage(1) }} placeholder="Departamento">
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </FilterSelect>

        <FilterSelect value={tier} onChange={(v) => { setTier(v as SlaLevel | ''); setPage(1) }} placeholder="Nível SLA">
          {(['N1', 'N2', 'N3'] as const).map((n) => <option key={n} value={n}>{n}</option>)}
        </FilterSelect>

        <FilterSelect value={period} onChange={setPeriod} placeholder="Período">
          <option value="hoje">Hoje</option>
          <option value="semana">Esta semana</option>
          <option value="mes">Este mês</option>
          <option value="custom">Personalizado</option>
        </FilterSelect>

        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar filtros
          </button>
        )}

        <button
          onClick={() => showToast('Funcionalidade disponível em breve.')}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 px-3 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors ml-auto"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 w-16">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Chamado</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Nível</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Departamento</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Aberto em</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Ações</th>
            </tr>
          </thead>

          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
                    <SearchX className="w-10 h-10" />
                    <p className="text-sm font-medium">Nenhum chamado encontrado</p>
                    <button onClick={clearFilters} className="text-xs text-brand hover:underline">
                      Limpar filtros
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              pageItems.map((ticket) => {
                const displayStatus = STATUS_MAP[ticket.status]
                return (
                  <tr
                    key={ticket.id}
                    className={cn(
                      'border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60 transition-colors',
                      ticket.assigneeId === null && 'bg-yellow-50/40'
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">#{ticket.id.slice(0, 8)}</td>

                    <td className="px-4 py-3 max-w-65">
                      <p className="font-medium text-zinc-800 truncate">{ticket.title}</p>
                      {ticket.assigneeId === null && (
                        <span className="text-xs text-zinc-400 italic">— Sem técnico</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold', STATUS_STYLE[displayStatus])}>
                        {displayStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold', TIER_STYLE[ticket.slaLevel])}>
                        {ticket.slaLevel}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-zinc-500">{deptMap[ticket.departmentId] ?? '—'}</td>

                    <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">{formatRelativeTime(ticket.openedAt)}</td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/app/helpdesk/chamado-gestor/${ticket.id}`)}
                        className="text-xs font-medium text-brand hover:text-brand-hover hover:underline"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 bg-zinc-50/50">
            <p className="text-xs text-zinc-400">
              Mostrando {rangeStart}–{rangeEnd} de {filtered.length} chamados
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1.5 rounded hover:bg-zinc-100 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed px-2 py-1.5 rounded hover:bg-zinc-100 transition-colors"
              >
                Próximo
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Toast {...toast} />
    </div>
  )
}
