import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PauseCircle, CheckCircle, PlayCircle,
  Inbox, Coffee, AlertCircle, X, Info,
  ChevronDown, ChevronRight,
} from 'lucide-react'
import { useAssignedTickets, usePauseTicket, useResumeTicket, useCloseTicket } from '@/hooks/helpdesk/useTickets'
import { useDepartments } from '@/hooks/helpdesk/useDepartments'
import { useProblemTypes } from '@/hooks/helpdesk/useProblemTypes'

// ── constants ─────────────────────────────────────────────────────────────────

const ACCENT  = '#4f6ef7'
const SUCCESS = '#16a34a'

// ── helpers ───────────────────────────────────────────────────────────────────

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function minutesSince(iso: string): number {
  return Math.floor((new Date().getTime() - new Date(iso).getTime()) / 60000)
}

const TIER_BADGE: Record<string, string> = {
  N1: 'bg-zinc-100 text-zinc-600',
  N2: 'bg-amber-50 text-amber-600',
  N3: 'bg-red-50 text-red-600',
}

// ── modals ────────────────────────────────────────────────────────────────────

function PauseModal({ ticketId, reason, onChangeReason, onConfirm, onClose, isPending }: {
  ticketId:       string
  reason:         string
  onChangeReason: (v: string) => void
  onConfirm:      () => void
  onClose:        () => void
  isPending:      boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">
            Pausar Chamado <span className="font-mono text-zinc-400">#{ticketId.slice(0, 8)}</span>
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600">Motivo da pausa</label>
          <textarea
            value={reason}
            onChange={(e) => onChangeReason(e.target.value)}
            placeholder="Ex: aguardando peça de reposição..."
            autoFocus
            className="w-full resize-none rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            style={{ minHeight: 88 }}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason.trim() || isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
            style={{ background: ACCENT }}
          >
            {isPending ? 'Pausando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FinalizeModal({ ticketId, onConfirm, onClose, isPending }: {
  ticketId:  string
  onConfirm: () => void
  onClose:   () => void
  isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Confirmar finalização</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-zinc-500">
          Confirmar finalização do chamado{' '}
          <span className="font-mono font-semibold text-zinc-700">#{ticketId.slice(0, 8)}</span>?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40"
            style={{ background: SUCCESS }}
          >
            {isPending ? 'Finalizando...' : 'Finalizar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── empty state ───────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, subtitle }: {
  icon:     React.ElementType
  title:    string
  subtitle: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
      <Icon className="w-9 h-9 text-zinc-300" />
      <p className="text-sm font-semibold text-zinc-500">{title}</p>
      <p className="text-sm text-zinc-400">{subtitle}</p>
    </div>
  )
}

// ── table header ──────────────────────────────────────────────────────────────

function THead({ showChevronCol }: { showChevronCol: boolean }) {
  return (
    <thead>
      <tr className="border-b border-zinc-100 bg-zinc-50">
        {showChevronCol && <th className="w-8 px-3 py-3" />}
        <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-20">#</th>
        <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Chamado</th>
        <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-28">Tipo</th>
        <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-20">Nível</th>
        <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-36">Departamento</th>
        <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-40">Tempo</th>
        <th className="w-52" />
      </tr>
    </thead>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

type TabKey = 'assigned' | 'inProgress' | 'paused'

export default function MyTicketsPage() {
  const navigate = useNavigate()

  const { data: allAssigned = [], isLoading } = useAssignedTickets()
  const { departments } = useDepartments()
  const { problemTypes } = useProblemTypes()

  const deptMap = useMemo(() => Object.fromEntries(departments.map((d) => [d.id, d.name])), [departments])
  const ptMap   = useMemo(() => Object.fromEntries(problemTypes.map((p) => [p.id, p.name])), [problemTypes])

  const pauseTicket    = usePauseTicket()
  const resumeTicket   = useResumeTicket()
  const closeTicket    = useCloseTicket()

  const [activeTab, setActiveTab]         = useState<TabKey>('assigned')
  const [pauseTargetId, setPauseTarget]   = useState<string | null>(null)
  const [pauseReason, setPauseReason]     = useState('')
  const [expandedIds, setExpandedIds]     = useState<Set<string>>(new Set())

  const assigned   = allAssigned.filter((t) => t.status === 'OPEN')
  const inProgress = allAssigned.filter((t) => t.status === 'IN_PROGRESS')
  const paused     = allAssigned.filter((t) => t.status === 'PAUSED')
  const total      = allAssigned.filter((t) => t.status !== 'CLOSED').length

  const displayed =
    activeTab === 'assigned'   ? assigned   :
    activeTab === 'inProgress' ? inProgress : paused

  // ── actions ──

  function openPauseModal(id: string) {
    setPauseTarget(id)
    setPauseReason('')
  }

  function confirmPause() {
    if (!pauseTargetId || !pauseReason.trim()) return
    pauseTicket.mutate(
      { id: pauseTargetId, data: { reason: pauseReason.trim() } },
      { onSuccess: () => { setPauseTarget(null); setPauseReason(''); setActiveTab('paused') } }
    )
  }

  function handleResume(id: string) {
    resumeTicket.mutate(id, { onSuccess: () => setActiveTab('inProgress') })
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  // ── tabs ──

  const TABS: { key: TabKey; label: string; count: number }[] = [
    { key: 'assigned',   label: 'Atribuídos',  count: assigned.length   },
    { key: 'inProgress', label: 'Em Andamento', count: inProgress.length },
    { key: 'paused',     label: 'Pausados',     count: paused.length     },
  ]

  const metaLabel =
    activeTab === 'assigned'   ? 'Atribuído' :
    activeTab === 'inProgress' ? 'Iniciado'  : 'Pausado'

  const isPaused = activeTab === 'paused'

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-zinc-900">Meus Trabalhos</h1>
          <span className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full font-medium">
            {total} chamados
          </span>
        </div>
        <p className="text-sm text-zinc-500 mt-0.5">Chamados vinculados a você</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <div className="flex gap-6">
          {TABS.map((tab) => {
            const active = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors"
                style={{
                  borderBottomColor: active ? ACCENT : 'transparent',
                  color:             active ? ACCENT : '#71717a',
                  marginBottom:      -1,
                }}
              >
                {tab.label}
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{
                    background: active ? '#eef1ff' : '#f4f4f5',
                    color:      active ? ACCENT    : '#71717a',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabela ou estado vazio */}
      {displayed.length === 0 ? (
        activeTab === 'assigned'   ? <EmptyState icon={Inbox}        title="Nenhum chamado atribuído no momento"      subtitle="Você está livre para assumir chamados da fila."    /> :
        activeTab === 'inProgress' ? <EmptyState icon={Coffee}       title="Nenhum chamado em andamento"              subtitle="Inicie um chamado atribuído para começar."          /> :
                                     <EmptyState icon={CheckCircle}  title="Nenhum chamado pausado — bom trabalho!"   subtitle="Todos os seus chamados estão em andamento."         />
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <THead showChevronCol={isPaused} />
            <tbody className="divide-y divide-zinc-100">
              {displayed.map((ticket) => {
                const isExpanded = expandedIds.has(ticket.id)
                const rowBg = isPaused ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-zinc-50'
                const mins = minutesSince(ticket.openedAt)

                return (
                  <tr key={ticket.id} className={`transition-colors ${rowBg}`}>
                    {/* Chevron col — apenas na aba Pausados */}
                    {isPaused && (
                      <td className="px-3 py-4">
                        <button
                          onClick={() => toggleExpanded(ticket.id)}
                          className="text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />
                          }
                        </button>
                      </td>
                    )}

                    {/* # */}
                    <td className="px-5 py-4 font-mono text-zinc-400 text-xs">#{ticket.id.slice(0, 8)}</td>

                    {/* Chamado */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900">{ticket.title}</p>
                      {isPaused && isExpanded ? (
                        <div className="flex items-start gap-2 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800">
                            {ticket.pauseReason ?? 'Motivo não informado'}
                          </p>
                        </div>
                      ) : null}
                    </td>

                    {/* Tipo */}
                    <td className="px-5 py-4">
                      <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-medium">
                        {ptMap[ticket.problemTypeId] ?? '—'}
                      </span>
                    </td>

                    {/* Nível */}
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_BADGE[ticket.slaLevel]}`}>
                        {ticket.slaLevel}
                      </span>
                    </td>

                    {/* Departamento */}
                    <td className="px-5 py-4 text-zinc-500">{deptMap[ticket.departmentId] ?? '—'}</td>

                    {/* Tempo */}
                    <td className="px-5 py-4 text-zinc-500 text-xs">
                      {metaLabel} há {formatTime(mins)}
                    </td>

                    {/* Ações */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {activeTab === 'assigned' && (
                          <>
                            <button
                              onClick={() => navigate(`/app/helpdesk/chamado/${ticket.id}`)}
                              className="px-3 py-1.5 rounded-md text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                              style={{ background: ACCENT }}
                            >
                              Iniciar
                            </button>
                            <button
                              onClick={() => navigate(`/app/helpdesk/chamado/${ticket.id}`)}
                              className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-100 transition-colors"
                            >
                              Ver
                            </button>
                          </>
                        )}

                        {activeTab === 'inProgress' && (
                          <>
                            <button
                              onClick={() => openPauseModal(ticket.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-100 transition-colors"
                            >
                              <PauseCircle className="w-3.5 h-3.5" />
                              Pausar
                            </button>
                            <button
                              onClick={() => navigate(`/app/helpdesk/chamado/${ticket.id}`)}
                              className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-100 transition-colors"
                            >
                              Ver Detalhes
                            </button>
                          </>
                        )}

                        {activeTab === 'paused' && (
                          <>
                            <button
                              onClick={() => handleResume(ticket.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold text-white hover:opacity-90 transition-opacity"
                              style={{ background: ACCENT }}
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              Retomar
                            </button>
                            <button
                              onClick={() => navigate(`/app/helpdesk/chamado/${ticket.id}`)}
                              className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 border border-zinc-200 hover:bg-zinc-100 transition-colors"
                            >
                              Ver
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Nota aba Atribuídos */}
      {activeTab === 'assigned' && displayed.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Info className="w-4 h-4 shrink-0" />
          Chamados atribuídos não notificam o solicitante até o início do atendimento.
        </div>
      )}

      {/* Modals */}
      {pauseTargetId !== null && (
        <PauseModal
          ticketId={pauseTargetId}
          reason={pauseReason}
          onChangeReason={setPauseReason}
          onConfirm={confirmPause}
          onClose={() => setPauseTarget(null)}
          isPending={pauseTicket.isPending}
        />
      )}

    </div>
  )
}
