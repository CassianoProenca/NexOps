import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Tag, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProblemTypes, useCreateProblemType, useDeactivateProblemType } from '@/hooks/helpdesk/useProblemTypes'
import type { ProblemType, SlaLevel } from '@/types/helpdesk.types'

// ── Styles ─────────────────────────────────────────────────────────────────────

type Tier = SlaLevel   // 'N1' | 'N2' | 'N3'

const TIER_BADGE: Record<Tier, string> = {
  N1: 'bg-zinc-100 text-zinc-600',
  N2: 'bg-amber-50 text-amber-600',
  N3: 'bg-red-50 text-red-600',
}

const TIER_DESC: Record<Tier, string> = {
  N1: 'Baixa complexidade — prazo padrão de 4h',
  N2: 'Média complexidade — prazo padrão de 8h',
  N3: 'Alta complexidade — prazo padrão de 24h',
}

const TIER_DESC_COLOR: Record<Tier, string> = {
  N1: 'text-zinc-500',
  N2: 'text-amber-600',
  N3: 'text-red-600',
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

function DeactivateModal({ name, onConfirm, onClose, isPending }: {
  name:      string
  onConfirm: () => void
  onClose:   () => void
  isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">Desativar tipo de problema</h3>
            <p className="text-sm text-zinc-500 mt-1">
              Tem certeza que deseja desativar{' '}
              <span className="font-semibold text-zinc-700">{name}</span>?
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} disabled={isPending} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-50">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Desativando…' : 'Desativar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

type FormMode = 'idle' | 'new' | 'edit'

export default function ProblemTypesPage() {
  const { data: types = [], isLoading } = useProblemTypes()
  const createPT    = useCreateProblemType()
  const deactivatePT = useDeactivateProblemType()

  const [formMode,     setFormMode]     = useState<FormMode>('idle')
  const [editingId,    setEditingId]    = useState<string | null>(null)
  const [formName,     setFormName]     = useState('')
  const [formTier,     setFormTier]     = useState<Tier>('N1')
  const [formDesc,     setFormDesc]     = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ProblemType | null>(null)
  const [toast,        setToast]        = useState({ message: '', visible: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message: msg, visible: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000)
  }

  function openNew() {
    setFormMode('new')
    setEditingId(null)
    setFormName('')
    setFormTier('N1')
    setFormDesc('')
  }

  function openEdit(pt: ProblemType) {
    setFormMode('edit')
    setEditingId(pt.id)
    setFormName(pt.name)
    setFormTier(pt.slaLevel)
    setFormDesc(pt.description ?? '')
  }

  function cancel() {
    setFormMode('idle')
    setEditingId(null)
    setFormName('')
    setFormTier('N1')
    setFormDesc('')
  }

  function save() {
    if (!formName.trim()) return
    if (formMode === 'new') {
      createPT.mutate(
        { name: formName.trim(), description: formDesc.trim() || undefined, slaLevel: formTier },
        { onSuccess: () => { showToast('Tipo de problema criado com sucesso.'); cancel() } }
      )
    }
    // edit not supported yet (no PUT endpoint) — cancel silently
    if (formMode === 'edit') cancel()
  }

  function confirmDeactivate() {
    if (!deleteTarget) return
    deactivatePT.mutate(deleteTarget.id, {
      onSuccess: () => {
        if (editingId === deleteTarget.id) cancel()
        setDeleteTarget(null)
        showToast('Tipo de problema desativado.')
      },
    })
  }

  const activeTypes = types.filter((pt) => pt.active)

  if (isLoading) {
    return (
      <div className="p-8 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">

        {/* ── Left column — table ── */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-zinc-900">Tipos de Problema</h1>
              <span className="text-xs font-semibold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
                {activeTypes.length}
              </span>
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: '#4f6ef7' }}
            >
              <Plus className="w-4 h-4" />
              Novo Tipo
            </button>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Nome</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Nível padrão</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Criado em</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {activeTypes.map((pt) => (
                  <tr
                    key={pt.id}
                    className={cn(
                      'border-b border-zinc-100 last:border-0 transition-colors',
                      editingId === pt.id ? 'bg-[#eef1ff]' : 'hover:bg-zinc-50/60'
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900">{pt.name}</p>
                      {pt.description && (
                        <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-55">{pt.description}</p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', TIER_BADGE[pt.slaLevel])}>
                        {pt.slaLevel}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(pt.createdAt).toLocaleDateString('pt-BR')}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(pt)}
                          className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800 px-2 py-1.5 rounded hover:bg-zinc-100 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </button>

                        <button
                          onClick={() => setDeleteTarget(pt)}
                          className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1.5 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Desativar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right column — form ── */}
        <div>
          {formMode === 'idle' ? (
            <div className="rounded-xl border-2 border-dashed border-zinc-200 p-10 flex flex-col items-center justify-center gap-3 text-center">
              <Tag className="w-10 h-10 text-zinc-300" />
              <p className="text-sm text-zinc-400 max-w-45 leading-relaxed">
                Selecione um tipo para editar ou crie um novo
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-800">
                  {formMode === 'new' ? 'Novo Tipo de Problema' : 'Editar Tipo'}
                </h2>
                <button onClick={cancel} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Nome <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') save() }}
                    placeholder="Ex: Hardware"
                    autoFocus
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Nível SLA padrão
                  </label>
                  <div className="relative">
                    <select
                      value={formTier}
                      onChange={(e) => setFormTier(e.target.value as Tier)}
                      className="w-full appearance-none border border-zinc-200 rounded-lg px-3 py-2 pr-8 text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors"
                    >
                      <option value="N1">N1</option>
                      <option value="N2">N2</option>
                      <option value="N3">N3</option>
                    </select>
                    <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className={cn('text-xs mt-1', TIER_DESC_COLOR[formTier])}>
                    {TIER_DESC[formTier]}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Descrição <span className="text-zinc-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Descreva o tipo de problema..."
                    className="w-full resize-none border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors"
                    style={{ minHeight: 80 }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-zinc-100">
                <button
                  onClick={cancel}
                  className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={save}
                  disabled={!formName.trim() || createPT.isPending}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
                  style={{ background: '#4f6ef7' }}
                >
                  {createPT.isPending ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <DeactivateModal
          name={deleteTarget.name}
          onConfirm={confirmDeactivate}
          onClose={() => setDeleteTarget(null)}
          isPending={deactivatePT.isPending}
        />
      )}

      <Toast {...toast} />
    </div>
  )
}
