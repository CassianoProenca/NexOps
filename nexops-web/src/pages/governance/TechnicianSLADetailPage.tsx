import { useState, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ReferenceLine, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  ChevronLeft, ChevronRight, CheckCircle, XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useTechnicianMetrics, useTechnicianTickets } from '@/hooks/governance/useGovernance'

// ── Date helpers ──────────────────────────────────────────────────────────────

function firstDayOfMonth(): string {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}
function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

// ── Tooltip personalizado ─────────────────────────────────────────────────────

function SlaTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-zinc-700 mb-1">{label}</p>
      <p className="text-[#4f6ef7] font-bold">SLA: {payload[0].value}%</p>
    </div>
  )
}

// ── SLA badge helper ──────────────────────────────────────────────────────────

function SlaBadge({ pct }: { pct: number }) {
  if (pct >= 90) return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{pct}% SLA</Badge>
  if (pct >= 75) return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">{pct}% SLA</Badge>
  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{pct}% SLA</Badge>
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TechnicianSLADetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id = '' } = useParams<{ id: string }>()

  // Bug #7 fix: read name from navigation state
  const techName: string = location.state?.name ?? `${id.slice(0, 8)}…`

  const [period, setPeriod] = useState('this_month')
  const [page,   setPage]   = useState(0)
  const pageSize = 10

  // Date range derived from period selector
  const { dateFrom, dateTo } = (() => {
    const today = todayIso()
    const d = new Date()
    if (period === 'last_month') {
      d.setMonth(d.getMonth() - 1)
      const from = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
      const to   = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10)
      return { dateFrom: from, dateTo: to }
    }
    if (period === 'last_3') {
      d.setMonth(d.getMonth() - 3)
      return { dateFrom: d.toISOString().slice(0, 10), dateTo: today }
    }
    if (period === 'last_6') {
      d.setMonth(d.getMonth() - 6)
      return { dateFrom: d.toISOString().slice(0, 10), dateTo: today }
    }
    // this_month
    return { dateFrom: firstDayOfMonth(), dateTo: today }
  })()

  const apiFrom = dateFrom ? `${dateFrom}T00:00:00Z` : undefined
  const apiTo   = dateTo   ? `${dateTo}T23:59:59Z`   : undefined

  const { data: metrics, isLoading } = useTechnicianMetrics(id, apiFrom, apiTo)

  // real ticket data from API
  const { data: tickets = [], isLoading: ticketsLoading } = useTechnicianTickets(id, apiFrom, apiTo, page)

  const levelDistData = useMemo(() => {
    if (!metrics?.ticketsBySlaLevel) return []
    const colors: Record<string, string> = { 'N1': '#4f6ef7', 'N2': '#f59e0b', 'N3': '#dc2626' }
    return Object.entries(metrics.ticketsBySlaLevel).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#71717a'
    }))
  }, [metrics])

  const slaOverTime = useMemo(() => {
    if (!metrics?.timeSeries) return []
    return metrics.timeSeries.map(p => ({
      week: new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      sla: Math.round(p.slaCompliance)
    }))
  }, [metrics])

  const slaByType = useMemo(() => {
    if (!metrics?.slaComplianceByProblemType) return []
    return Object.entries(metrics.slaComplianceByProblemType).map(([type, pct]) => ({
      type,
      pct: Math.round(pct)
    })).sort((a, b) => b.pct - a.pct)
  }, [metrics])

  const levelTotal = levelDistData.reduce((s, d) => s + d.value, 0)

  // Derived from API metrics
  const attended = metrics?.totalTickets ?? 0
  const sla      = metrics ? Math.round(metrics.slaCompliancePercent) : 0
  const tmrTotal = metrics?.avgResolutionMinutes ?? 0
  const tmrH     = Math.floor(tmrTotal / 60)
  const tmrM     = Math.round(tmrTotal % 60)
  const late     = metrics?.slaBreachCount ?? 0
  const initials = techName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || id.slice(0, 2).toUpperCase()

  const hasNextPage = tickets.length === pageSize

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => navigate('/app/governance')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Avatar className="h-12 w-12 border border-zinc-200 shrink-0">
            <AvatarFallback className="bg-[#4f6ef7] text-white text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900">{techName}</h1>
              <SlaBadge pct={sla} />
            </div>
            <p className="text-sm text-zinc-500">Técnico</p>
          </div>
        </div>

        {/* Period select */}
        <select
          value={period}
          onChange={(e) => { setPeriod(e.target.value); setPage(0) }}
          className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 cursor-pointer"
        >
          <option value="this_month">Este mês</option>
          <option value="last_month">Mês anterior</option>
          <option value="last_3">Últimos 3 meses</option>
          <option value="last_6">Últimos 6 meses</option>
        </select>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chamados Atendidos */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Chamados Atendidos</p>
          <p className="text-3xl font-bold text-zinc-900">{attended}</p>
          <p className="text-xs text-zinc-400">no período</p>
        </div>

        {/* SLA Cumprido */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">SLA Cumprido</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-zinc-900">{sla}%</p>
            <span className={cn('text-xs font-semibold', sla >= 80 ? 'text-green-600' : 'text-red-500')}>
              {sla >= 80 ? 'Acima da meta' : 'Abaixo da meta'}
            </span>
          </div>
          <p className="text-xs text-zinc-400">meta: 80%</p>
        </div>

        {/* TMR */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Tempo Médio de Resolução</p>
          <p className="text-3xl font-bold text-zinc-900">{tmrH}h {String(tmrM).padStart(2, '0')}m</p>
          <p className="text-xs text-zinc-400">por chamado</p>
        </div>

        {/* Em Atraso */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Chamados em Atraso</p>
          <p className={cn('text-3xl font-bold', late > 0 ? 'text-red-600' : 'text-green-600')}>
            {late}
          </p>
          <p className="text-xs text-zinc-400">com SLA vencido</p>
        </div>
      </div>

      {/* ── SLA ao longo do tempo ── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">SLA ao Longo do Tempo</h2>
        <div className="h-52">
          {slaOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={slaOverTime} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4f6ef7" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={30} tickFormatter={(v) => `${v}%`} />
                <RTooltip content={<SlaTooltip />} />
                <ReferenceLine y={80} stroke="#a1a1aa" strokeDasharray="4 4" label={{ value: 'Meta', position: 'insideTopRight', fontSize: 10, fill: '#a1a1aa' }} />
                <Line type="monotone" dataKey="sla" stroke="#4f6ef7" strokeWidth={2} dot={{ r: 4, fill: '#4f6ef7', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-300 text-xs font-bold uppercase tracking-widest">
              Sem dados históricos
            </div>
          )}
        </div>
      </div>

      {/* ── Grid 2 colunas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Distribuição por Nível */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Distribuição por Nível</h2>
          {levelDistData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="shrink-0">
                <PieChart width={148} height={148}>
                  <Pie
                    data={levelDistData}
                    cx={74}
                    cy={74}
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {levelDistData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
              <div className="space-y-3 flex-1">
                {levelDistData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-zinc-600 font-medium">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-800">{entry.value}</span>
                      <span className="text-xs text-zinc-400">({Math.round(entry.value / levelTotal * 100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-zinc-300 text-xs font-bold uppercase tracking-widest">
              Sem chamados atendidos
            </div>
          )}
        </div>

        {/* SLA por Tipo de Problema */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">SLA por Tipo de Problema</h2>
          <div className="space-y-3">
            {slaByType.length > 0 ? slaByType.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-600 font-medium">{item.type}</span>
                  <span className={cn('font-bold text-xs', item.pct >= 80 ? 'text-[#4f6ef7]' : 'text-red-500')}>
                    {item.pct}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${item.pct}%`, backgroundColor: item.pct >= 80 ? '#4f6ef7' : '#dc2626' }}
                  />
                </div>
              </div>
            )) : (
              <div className="h-40 flex items-center justify-center text-zinc-300 text-xs font-bold uppercase tracking-widest">
                Sem dados por tipo
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Histórico de Chamados ── */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Histórico de Chamados</h2>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/60">
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Título</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden md:table-cell">Tipo</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden lg:table-cell">Nível</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden lg:table-cell">Aberto em</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden lg:table-cell">Finalizado em</th>
              <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">SLA</th>
            </tr>
          </thead>
          <tbody>
            {ticketsLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-5 py-3">
                    <div className="h-4 bg-zinc-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-zinc-400 text-xs font-semibold uppercase tracking-widest">
                  Nenhum chamado finalizado no período
                </td>
              </tr>
            ) : tickets.map((t, i) => (
              <tr
                key={t.id}
                className={cn('border-b border-zinc-100 last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/40')}
              >
                <td className="px-5 py-3 text-zinc-700 font-medium max-w-45 truncate">{t.title}</td>
                <td className="px-5 py-3 text-zinc-500 hidden md:table-cell">{t.problemTypeName}</td>
                <td className="px-5 py-3 hidden lg:table-cell">
                  <span className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded-full',
                    t.slaLevel === 'N1' ? 'bg-blue-100 text-blue-700' :
                    t.slaLevel === 'N2' ? 'bg-amber-100 text-amber-700' :
                                         'bg-red-100 text-red-700'
                  )}>
                    {t.slaLevel}
                  </span>
                </td>
                <td className="px-5 py-3 text-zinc-500 hidden lg:table-cell">
                  {t.openedAt ? new Date(t.openedAt).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td className="px-5 py-3 text-zinc-500 hidden lg:table-cell">
                  {t.closedAt ? new Date(t.closedAt).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td className="px-5 py-3 text-center">
                  {t.onSla
                    ? <CheckCircle className="h-4 w-4 text-green-500 inline" />
                    : <XCircle    className="h-4 w-4 text-red-500   inline" />
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100">
          <p className="text-xs text-zinc-400">
            {tickets.length === 0
              ? 'Nenhum resultado'
              : `Página ${page + 1} · ${tickets.length} chamado${tickets.length !== 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNextPage}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}
