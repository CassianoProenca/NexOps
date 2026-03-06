import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Search, Inbox, ChevronLeft, ChevronRight } from 'lucide-react'

const ACCENT = '#4f6ef7'

const MOCK_TICKETS = [
  { id: 1042, title: 'Impressora não responde', description: 'Impressora HP do setor não imprime desde ontem', type: 'Impressora', tier: 'N2', minutes: 14,  department: 'RH' },
  { id: 1043, title: 'Reset de senha SAM', description: 'Usuário bloqueado após tentativas incorretas', type: 'Acessos',    tier: 'N1', minutes: 32,  department: 'Finanças' },
  { id: 1044, title: 'Notebook não liga', description: 'Notebook da diretoria não inicializa após queda', type: 'Hardware',   tier: 'N3', minutes: 60,  department: 'Administração' },
  { id: 1045, title: 'VPN sem conexão após atualização', description: 'Atualização do Windows quebrou o cliente VPN', type: 'Software',   tier: 'N2', minutes: 120, department: 'Saúde' },
  { id: 1046, title: 'Monitor sem sinal na sala 204', description: 'Monitor exibe "no signal" ao ligar o computador', type: 'Hardware',   tier: 'N1', minutes: 180, department: 'Educação' },
  { id: 1047, title: 'Excel travando ao abrir planilha', description: 'Arquivo de controle orçamentário não abre', type: 'Software',   tier: 'N1', minutes: 45,  department: 'Finanças' },
  { id: 1048, title: 'Acesso ao sistema SIAD negado', description: 'Permissão removida após troca de departamento', type: 'Acessos',    tier: 'N2', minutes: 200, department: 'Administração' },
  { id: 1049, title: 'Teclado com teclas travadas', description: 'Teclas Ctrl e Alt não funcionam no teclado físico', type: 'Hardware',   tier: 'N1', minutes: 25,  department: 'RH' },
  { id: 1050, title: 'Impressora fiscal offline', description: 'Impressora fiscal do caixa aparece como offline', type: 'Impressora', tier: 'N3', minutes: 310, department: 'Finanças' },
  { id: 1051, title: 'E-mail institucional não sincroniza', description: 'Outlook não recebe e-mails desde as 8h', type: 'Software',   tier: 'N2', minutes: 90,  department: 'Saúde' },
  { id: 1052, title: 'HD externo não reconhecido', description: 'Dispositivo não aparece no Gerenciador de Dispositivos', type: 'Hardware',   tier: 'N1', minutes: 15,  department: 'Educação' },
  { id: 1053, title: 'Login único (SSO) falha no portal', description: 'Erro 401 ao tentar autenticar via SSO corporativo', type: 'Acessos',    tier: 'N3', minutes: 260, department: 'Administração' },
]

const PAGE_SIZE = 10

type SortKey = 'priority' | 'time' | 'tier'

const TIER_ORDER: Record<string, number> = { N3: 0, N2: 1, N1: 2 }

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
    let result = [...MOCK_TICKETS]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || String(t.id).includes(q)
      )
    }
    if (tierFilter) result = result.filter((t) => t.tier === tierFilter)
    if (typeFilter) result = result.filter((t) => t.type === typeFilter)

    result.sort((a, b) => {
      if (sortBy === 'time')     return b.minutes - a.minutes
      if (sortBy === 'tier')     return TIER_ORDER[a.tier] - TIER_ORDER[b.tier]
      // priority: tier first, then time
      const tierDiff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier]
      return tierDiff !== 0 ? tierDiff : b.minutes - a.minutes
    })

    return result
  }, [search, tierFilter, typeFilter, sortBy])

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
          onClick={() => navigate('/app/helpdesk/chamado/1')}
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
            className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
          />
        </div>

        {/* Nível SLA */}
        <select
          value={tierFilter}
          onChange={(e) => handleFilterChange(setTier, e.target.value)}
          className="px-3 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
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
          className="px-3 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
        >
          <option value="">Tipo: Todos</option>
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
          <option value="Acessos">Acessos</option>
          <option value="Impressora">Impressora</option>
        </select>

        {/* Ordenar */}
        <select
          value={sortBy}
          onChange={(e) => handleFilterChange(setSort, e.target.value as SortKey)}
          className="px-3 py-2 text-sm border border-zinc-200 rounded-lg text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
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
                      className="group hover:bg-zinc-50 transition-colors"
                    >
                      <td className="px-5 py-4 font-mono text-zinc-400">#{ticket.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-zinc-900">{ticket.title}</p>
                        <p className="text-xs text-zinc-400 truncate max-w-xs mt-0.5">{ticket.description}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_STYLE}`}>
                          {ticket.type}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_STYLE[ticket.tier]}`}>
                          {ticket.tier}
                        </span>
                      </td>
                      <td className={`px-5 py-4 text-sm font-medium ${isLate ? 'text-red-500' : 'text-zinc-500'}`}>
                        {formatTime(ticket.minutes)}
                      </td>
                      <td className="px-5 py-4 text-zinc-500">{ticket.department}</td>
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
