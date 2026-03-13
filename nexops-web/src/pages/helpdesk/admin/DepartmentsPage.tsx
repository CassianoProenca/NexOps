import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, RotateCcw, Building2, AlertCircle, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDepartments } from '@/hooks/helpdesk/useDepartments'
import type { Department } from '@/services/helpdesk.service'

// ── Toast ───────────────────────────────────────────────────────────────────

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

// ── Confirm Modal ───────────────────────────────────────────────────────────

function ConfirmModal({ title, description, confirmLabel, confirmClass, onConfirm, onClose, isPending }: {
  title: string
  description: React.ReactNode
  confirmLabel: string
  confirmClass: string
  onConfirm: () => void
  onClose: () => void
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
            <h3 className="font-semibold text-zinc-900">{title}</h3>
            <p className="text-sm text-zinc-500 mt-1">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} disabled={isPending} className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={isPending} className={cn('px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-40 flex items-center gap-2', confirmClass)}>
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Department Dialog ───────────────────────────────────────────────────────

function DepartmentDialog({ mode, initial, onSave, onClose, isSaving }: {
  mode: 'new' | 'edit'
  initial: { name: string; description: string }
  onSave: (name: string, description: string) => Promise<void>
  onClose: () => void
  isSaving: boolean
}) {
  const [name, setName] = useState(initial.name)
  const [desc, setDesc] = useState(initial.description)

  async function handleSave() {
    if (!name.trim()) return
    await onSave(name.trim(), desc.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-brand" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-800">
              {mode === 'new' ? 'Novo Departamento' : 'Editar Departamento'}
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              placeholder="Ex: Recursos Humanos"
              autoFocus
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-700">
              Descrição <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Descreva o departamento..."
              rows={3}
              className="w-full resize-none border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1 border-t border-zinc-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-brand-hover transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

type DialogState = { mode: 'new' } | { mode: 'edit'; dept: Department } | null
type ConfirmState = { action: 'deactivate' | 'reactivate'; dept: Department } | null

export default function DepartmentsPage() {
  const { departments, isLoading, create, update, delete: deleteDept, reactivate, isSaving, isDeleting, isReactivating } = useDepartments()

  const [dialog,  setDialog]  = useState<DialogState>(null)
  const [confirm, setConfirm] = useState<ConfirmState>(null)
  const [toast,   setToast]   = useState({ message: '', visible: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message: msg, visible: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000)
  }

  async function handleSave(name: string, description: string) {
    try {
      if (dialog?.mode === 'new') {
        await create({ name, description })
        showToast('Departamento criado com sucesso.')
      } else if (dialog?.mode === 'edit') {
        await update({ id: dialog.dept.id, data: { name, description } })
        showToast('Departamento atualizado com sucesso.')
      }
      setDialog(null)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleConfirm() {
    if (!confirm) return
    try {
      if (confirm.action === 'deactivate') {
        await deleteDept(confirm.dept.id)
        showToast('Departamento desativado.')
      } else {
        await reactivate(confirm.dept.id)
        showToast('Departamento reativado.')
      }
      setConfirm(null)
    } catch (e) {
      console.error(e)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />)}
      </div>
    )
  }

  const active   = departments.filter((d) => d.active)
  const inactive = departments.filter((d) => !d.active)

  const isPending = isDeleting || isReactivating

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-zinc-900">Departamentos</h1>
          <span className="text-xs font-semibold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
            {active.length} ativos
          </span>
          {inactive.length > 0 && (
            <span className="text-xs font-semibold bg-red-50 text-red-400 px-2 py-0.5 rounded-full">
              {inactive.length} inativos
            </span>
          )}
        </div>
        <button
          onClick={() => setDialog({ mode: 'new' })}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-brand-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Departamento
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Criado em</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Editar</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Situação</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr
                key={dept.id}
                className={cn(
                  'border-b border-zinc-100 last:border-0 transition-colors',
                  dept.active ? 'hover:bg-zinc-50/60' : 'bg-zinc-50/50 opacity-70'
                )}
              >
                <td className="px-4 py-3">
                  <p className={cn('font-medium', dept.active ? 'text-zinc-900' : 'text-zinc-400 line-through')}>{dept.name}</p>
                  {dept.description && (
                    <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-72">{dept.description}</p>
                  )}
                </td>

                <td className="px-4 py-3">
                  {dept.active ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      Inativo
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-xs text-zinc-400">
                  {new Date(dept.createdAt).toLocaleDateString('pt-BR')}
                </td>

                {/* Coluna Editar */}
                <td className="px-4 py-3">
                  {dept.active && (
                    <button
                      onClick={() => setDialog({ mode: 'edit', dept })}
                      className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800 px-2 py-1.5 rounded hover:bg-zinc-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                  )}
                </td>

                {/* Coluna Situação (Desativar / Reativar) */}
                <td className="px-4 py-3">
                  {dept.active ? (
                    <button
                      onClick={() => setConfirm({ action: 'deactivate', dept })}
                      className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1.5 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Desativar
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirm({ action: 'reactivate', dept })}
                      className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover px-2 py-1.5 rounded hover:bg-brand-subtle transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reativar
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {departments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-400 italic">
                  Nenhum departamento cadastrado.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* Dialog */}
      {dialog && (
        <DepartmentDialog
          mode={dialog.mode}
          initial={dialog.mode === 'edit' ? { name: dialog.dept.name, description: dialog.dept.description ?? '' } : { name: '', description: '' }}
          onSave={handleSave}
          onClose={() => setDialog(null)}
          isSaving={isSaving}
        />
      )}

      {/* Confirm modal */}
      {confirm && (
        <ConfirmModal
          title={confirm.action === 'deactivate' ? 'Desativar departamento' : 'Reativar departamento'}
          description={
            <>
              Tem certeza que deseja {confirm.action === 'deactivate' ? 'desativar' : 'reativar'}{' '}
              <span className="font-semibold text-zinc-700">{confirm.dept.name}</span>?
            </>
          }
          confirmLabel={confirm.action === 'deactivate' ? 'Desativar' : 'Reativar'}
          confirmClass={confirm.action === 'deactivate' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand hover:bg-brand-hover'}
          onConfirm={handleConfirm}
          onClose={() => setConfirm(null)}
          isPending={isPending}
        />
      )}

      <Toast {...toast} />
    </div>
  )
}
