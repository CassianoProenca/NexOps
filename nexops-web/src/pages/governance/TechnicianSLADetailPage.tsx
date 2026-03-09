import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

// ── Mock data ─────────────────────────────────────────────────────────────────

const TECHNICIAN = {
  id: '1',
  name: 'Carlos Mendes',
  role: 'Técnico de Suporte',
  initials: 'CM',
  sla: 91,
  attended: 38,
  tmr: '3h 47min',
  late: 3,
}

const SLA_OVER_TIME = [
  { week: 'Sem 1', sla: 88 },
  { week: 'Sem 2', sla: 94 },
  { week: 'Sem 3', sla: 87 },
  { week: 'Sem 4', sla: 91 },
]

const LEVEL_DIST = [
  { name: 'N1', value: 20, color: '#4f6ef7' },
  { name: 'N2', value: 12, color: '#f59e0b' },
  { name: 'N3', value: 6,  color: '#dc2626' },
]

const SLA_BY_TYPE = [
  { type: 'Hardware',        pct: 95 },
  { type: 'Software',        pct: 88 },
  { type: 'Rede',            pct: 91 },
  { type: 'Acesso/Senha',    pct: 100 },
  { type: 'Impressora',      pct: 83 },
  { type: 'E-mail',          pct: 75 },
]

const TICKET_HISTORY = [
  { id: '#1042', title: 'Computador não liga',         type: 'Hardware',     level: 'N1', opened: '01/03/2026', closed: '01/03/2026', onSla: true  },
  { id: '#1039', title: 'VPN sem acesso',              type: 'Rede',         level: 'N2', opened: '28/02/2026', closed: '01/03/2026', onSla: true  },
  { id: '#1031', title: 'Excel travando',              type: 'Software',     level: 'N1', opened: '25/02/2026', closed: '27/02/2026', onSla: true  },
  { id: '#1028', title: 'Reset de senha AD',           type: 'Acesso/Senha', level: 'N1', opened: '24/02/2026', closed: '24/02/2026', onSla: true  },
  { id: '#1024', title: 'Impressora HP sem imprimir',  type: 'Impressora',   level: 'N2', opened: '21/02/2026', closed: '25/02/2026', onSla: false },
  { id: '#1019', title: 'Troca de HD defeituoso',      type: 'Hardware',     level: 'N3', opened: '18/02/2026', closed: '22/02/2026', onSla: true  },
  { id: '#1014', title: 'E-mail não sincroniza',       type: 'E-mail',       level: 'N1', opened: '15/02/2026', closed: '19/02/2026', onSla: false },
  { id: '#1008', title: 'Switch de andar offline',     type: 'Rede',         level: 'N3', opened: '10/02/2026', closed: '12/02/2026', onSla: true  },
]

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
  const [period, setPeriod] = useState('this_month')
  const [page, setPage] = useState(0)
  const pageSize = 4
  const totalPages = Math.ceil(TICKET_HISTORY.length / pageSize)
  const visibleTickets = TICKET_HISTORY.slice(page * pageSize, page * pageSize + pageSize)

  const levelTotal = LEVEL_DIST.reduce((s, d) => s + d.value, 0)

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
              {TECHNICIAN.initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900">{TECHNICIAN.name}</h1>
              <SlaBadge pct={TECHNICIAN.sla} />
            </div>
            <p className="text-sm text-zinc-500">{TECHNICIAN.role}</p>
          </div>
        </div>

        {/* Period select */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
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
          <p className="text-3xl font-bold text-zinc-900">{TECHNICIAN.attended}</p>
          <p className="text-xs text-zinc-400">no período</p>
        </div>

        {/* SLA Cumprido */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">SLA Cumprido</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-zinc-900">{TECHNICIAN.sla}%</p>
            <span className="text-xs font-semibold text-green-600">Acima da meta</span>
          </div>
          <p className="text-xs text-zinc-400">meta: 80%</p>
        </div>

        {/* TMR */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Tempo Médio de Resolução</p>
          <p className="text-3xl font-bold text-zinc-900">{TECHNICIAN.tmr}</p>
          <p className="text-xs text-zinc-400">por chamado</p>
        </div>

        {/* Em Atraso */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Chamados em Atraso</p>
          <p className={cn('text-3xl font-bold', TECHNICIAN.late > 0 ? 'text-red-600' : 'text-green-600')}>
            {TECHNICIAN.late}
          </p>
          <p className="text-xs text-zinc-400">com SLA vencido</p>
        </div>
      </div>

      {/* ── SLA ao longo do tempo ── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">SLA ao Longo do Tempo</h2>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SLA_OVER_TIME} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
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
        </div>
      </div>

      {/* ── Grid 2 colunas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Distribuição por Nível */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Distribuição por Nível</h2>
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              <PieChart width={148} height={148}>
                <Pie
                  data={LEVEL_DIST}
                  cx={74}
                  cy={74}
                  innerRadius={38}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {LEVEL_DIST.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="space-y-3 flex-1">
              {LEVEL_DIST.map((entry) => (
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
        </div>

        {/* SLA por Tipo de Problema */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">SLA por Tipo de Problema</h2>
          <div className="space-y-3">
            {SLA_BY_TYPE.map((item) => (
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
            ))}
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
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">ID</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">Título</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden md:table-cell">Tipo</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden lg:table-cell">Nível</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden lg:table-cell">Aberto em</th>
              <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 hidden lg:table-cell">Finalizado em</th>
              <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">SLA</th>
            </tr>
          </thead>
          <tbody>
            {visibleTickets.map((t, i) => (
              <tr
                key={t.id}
                className={cn('border-b border-zinc-100 last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/40')}
              >
                <td className="px-5 py-3 font-mono text-xs text-zinc-400 font-semibold">{t.id}</td>
                <td className="px-5 py-3 text-zinc-700 font-medium max-w-45 truncate">{t.title}</td>
                <td className="px-5 py-3 text-zinc-500 hidden md:table-cell">{t.type}</td>
                <td className="px-5 py-3 hidden lg:table-cell">
                  <span className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded-full',
                    t.level === 'N1' ? 'bg-blue-100 text-blue-700' :
                    t.level === 'N2' ? 'bg-amber-100 text-amber-700' :
                                       'bg-red-100 text-red-700'
                  )}>
                    {t.level}
                  </span>
                </td>
                <td className="px-5 py-3 text-zinc-500 hidden lg:table-cell">{t.opened}</td>
                <td className="px-5 py-3 text-zinc-500 hidden lg:table-cell">{t.closed}</td>
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
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, TICKET_HISTORY.length)} de {TICKET_HISTORY.length} chamados
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
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}
