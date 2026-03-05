// [ROLE: END_USER]

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

type TicketStatus = 'Aberto' | 'Em Andamento' | 'Pausado' | 'Finalizado'

interface Case {
  id: number
  title: string
  status: TicketStatus
  type: string
  department: string
  time: string
}

const STATUS_STYLE: Record<TicketStatus, { bg: string; color: string }> = {
  'Aberto':       { bg: '#eef1ff', color: '#4f6ef7' },
  'Em Andamento': { bg: '#fffbeb', color: '#d97706' },
  'Pausado':      { bg: '#f4f4f5', color: '#71717a' },
  'Finalizado':   { bg: '#f0fdf4', color: '#16a34a' },
}

const STATUS_DOT: Record<TicketStatus, string> = {
  'Aberto':       '#4f6ef7',
  'Em Andamento': '#d97706',
  'Pausado':      '#71717a',
  'Finalizado':   '#16a34a',
}

const MOCK_CASES: Case[] = [
  { id: 1042, title: 'Impressora não imprime',              status: 'Em Andamento', type: 'Hardware', department: 'Secretaria', time: 'há 2h'        },
  { id: 1038, title: 'Acesso ao sistema RH bloqueado',      status: 'Aberto',       type: 'Acessos',  department: 'RH',         time: 'há 1 dia'     },
  { id: 1031, title: 'Notebook travando constantemente',    status: 'Pausado',      type: 'Hardware', department: 'Saúde',      time: 'há 3 dias'    },
  { id: 1024, title: 'Erro ao abrir o SEI',                 status: 'Finalizado',   type: 'Software', department: 'Jurídico',   time: 'há 5 dias'    },
  { id: 1018, title: 'Sem acesso à internet',               status: 'Finalizado',   type: 'Rede',     department: 'Finanças',   time: 'há 1 semana'  },
  { id: 1009, title: 'Monitor com listras na tela',         status: 'Finalizado',   type: 'Hardware', department: 'Educação',   time: 'há 2 semanas' },
]

const STATUS_OPTIONS = ['Todos', 'Aberto', 'Em Andamento', 'Pausado', 'Finalizado'] as const
const PERIOD_OPTIONS = ['Este mês', 'Últimos 7 dias', 'Últimos 30 dias', 'Tudo'] as const

const SELECT_STYLE: React.CSSProperties = {
  height: '36px',
  padding: '0 32px 0 12px',
  borderRadius: '8px',
  border: '1px solid #e4e4e7',
  backgroundColor: '#ffffff',
  fontSize: '13px',
  color: '#18181b',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
}

export default function MyCasesPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [periodFilter, setPeriodFilter] = useState('Este mês')

  const hasActiveFilters = statusFilter !== 'Todos' || periodFilter !== 'Este mês'

  function clearFilters() {
    setStatusFilter('Todos')
    setPeriodFilter('Este mês')
  }

  return (
    <div className="space-y-6">
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
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Meus Chamados</h1>
        <span className="text-sm text-text-secondary">{MOCK_CASES.length} chamados encontrados</span>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-text-muted">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={SELECT_STYLE}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-text-muted">Período</label>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            style={SELECT_STYLE}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '0 4px' }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Lista de chamados */}
      <div className="space-y-3">
        {MOCK_CASES.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/app/helpdesk/chamado/${c.id}`)}
            className="w-full text-left group"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
          >
            <div className="flex items-center gap-4 p-4 rounded-xl border border-[#e4e4e7] bg-surface group-hover:border-[#4f6ef7]/40 group-hover:shadow-sm transition-all">
              {/* Status dot */}
              <div
                className="flex-shrink-0 w-2.5 h-2.5 rounded-full mt-0.5"
                style={{ backgroundColor: STATUS_DOT[c.status] }}
              />

              <div className="flex-1 min-w-0">
                {/* Linha superior */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-text-muted">#{c.id}</span>
                  <span className="text-sm font-semibold text-text-primary truncate">{c.title}</span>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: STATUS_STYLE[c.status].bg,
                      color: STATUS_STYLE[c.status].color,
                    }}
                  >
                    {c.status}
                  </span>
                </div>

                {/* Linha inferior */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-muted">{c.type}</span>
                  <span className="text-text-muted text-xs">·</span>
                  <span className="text-xs text-text-muted">{c.department}</span>
                  <span className="text-text-muted text-xs">·</span>
                  <span className="text-xs text-text-muted">{c.time}</span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-[#4f6ef7] flex-shrink-0 transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
