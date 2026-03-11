import { useState, useRef } from 'react'
import { Plus, X, Users, Eye, Pencil, Trash2, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_PERMISSIONS } from '@/types/auth.types'
import type { PermissionCode, Role } from '@/types/auth.types'
import { useRoles } from '@/hooks/auth/useRoles'

// ── Helpers ────────────────────────────────────────────────────────────────────

const ALL_PERM_KEYS = APP_PERMISSIONS.flatMap((g) => g.perms.map((p) => p.key))
const PERM_LABEL: Record<string, string> = Object.fromEntries(
  APP_PERMISSIONS.flatMap((g) => g.perms.map((p) => [p.key, p.label]))
)

// ── Components ─────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
        checked ? 'bg-[#4f6ef7]' : 'bg-zinc-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  )
}

function ViewPermissionsModal({ role, onClose }: { role: Role; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{role.name}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{role.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-4 space-y-4">
          {APP_PERMISSIONS.map(({ group, perms }) => {
            const anyEnabled = perms.some((p) => role.permissions.includes(p.key))
            return (
              <div key={group} className={cn('rounded-lg border p-3', anyEnabled ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-50/40 border-zinc-100 opacity-60')}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{group}</p>
                <div className="space-y-1.5">
                  {perms.map(({ key, label }) => {
                    const active = role.permissions.includes(key)
                    return (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className={cn('text-xs', active ? 'text-zinc-800' : 'text-zinc-400 line-through')}>
                          {label}
                        </span>
                        <span className={cn(
                          'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                          active ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                        )}>
                          {active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div className="border-t px-6 py-3 shrink-0 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

function RoleModal({ initial, onClose, onSave, isSaving }: { initial?: Role | null; onClose: () => void; onSave: (name: string, description: string, permissions: PermissionCode[]) => void; isSaving?: boolean }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [selectedPerms, setSelectedPerms] = useState<PermissionCode[]>(initial?.permissions ?? [])
  const backdropRef = useRef<HTMLDivElement>(null)

  function togglePerm(key: PermissionCode) {
    setSelectedPerms((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim(), description.trim(), selectedPerms)
  }

  return (
    <div ref={backdropRef} onClick={(e) => { if (e.target === backdropRef.current) onClose() }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-base font-semibold text-zinc-900">{initial ? 'Editar Perfil' : 'Novo Perfil'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form id="role-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Nome do perfil <span className="text-red-500">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} placeholder="Ex: Auditor Externo" className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors disabled:bg-zinc-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Descrição <span className="text-zinc-400 font-normal">(opcional)</span></label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isSaving} placeholder="Breve descrição do perfil..." className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors disabled:bg-zinc-50" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-700">Permissões</label>
              <span className="text-[11px] text-zinc-400">{selectedPerms.length} de {ALL_PERM_KEYS.length} ativas</span>
            </div>
            <div className="space-y-3">
              {APP_PERMISSIONS.map(({ group, perms: groupPerms }) => (
                <div key={group} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{group}</p>
                  <div className="space-y-2">
                    {groupPerms.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-zinc-700">{label}</span>
                        <Toggle checked={selectedPerms.includes(key)} onChange={() => togglePerm(key)} disabled={isSaving} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
        <div className="border-t px-6 py-3 flex items-center justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">Cancelar</button>
          <button type="submit" form="role-form" disabled={!name.trim() || isSaving} className="px-4 py-2 text-sm font-medium text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors disabled:opacity-40 flex items-center gap-2">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {initial ? 'Salvar Alterações' : 'Criar Perfil'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RoleCard({ role, onView, onEdit, onDelete }: { role: Role; onView: (r: Role) => void; onEdit?: (r: Role) => void; onDelete?: (r: Role) => void }) {
  const visibleKeys = role.permissions.slice(0, 4)
  const remaining = role.permissions.length - visibleKeys.length
  return (
    <div className="relative flex flex-col gap-4 p-5 rounded-xl border bg-white hover:border-zinc-300 hover:shadow-sm transition-all group">
      <div className="absolute top-4 right-4">
        {role.builtIn ? (
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full">Padrão</span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4f6ef7] bg-[#eef1ff] border border-[#c7d0ff] px-2 py-0.5 rounded-full">Personalizado</span>
        )}
      </div>
      <div className="pr-24">
        <h3 className="font-semibold text-zinc-900 text-sm leading-tight">{role.name}</h3>
        <p className="text-xs text-zinc-400 mt-1">{role.description}</p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Users className="w-3.5 h-3.5 text-zinc-400" />
        <span>{role.userCount === 0 ? 'Nenhum usuário' : `${role.userCount} usuário${role.userCount > 1 ? 's' : ''}`}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {visibleKeys.length === 0 ? (
          <span className="text-[11px] text-zinc-400 italic">Nenhuma permissão ativa</span>
        ) : (
          <>
            {visibleKeys.map((key) => (
              <span key={key} className="text-[11px] bg-zinc-100 text-zinc-600 border border-zinc-200 px-2 py-0.5 rounded-full">{PERM_LABEL[key] || key}</span>
            ))}
            {remaining > 0 && (
              <span className="text-[11px] bg-[#eef1ff] text-[#4f6ef7] border border-[#c7d0ff] px-2 py-0.5 rounded-full font-medium">+{remaining} mais</span>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
        <button onClick={() => onView(role)} className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 px-2 py-1.5 rounded-md hover:bg-zinc-100 transition-colors">
          <Eye className="w-3.5 h-3.5" /> Ver Permissões
        </button>
        {!role.builtIn && onEdit && (
          <button onClick={() => onEdit(role)} className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 px-2 py-1.5 rounded-md hover:bg-zinc-100 transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Editar
          </button>
        )}
        {!role.builtIn && onDelete && (
          <button onClick={() => onDelete(role)} disabled={role.userCount > 0} className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-md transition-all ml-auto text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 disabled:cursor-not-allowed">
            <Trash2 className="w-3.5 h-3.5" /> Excluir
          </button>
        )}
      </div>
    </div>
  )
}

export default function ProfilesPage() {
  const { roles, isLoading, create, update, delete: deleteRole, isSaving } = useRoles()
  const [viewRole, setViewRole] = useState<Role | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [toast, setToast] = useState({ message: '', visible: false })

  function showToast(message: string) {
    setToast({ message, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 3000)
  }

  const builtInProfiles = roles.filter(r => r.builtIn)
  const customProfiles = roles.filter(r => !r.builtIn)

  async function handleSave(name: string, description: string, permissions: PermissionCode[]) {
    try {
      if (editing) {
        await update({ id: editing.id, data: { name, description, permissions } })
        showToast('Perfil atualizado com sucesso.')
      } else {
        await create({ name, description, permissions })
        showToast(`Perfil "${name}" criado com sucesso.`)
      }
      setEditing(null)
      setShowNew(false)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return
    try {
      await deleteRole(deleteId)
      showToast('Perfil excluído.')
      setDeleteId(null)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Perfis de Acesso</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Gerencie os conjuntos de permissões do tenant.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowNew(true) }} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Novo Perfil
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
          <p className="text-sm text-zinc-400">Carregando perfis...</p>
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Perfis padrão</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {builtInProfiles.map((p) => <RoleCard key={p.id} role={p} onView={setViewRole} />)}
            </div>
          </div>

          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
              Perfis personalizados
              <span className="ml-2 text-[10px] font-bold bg-[#eef1ff] text-[#4f6ef7] border border-[#c7d0ff] px-1.5 py-0.5 rounded-full normal-case tracking-normal">{customProfiles.length}</span>
            </h2>
            {customProfiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-zinc-200 rounded-xl text-center">
                <p className="text-sm text-zinc-400 mb-3">Nenhum perfil personalizado criado ainda.</p>
                <button onClick={() => { setEditing(null); setShowNew(true) }} className="flex items-center gap-1.5 text-sm font-medium text-[#4f6ef7] hover:underline"><Plus className="w-4 h-4" /> Criar primeiro perfil</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {customProfiles.map((p) => <RoleCard key={p.id} role={p} onView={setViewRole} onEdit={setEditing} onDelete={(r) => setDeleteId(r.id)} />)}
              </div>
            )}
          </div>
        </>
      )}

      {viewRole && <ViewPermissionsModal role={viewRole} onClose={() => setViewRole(null)} />}
      {(showNew || editing) && <RoleModal initial={editing} onClose={() => { setShowNew(false); setEditing(null) }} onSave={handleSave} isSaving={isSaving} />}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-zinc-900 mb-2">Excluir perfil?</h2>
            <p className="text-sm text-zinc-500 mb-6">O perfil será removido permanentemente. Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">Cancelar</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}
      {toast.visible && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm font-medium shadow-xl"><Check className="w-4 h-4 text-green-400 shrink-0" /> {toast.message}</div>}
    </div>
  )
}
