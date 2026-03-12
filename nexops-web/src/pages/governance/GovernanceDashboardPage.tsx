import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ReferenceLine, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import {
  Download, CheckCircle, AlertTriangle, X, CalendarDays,
  Trophy, TrendingUp, Clock, ChevronRight, Sparkles, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useGovernanceDashboard } from '@/hooks/governance/useGovernance'
import { useGenerateReport } from '@/hooks/ai/useAi'

// ── Types ─────────────────────────────────────────────────────────────────────

type QuickFilter = 'this_month' | 'today' | 'prev_month' | 'next_month' | null

// ── Date helpers ──────────────────────────────────────────────────────────────

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
function firstDayOfMonth(offset = 0): string {
  const d = new Date()
  d.setMonth(d.getMonth() + offset, 1)
  return d.toISOString().slice(0, 10)
}
function lastDayOfMonth(offset = 0): string {
  const d = new Date()
  d.setMonth(d.getMonth() + offset + 1, 0)
  return d.toISOString().slice(0, 10)
}

const DEFAULT_FROM = firstDayOfMonth(0)
const DEFAULT_TO   = todayIso()

// ── Mock-data determinístico por período ──────────────────────────────────────

/** Hash simples para gerar variações sem aleatoriedade */
function periodHash(from: string, to: string): number {
  const s = from + to
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Gera dados do gráfico principal (diário ≤62 dias, mensal acima) */
function buildChartData(from: string, to: string) {
  const start = new Date(from)
  const end   = new Date(to)
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return { points: [], isDaily: true }

  const diffDays = Math.ceil((end.getTime() - start.getTime()) / 86_400_000)
  const isDaily  = diffDays <= 62

  const points: { label: string; sla: number; tickets: number }[] = []
  const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  if (isDaily) {
    const d = new Date(start)
    while (d <= end) {
      const dow   = d.getDay()
      const seed  = d.getDate() * 7 + d.getMonth() * 31 + (d.getFullYear() % 100) * 3
      const wknd  = dow === 0 || dow === 6
      const tickets = wknd ? 1 + (seed % 3) : 4 + (seed % 10)
      const sla     = Math.min(99, Math.max(50, wknd ? 82 + (seed % 14) : 62 + (seed % 32)))
      points.push({ label: `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`, sla, tickets })
      d.setDate(d.getDate() + 1)
    }
  } else {
    const d = new Date(start.getFullYear(), start.getMonth(), 1)
    const last = new Date(end.getFullYear(), end.getMonth(), 1)
    while (d <= last) {
      const seed    = d.getMonth() * 17 + (d.getFullYear() % 100) * 3
      const sla     = Math.min(99, Math.max(58, 70 + (seed % 24)))
      const tickets = 90 + (seed % 90)
      points.push({ label: MONTHS[d.getMonth()], sla, tickets })
      d.setMonth(d.getMonth() + 1)
    }
  }
  return { points, isDaily }
}

/** KPIs variam com o período */
function buildKpis(from: string, to: string) {
  const h       = periodHash(from, to)
  const sla     = 74 + (h % 22)
  const onTime  = 100 + (h % 60)
  const total   = onTime + 8 + (h % 25)
  const tmrH    = 2 + (h % 5)
  const tmrM    = h % 60
  const critical = h % 6
  return { sla, onTime, total, tmrH, tmrM, critical }
}

/** Status dos chamados varia com o período */
function buildStatus(from: string, to: string) {
  const h = periodHash(from, to)
  return [
    { name: 'Abertos',      value: 8  + (h % 20),  color: '#4f6ef7' },
    { name: 'Em Andamento', value: 15 + (h % 25),  color: '#d97706' },
    { name: 'Finalizados',  value: 70 + (h % 80),  color: '#16a34a' },
  ]
}

/** SLA por tipo varia ligeiramente */
function buildSlaByType(from: string, to: string) {
  const h = periodHash(from, to)
  const base = [
    { type: 'Software',   base: 88 },
    { type: 'Hardware',   base: 82 },
    { type: 'Acessos',    base: 76 },
    { type: 'Impressora', base: 70 },
    { type: 'Rede',       base: 63 },
  ]
  return base.map(({ type, base: b }, i) => {
    const sla = Math.min(99, Math.max(45, b + ((h >> i) % 10) - 5))
    const color = sla >= 85 ? '#16a34a' : sla >= 70 ? '#d97706' : '#dc2626'
    return { type, sla, color }
  })
}

/** Ranking — resolvidos variam e reordenam */
const BASE_TECHS = [
  { id: '1', name: 'Lucas Ferreira',   initials: 'LF', baseResolved: 38, baseSla: 96 },
  { id: '2', name: 'Mariana Costa',    initials: 'MC', baseResolved: 31, baseSla: 89 },
  { id: '3', name: 'Rafael Souza',     initials: 'RS', baseResolved: 27, baseSla: 82 },
  { id: '4', name: 'Ana Beatriz Lima', initials: 'AB', baseResolved: 22, baseSla: 71 },
  { id: '5', name: 'Diego Mendes',     initials: 'DM', baseResolved: 14, baseSla: 58 },
]

function buildRanking(from: string, to: string) {
  const h = periodHash(from, to)
  return BASE_TECHS
    .map((t, i) => ({
      ...t,
      resolved: Math.max(1, t.baseResolved + ((h >> i) % 12) - 6),
      sla:      Math.min(99, Math.max(40, t.baseSla + ((h >> (i+3)) % 10) - 5)),
    }))
    .sort((a, b) => b.resolved - a.resolved)
}

// Breach tickets — fixos, mas podemos variar quantos mostrar
const ALL_BREACH = [
  { id: 'HD-0412', title: 'Servidor de arquivos offline',          tech: 'Diego Mendes',     dept: 'TI',            level: 'Crítico', delay: '2h 15min' },
  { id: 'HD-0389', title: 'Falha no sistema de ponto eletrônico',  tech: 'Ana Beatriz Lima',  dept: 'RH',            level: 'Alto',    delay: '1h 40min' },
  { id: 'HD-0401', title: 'VPN sem conexão — diretoria',           tech: 'Diego Mendes',     dept: 'Diretoria',     level: 'Crítico', delay: '3h 05min' },
  { id: 'HD-0376', title: 'Impressora fiscal inoperante',          tech: 'Ana Beatriz Lima',  dept: 'Financeiro',    level: 'Médio',   delay: '0h 55min' },
  { id: 'HD-0395', title: 'Licença de software expirada',          tech: 'Rafael Souza',     dept: 'Contabilidade', level: 'Alto',    delay: '1h 20min' },
]

function buildBreach(from: string, to: string) {
  const h = periodHash(from, to)
  const count = h % 3  // 0, 1 ou 2 itens a mais que o mínimo (2)
  return ALL_BREACH.slice(0, 2 + count)
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function slaBadge(v: number) {
  if (v >= 85) return <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold text-xs">{v}%</Badge>
  if (v >= 70) return <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-semibold text-xs">{v}%</Badge>
  return <Badge className="bg-red-100 text-red-700 border-red-200 font-semibold text-xs">{v}%</Badge>
}

function levelBadge(level: string) {
  if (level === 'Crítico') return <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">{level}</Badge>
  if (level === 'Alto')    return <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">{level}</Badge>
  return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">{level}</Badge>
}

function slaKpiClass(v: number) {
  if (v >= 80) return { val: 'text-green-600', pill: 'bg-green-50 text-green-600', label: `Dentro da meta (>80%)` }
  if (v >= 60) return { val: 'text-amber-600', pill: 'bg-amber-50 text-amber-600', label: 'Atenção' }
  return { val: 'text-red-600', pill: 'bg-red-50 text-red-600', label: 'Abaixo da meta' }
}

function rankColor(i: number) {
  return i === 0 ? 'text-amber-500' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-orange-400' : 'text-zinc-300'
}

// ── Custom tooltips ───────────────────────────────────────────────────────────

function PeriodTooltip({ active, payload, label, isDaily }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  isDaily: boolean
}) {
  if (!active || !payload?.length) return null
  const slaEntry     = payload.find((p) => p.name === 'sla')
  const ticketEntry  = payload.find((p) => p.name === 'tickets')
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-md px-3 py-2 text-xs space-y-1">
      <p className="font-semibold text-zinc-600">{label}</p>
      {slaEntry    && <p className="text-[#4f6ef7] font-bold">SLA: {slaEntry.value}%</p>}
      {ticketEntry && <p className="text-zinc-500">Chamados abertos {isDaily ? 'no dia' : 'no mês'}: <span className="font-semibold text-zinc-800">{ticketEntry.value}</span></p>}
    </div>
  )
}

