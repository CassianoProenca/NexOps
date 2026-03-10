import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Search, Inbox, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAllTickets } from '@/hooks/helpdesk/useTickets'
import { useDepartments } from '@/hooks/helpdesk/useDepartments'
import { useProblemTypes } from '@/hooks/helpdesk/useProblemTypes'

const ACCENT = '#4f6ef7'

const PAGE_SIZE = 10

type SortKey = 'priority' | 'time' | 'tier'

const TIER_ORDER: Record<string, number> = { N3: 0, N2: 1, N1: 2 }

function minutesOpen(iso: string): number {
  return Math.floor((new Date().getTime() - new Date(iso).getTime()) / 60000)
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

const TIER_STYLE: Record<string, string> = {
  N1: 'bg-zinc-100 text-zinc-600',
  N2: 'bg-amber-50 text-amber-600',
  N3: 'bg-red-50 text-red-600',
}

const TYPE_STYLE = 'bg-zinc-100 text-zinc-600'

export default function TicketQueuePage() {
  const navigate = useNavigate()

  const { data: allTickets = [] } = useAllTickets()
  const { data: departments = [] } = useDepartments()
  const { data: problemTypes = [] } = useProblemTypes()

  const deptMap = useMemo(() => Object.fromEntries(departments.map((d) => [d.id, d.name])), [departments])
  const ptMap   = useMemo(() => Object.fromEntries(problemTypes.map((p) => [p.id, p.name])), [problemTypes])

  // Only show OPEN tickets in the queue
  const openTickets = useMemo(
    () => allTickets.filter((t) => t.status === 'OPEN'),
    [allTickets]
  )

  const [search, setSearch]     = useState('')
  const [tierFilter, setTier]   = useState('')
  const [typeFilter, setType]   = useState('')
  const [sortBy, setSort]       = useState<SortKey>('priority')
  const [page, setPage]         = useState(1)

  const hasActiveFilter = search !== '' || tierFilter !== '' || typeFilter !== ''

  function clearFilters() {
    setSearch('')
    setTier('')
    setType('')
    setPage(1)
  }

  const filtered = useMemo(() => {
    let result = openTickets.map((t) => ({
      ...t,
      typeName: ptMap[t.problemTypeId] ?? '—',
      deptName: deptMap[t.departmentId] ?? '—',
      minutes: minutesOpen(t.openedAt),
    }))

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
      )
    }
    if (tierFilter) result = result.filter((t) => t.slaLevel === tierFilter)
    if (typeFilter) result = result.filter((t) => t.typeName === typeFilter)

    result.sort((a, b) => {
      if (sortBy === 'time')  return b.minutes - a.minutes
      if (sortBy === 'tier')  return TIER_ORDER[a.slaLevel] - TIER_ORDER[b.slaLevel]
      const tierDiff = TIER_ORDER[a.slaLevel] - TIER_ORDER[b.slaLevel]
      return tierDiff !== 0 ? tierDiff : b.minutes - a.minutes
    })

    return result
  }, [openTickets, search, tierFilter, typeFilter, sortBy, ptMap, deptMap])

  // Dynamic problem type options for the select
  const typeOptions = useMemo(() => [...new Set(filtered.map((t) => t.typeName).filter(Boolean))], [filtered])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const start      = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const end        = Math.min(safePage * PAGE_SIZE, filtered.length)

  function handleFilterChange<T>(setter: (v: T) => void, value: T) {
    setter(value)
    setPage(1)
  }

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-zinc-900">Fila de Chamados</h1>
            <span className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full font-medium">
              {filtered.length} chamados
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">Chamados aguardando atendimento na sua fila</p>
        </div>

        <button
          onClick={() => filtered[0] && navigate(`/app/helpdesk/chamado/${filtered[0].id}`)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity shrink-0"
          style={{ background: ACCENT }}
        >
          <Zap className="w-4 h-4" />
          Atender Próximo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Busca */}
        <div className="relative flex-1 min-w-50 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por título ou nº..."
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
          />
        </div>

        {/* Nível SLA */}
        <select
          value={tierFilter}
          onChange={(e) => handleFilterChange(setTier, e.target.value)}
          className="px-3 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
        >
          <option value="">Nível SLA: Todos</option>
          <option value="N1">N1</option>
          <option value="N2">N2</option>
          <option value="N3">N3</option>
        </select>

        {/* Tipo de Problema */}
        <select
          value={typeFilter}
          onChange={(e) => handleFilterChange(setType, e.target.value)}
          className="px-3 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
        >
          <option value="">Tipo: Todos</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Ordenar */}
        <select
          value={sortBy}
          onChange={(e) => handleFilterChange(setSort, e.target.value as SortKey)}
          className="px-3 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
        >
          <option value="priority">Ordenar: Prioridade</option>
          <option value="time">Ordenar: Tempo na fila</option>
          <option value="tier">Ordenar: Nível SLA</option>
        </select>

        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        {paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <Inbox className="w-10 h-10 text-zinc-300" />
            <p className="text-sm font-semibold text-zinc-500">Nenhum chamado na fila agora</p>
            <p className="text-sm text-zinc-400">Aproveite para revisar seus chamados em andamento.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-20">#</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Chamado</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-32">Tipo</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-20">Nível</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-32">Tempo na fila</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-36">Departamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginated.map((ticket) => {
                  const isLate = ticket.minutes > 120
                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => navigate(`/app/helpdesk/chamado/${ticket.id}`)}
                      className="group hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4 font-mono text-zinc-400 text-xs">#{ticket.id.slice(0, 8)}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-zinc-900">{ticket.title}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_STYLE}`}>
                          {ticket.typeName}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_STYLE[ticket.slaLevel]}`}>
                          {ticket.slaLevel}
                        </span>
                      </td>
                      <td className={`px-5 py-4 text-sm font-medium ${isLate ? 'text-red-500' : 'text-zinc-500'}`}>
                        {formatTime(ticket.minutes)}
                      </td>
                      <td className="px-5 py-4 text-zinc-500">{ticket.deptName}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Rodapé / paginação */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-100">
              <p className="text-xs text-zinc-400">
                Mostrando {start}–{end} de {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-zinc-500 px-2 font-medium">
                  {safePage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
