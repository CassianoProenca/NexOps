import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Tag, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

type Tier = 'N1' | 'N2' | 'N3'

interface ProblemType {
  id:            number
  name:          string
  tier:          Tier
  description:   string
  activeTickets: number
}

// ── Mock data ──────────────────────────────────────────────────────────────────

let nextId = 7

const INITIAL: ProblemType[] = [
  { id: 1, name: 'Hardware',   tier: 'N3', description: 'Problemas físicos em equipamentos e periféricos',     activeTickets: 5 },
  { id: 2, name: 'Software',   tier: 'N2', description: 'Problemas em aplicações, sistemas e atualizações',    activeTickets: 3 },
  { id: 3, name: 'Acessos',    tier: 'N1', description: 'Permissões, autenticação e reset de senha',           activeTickets: 2 },
  { id: 4, name: 'Impressora', tier: 'N2', description: 'Impressoras, scanners e periféricos de impressão',    activeTickets: 4 },
  { id: 5, name: 'Rede',       tier: 'N3', description: 'Conectividade, VPN e infraestrutura de rede',        activeTickets: 1 },
  { id: 6, name: 'E-mail',     tier: 'N1', description: 'Configuração e envio de e-mails institucionais',     activeTickets: 0 },
]

// ── Styles ─────────────────────────────────────────────────────────────────────

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

function DeleteModal({ name, onConfirm, onClose }: {
  name:      string
  onConfirm: () => void
  onClose:   () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900">Excluir tipo de problema</h3>
            <p className="text-sm text-zinc-500 mt-1">
              Tem certeza que deseja excluir{' '}
              <span className="font-semibold text-zinc-700">{name}</span>?
              {' '}Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

type FormMode = 'idle' | 'new' | 'edit'

export default function ProblemTypesPage() {
  const [types,        setTypes]        = useState<ProblemType[]>(INITIAL)
  const [formMode,     setFormMode]     = useState<FormMode>('idle')
  const [editingId,    setEditingId]    = useState<number | null>(null)
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
    setFormTier(pt.tier)
    setFormDesc(pt.description)
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
      const id = nextId++
      setTypes((t) => [...t, { id, name: formName.trim(), tier: formTier, description: formDesc.trim(), activeTickets: 0 }])
      showToast('Tipo de problema criado com sucesso.')
    } else if (formMode === 'edit' && editingId !== null) {
      setTypes((t) => t.map((pt) =>
        pt.id === editingId
          ? { ...pt, name: formName.trim(), tier: formTier, description: formDesc.trim() }
          : pt
      ))
      showToast('Tipo de problema atualizado com sucesso.')
    }
    cancel()
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setTypes((t) => t.filter((pt) => pt.id !== deleteTarget.id))
    if (editingId === deleteTarget.id) cancel()
    setDeleteTarget(null)
    showToast('Tipo de problema excluído.')
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
                {types.length}
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
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Chamados ativos</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {types.map((pt) => (
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
                        <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[220px]">{pt.description}</p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', TIER_BADGE[pt.tier])}>
                        {pt.tier}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {pt.activeTickets > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                          {pt.activeTickets}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
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

                        <div className="relative group">
                          <button
                            disabled={pt.activeTickets > 0}
                            onClick={() => setDeleteTarget(pt)}
                            className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1.5 rounded hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Excluir
                          </button>
                          {pt.activeTickets > 0 && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10 pointer-events-none">
                              <div className="bg-zinc-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                                Existem chamados ativos neste tipo
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                              </div>
                            </div>
                          )}
                        </div>
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
              <p className="text-sm text-zinc-400 max-w-[180px] leading-relaxed">
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
                  disabled={!formName.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
                  style={{ background: '#4f6ef7' }}
                >
                  Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      <Toast {...toast} />
    </div>
  )
}