function DonutTooltip({ active, payload }: {
  active?: boolean
  payload?: { name: string; value: number; payload: { color: string } }[]
}) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-white border border-zinc-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-zinc-700">{d.name}</p>
      <p className="font-bold mt-0.5" style={{ color: d.payload.color }}>{d.value}% de SLA</p>
    </div>
  )
}

function SemiCircleLabel({ cx, cy, total }: { cx: number; cy: number; total: number }) {
  return (
    <text x={cx} y={cy} textAnchor="middle">
      <tspan x={cx} dy="-12" fontSize={20} fontWeight={700} fill="#18181b">{total}</tspan>
      <tspan x={cx} dy={18}  fontSize={11} fill="#71717a">chamados</tspan>
    </text>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

// [ROLE: MANAGER, ADMIN]
export default function GovernanceDashboardPage() {
  const navigate = useNavigate()

  const [dateFrom,    setDateFrom]    = useState(DEFAULT_FROM)
  const [dateTo,      setDateTo]      = useState(DEFAULT_TO)
  const [activeQuick, setActiveQuick] = useState<QuickFilter>('this_month')
  const [aiReport,    setAiReport]    = useState<string | null>(null)
  const [aiReportErr, setAiReportErr] = useState<string | null>(null)
  const { generate: generateReport, isLoading: isGeneratingReport } = useGenerateReport()

  const showClear = useMemo(
    () => dateFrom !== DEFAULT_FROM || dateTo !== DEFAULT_TO || activeQuick !== 'this_month',
    [dateFrom, dateTo, activeQuick]
  )

  function applyQuick(filter: QuickFilter) {
    setActiveQuick(filter)
    if (filter === 'this_month') { setDateFrom(firstDayOfMonth(0));  setDateTo(todayIso()) }
    else if (filter === 'today')      { const t = todayIso(); setDateFrom(t); setDateTo(t) }
    else if (filter === 'prev_month') { setDateFrom(firstDayOfMonth(-1)); setDateTo(lastDayOfMonth(-1)) }
    else if (filter === 'next_month') { setDateFrom(firstDayOfMonth(1));  setDateTo(lastDayOfMonth(1)) }
  }

  function clearFilters() {
    setDateFrom(DEFAULT_FROM)
    setDateTo(DEFAULT_TO)
    setActiveQuick('this_month')
  }

  async function handleGenerateReport() {
    setAiReport(null)
    setAiReportErr(null)
    const period = `${dateFrom} até ${dateTo}`
    const metricsData = [
      `SLA Cumprido: ${kpis.sla}%`,
      `Total de chamados: ${kpis.total}`,
      `Resolvidos no prazo: ${kpis.onTime}`,
      `Chamados críticos em breach: ${kpis.critical}`,
      `TMR médio: ${kpis.tmrH}h ${kpis.tmrM}min`,
      `SLA por tipo: ${slaByType.map((s) => `${s.type} ${s.sla}%`).join(', ')}`,
    ].join('\n')
    try {
      const result = await generateReport({ period, metricsData })
      setAiReport(result.report)
    } catch {
      setAiReportErr('IA não disponível. Configure o provedor nas configurações do sistema.')
    }
  }

  // ── Dados da API ─────────────────────────────────────────────────────────
  const { data: metrics } = useGovernanceDashboard(dateFrom, dateTo)

  // ── Dados derivados do período ───────────────────────────────────────────
  const chart      = useMemo(() => buildChartData(dateFrom, dateTo),  [dateFrom, dateTo])

  // KPIs: usa dados reais quando disponíveis, fallback para mock durante loading
  const kpis = useMemo(() => {
    if (metrics) {
      const tmrTotal = metrics.avgResolutionMinutes ?? 0
      return {
        sla:      Math.round(metrics.slaCompliancePercent),
        onTime:   metrics.totalTickets - metrics.slaBreachCount,
        total:    metrics.totalTickets,
        tmrH:     Math.floor(tmrTotal / 60),
        tmrM:     tmrTotal % 60,
        critical: metrics.slaBreachCount,
      }
    }
    return buildKpis(dateFrom, dateTo)
  }, [metrics, dateFrom, dateTo])

  // Status: usa dados reais quando disponíveis
  const statusData = useMemo(() => {
    if (metrics) {
      return [
        { name: 'Abertos',      value: metrics.openTickets,       color: '#4f6ef7' },
        { name: 'Em Andamento', value: metrics.inProgressTickets, color: '#d97706' },
        { name: 'Finalizados',  value: metrics.closedTickets,     color: '#16a34a' },
      ]
    }
    return buildStatus(dateFrom, dateTo)
  }, [metrics, dateFrom, dateTo])

  const statusTotal = useMemo(() => statusData.reduce((s, d) => s + d.value, 0), [statusData])
  const slaByType  = useMemo(() => buildSlaByType(dateFrom, dateTo),  [dateFrom, dateTo])
  const ranking    = useMemo(() => buildRanking(dateFrom, dateTo),    [dateFrom, dateTo])
  const breach     = useMemo(() => buildBreach(dateFrom, dateTo),     [dateFrom, dateTo])

  const kpiSla = slaKpiClass(kpis.sla)

  // Intervalo de tick no eixo X para não sobrepor labels
  const xInterval = chart.points.length > 20
    ? Math.ceil(chart.points.length / 12) - 1
    : chart.points.length > 10 ? 1 : 0

  const chartTitle = chart.isDaily
    ? `SLA e Chamados Abertos por Dia`
    : `SLA e Chamados Abertos por Mês`

  return (
    <div className="p-8 space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Governança & SLA</h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            SLA = <em>Service Level Agreement</em> — prazo máximo acordado para resolução de chamados por tipo/prioridade.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-zinc-600 border-zinc-200 self-start shrink-0">
          <Download className="h-4 w-4" />
          Exportar relatório
        </Button>
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-white border border-zinc-200 rounded-lg">
        {(
          [
            { key: 'this_month', label: 'Este mês'     },
            { key: 'today',      label: 'Hoje'          },
            { key: 'prev_month', label: 'Mês anterior'  },
            { key: 'next_month', label: 'Próximo mês'   },
          ] as { key: QuickFilter; label: string }[]
        ).map((q) => (
          <button
            key={q.key}
            onClick={() => applyQuick(q.key)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium border transition-all',
              activeQuick === q.key
                ? 'bg-[#4f6ef7] text-white border-[#4f6ef7]'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
            )}
          >
            {q.label}
          </button>
        ))}

        <div className="w-px h-5 bg-zinc-200 mx-1" />

        {/* Inputs de data — aceita digitação direta além do calendário */}
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setActiveQuick(null) }}
            className="h-8 rounded-md border border-zinc-200 px-2 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 bg-white"
          />
          <span className="text-xs text-zinc-400">até</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom}
            onChange={(e) => { setDateTo(e.target.value); setActiveQuick(null) }}
            className="h-8 rounded-md border border-zinc-200 px-2 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 bg-white"
          />
        </div>

        {showClear && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all border border-transparent"
          >
            <X className="h-3.5 w-3.5" />
            Limpar filtros
          </button>
        )}
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">SLA Cumprido</p>
          <p className={`text-3xl font-bold mt-2 ${kpiSla.val}`}>{kpis.sla}%</p>
          <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${kpiSla.pill}`}>
            {kpiSla.label}
          </span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Chamados no Prazo</p>
          <p className="text-3xl font-bold mt-2 text-zinc-900">{kpis.onTime}</p>
          <span className="text-xs text-zinc-400 mt-1 block">de {kpis.total} totais</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">TMR</p>
          <p className="text-3xl font-bold mt-2 text-zinc-900">{kpis.tmrH}h {String(kpis.tmrM).padStart(2,'0')}m</p>
          <span className="text-xs text-zinc-400 mt-1 block">Tempo médio de resolução</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Críticos Abertos</p>
          <div className="flex items-end gap-2 mt-2">
            <p className={`text-3xl font-bold ${kpis.critical > 0 ? 'text-red-600' : 'text-green-600'}`}>{kpis.critical}</p>
            {kpis.critical > 0 && <AlertTriangle className="h-5 w-5 text-red-500 mb-0.5" />}
          </div>
          {kpis.critical > 0
            ? <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">Requer atenção</span>
            : <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">Tudo sob controle</span>
          }
        </div>
      </div>

      {/* ── Row: Status (semi-circle) + Gráfico principal ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Semi-circle — status */}
        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
            Chamados no Período
          </p>
          <p className="text-xs text-zinc-400 mb-2">Distribuição por status</p>

          <div className="flex justify-center -mb-2">
            <PieChart width={196} height={116}>
              <Pie
                data={statusData}
                cx={98} cy={108}
                startAngle={180} endAngle={0}
                innerRadius={50} outerRadius={78}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <SemiCircleLabel cx={98} cy={108} total={statusTotal} />
            </PieChart>
          </div>

          <div className="mt-4 space-y-1.5">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-zinc-600">{d.name}</span>
                </div>
                <span className="font-semibold text-zinc-800">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ComposedChart — SLA + chamados abertos por período */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-[#4f6ef7]" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{chartTitle}</p>
          </div>

          {/* Legenda manual */}
          <div className="flex items-center gap-4 mb-3 ml-1">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              <span className="w-3 h-0.5 bg-[#4f6ef7] inline-block rounded" />
              SLA% (eixo esq.)
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              <span className="w-3 h-2 bg-[#4f6ef7]/20 inline-block rounded-sm border border-[#4f6ef7]/40" />
              Chamados abertos (eixo dir.)
            </div>
          </div>

          {chart.points.length === 0 ? (
            <div className="flex items-center justify-center h-36 text-xs text-zinc-400 italic">
              Nenhum dado para o período selecionado.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={168}>
              <ComposedChart data={chart.points} margin={{ top: 4, right: 32, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="slaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4f6ef7" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#a1a1aa' }}
                  axisLine={false}
                  tickLine={false}
                  interval={xInterval}
                  angle={chart.points.length > 14 ? -35 : 0}
                  textAnchor={chart.points.length > 14 ? 'end' : 'middle'}
                  height={chart.points.length > 14 ? 36 : 20}
                />

                {/* Eixo esquerdo — SLA% */}
                <YAxis
                  yAxisId="sla"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10, fill: '#a1a1aa' }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />

                {/* Eixo direito — chamados */}
                <YAxis
                  yAxisId="tickets"
                  orientation="right"
                  tick={{ fontSize: 10, fill: '#a1a1aa' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />

                <RTooltip content={(props) => (
                  <PeriodTooltip
                    active={props.active}
                    payload={props.payload as { name: string; value: number; color: string }[]}
                    label={props.label as string}
                    isDaily={chart.isDaily}
                  />
                )} />

                <ReferenceLine
                  yAxisId="sla"
                  y={80}
                  stroke="#d4d4d8"
                  strokeDasharray="4 4"
                  label={{ value: 'Meta 80%', position: 'insideTopRight', fontSize: 9, fill: '#a1a1aa' }}
                />

                {/* Barras — chamados abertos */}
                <Bar
                  yAxisId="tickets"
                  dataKey="tickets"
                  fill="#4f6ef7"
                  fillOpacity={0.18}
                  stroke="#4f6ef7"
                  strokeOpacity={0.4}
                  strokeWidth={0.5}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={chart.isDaily ? 14 : 32}
                />

                {/* Área — SLA% */}
                <Area
                  yAxisId="sla"
                  type="monotone"
                  dataKey="sla"
                  stroke="#4f6ef7"
                  strokeWidth={2}
                  fill="url(#slaGrad)"
                  dot={chart.points.length <= 12 ? { fill: '#4f6ef7', r: 3 } : false}
                  activeDot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Row: SLA por tipo (donut) + Ranking ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Donut — SLA por tipo */}
        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
            SLA por Tipo de Problema
          </p>
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <PieChart width={152} height={152}>
                <Pie data={slaByType} cx={76} cy={76} innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="sla" nameKey="type">
                  {slaByType.map((e) => <Cell key={e.type} fill={e.color} />)}
                </Pie>
                <RTooltip content={<DonutTooltip />} />
              </PieChart>
            </div>
            <div className="flex-1 space-y-2.5">
              {slaByType.map((d) => (
                <div key={d.type} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-zinc-600 flex-1">{d.type}</span>
                  <span className="text-xs font-bold" style={{ color: d.color }}>{d.sla}%</span>
                </div>
              ))}
              <div className="pt-1.5 border-t border-zinc-100">
                <p className="text-[10px] text-zinc-400 leading-relaxed">Verde ≥85% · Âmbar ≥70%<br />Vermelho &lt;70%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking — chamados resolvidos */}
        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-amber-500" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Ranking — Chamados Resolvidos
            </p>
          </div>
          <div className="space-y-2">
            {ranking.map((tech, idx) => (
              <button
                key={tech.id}
                onClick={() => navigate(`/app/governance/tecnico/${tech.id}`)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-100 hover:border-[#4f6ef7]/30 hover:bg-[#4f6ef7]/5 transition-all text-left group"
              >
                <span className={cn('w-5 text-center text-xs font-bold shrink-0', rankColor(idx))}>{idx + 1}</span>
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-[#4f6ef7]/10 text-[#4f6ef7] text-[10px] font-bold">{tech.initials}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium text-zinc-800 truncate">{tech.name}</span>
                <span className="text-xs font-semibold text-zinc-500 shrink-0">{tech.resolved} res.</span>
                {slaBadge(tech.sla)}
                {/* → detalhe do técnico: /app/governance/tecnico/:id (página a implementar) */}
                <ChevronRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-[#4f6ef7] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Breach de SLA ────────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="h-4 w-4 text-red-500" />
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Chamados em Breach de SLA
          </p>
        </div>

        {breach.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <CheckCircle className="h-9 w-9 text-green-500" />
            <p className="text-sm font-medium text-zinc-600">Nenhum chamado em breach</p>
            <p className="text-xs text-zinc-400">Todos os chamados estão dentro do prazo acordado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['ID', 'Título', 'Técnico', 'Departamento', 'Nível', 'Tempo em atraso', 'Ação'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-3 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {breach.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-zinc-500">{t.id}</td>
                    <td className="py-3 pr-4 text-zinc-800 font-medium max-w-45 truncate">{t.title}</td>
                    <td className="py-3 pr-4 text-zinc-600 text-xs whitespace-nowrap">{t.tech}</td>
                    <td className="py-3 pr-4 text-zinc-600 text-xs">{t.dept}</td>
                    <td className="py-3 pr-4">{levelBadge(t.level)}</td>
                    <td className="py-3 pr-4 text-red-600 font-semibold text-xs whitespace-nowrap">{t.delay}</td>
                    <td className="py-3">
                      <Button
                        variant="ghost" size="sm"
                        className="h-7 px-3 text-xs text-zinc-600 hover:text-zinc-900"
                        onClick={() => navigate(`/app/helpdesk/chamado/${t.id}`)}
                      >
                        Ver chamado
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── AI Report Generator ─────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-zinc-100">
          <Sparkles className="w-4 h-4" style={{ color: '#4f6ef7' }} />
          <h2 className="text-sm font-semibold text-zinc-900">Relatório IA</h2>
          <span className="text-xs bg-[#eef1ff] text-[#4f6ef7] px-2 py-0.5 rounded-full font-medium">Beta</span>
          <p className="ml-2 text-xs text-zinc-400 hidden sm:block">
            Gere um relatório executivo com base nos dados do período selecionado.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#4f6ef7', border: 'none', cursor: isGeneratingReport ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
          >
            {isGeneratingReport ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando relatório...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar relatório do período
              </>
            )}
          </button>

          {(aiReport || aiReportErr) && (
            <div
              className="rounded-lg border p-5 text-sm whitespace-pre-wrap leading-relaxed"
              style={{
                borderColor: aiReportErr ? '#fca5a5' : '#c7d2fe',
                backgroundColor: aiReportErr ? '#fef2f2' : '#f8faff',
                color: aiReportErr ? '#dc2626' : '#3f3f46',
              }}
            >
              {aiReport ?? aiReportErr}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
