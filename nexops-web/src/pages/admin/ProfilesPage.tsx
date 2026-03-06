import { useState, useRef } from 'react'
import { Plus, X, Users, Eye, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Permissions (same groups as UsersPage) ─────────────────────────────────────

const PERMISSION_GROUPS: { group: string; perms: { key: string; label: string }[] }[] = [
  {
    group: 'Helpdesk',
    perms: [
      { key: 'hd_view',    label: 'Visualizar chamados' },
      { key: 'hd_create',  label: 'Criar chamados' },
      { key: 'hd_attend',  label: 'Atender chamados' },
      { key: 'hd_pause',   label: 'Pausar/retomar chamados' },
      { key: 'hd_finish',  label: 'Finalizar chamados' },
    ],
  },
  {
    group: 'Inventário',
    perms: [
      { key: 'inv_view',   label: 'Visualizar inventário' },
      { key: 'inv_create', label: 'Cadastrar ativos' },
      { key: 'inv_edit',   label: 'Editar ativos' },
      { key: 'inv_link',   label: 'Vincular ativos a chamados' },
      { key: 'inv_export', label: 'Exportar inventário' },
    ],
  },
  {
    group: 'Governança',
    perms: [
      { key: 'gov_view',    label: 'Visualizar governança' },
      { key: 'gov_create',  label: 'Criar políticas' },
      { key: 'gov_approve', label: 'Aprovar políticas' },
      { key: 'gov_export',  label: 'Exportar relatórios' },
    ],
  },
  {
    group: 'Administração',
    perms: [
      { key: 'adm_users',    label: 'Gerenciar usuários' },
      { key: 'adm_profiles', label: 'Gerenciar perfis' },
      { key: 'adm_tenant',   label: 'Configurações do tenant' },
      { key: 'adm_smtp',     label: 'Configurar SMTP' },
      { key: 'adm_ai',       label: 'Configurar IA (BYOK)' },
      { key: 'adm_audit',    label: 'Visualizar logs de auditoria' },
      { key: 'adm_integr',   label: 'Gerenciar integrações' },
    ],
  },
]

const ALL_PERM_KEYS = PERMISSION_GROUPS.flatMap((g) => g.perms.map((p) => p.key))
const PERM_LABEL: Record<string, string> = Object.fromEntries(
  PERMISSION_GROUPS.flatMap((g) => g.perms.map((p) => [p.key, p.label]))
)

function allFalse(): Record<string, boolean> {
  return Object.fromEntries(ALL_PERM_KEYS.map((k) => [k, false]))
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface Profile {
  id: string
  name: string
  description: string
  permissions: Record<string, boolean>
  builtIn: boolean
  userCount: number
}

// ── Built-in profiles ──────────────────────────────────────────────────────────

const BUILTIN_PROFILES: Profile[] = [
  {
    id: 'user',
    name: 'Usuário Final',
    description: 'Abre chamados e acompanha os seus',
    userCount: 3,
    builtIn: true,
    permissions: { ...allFalse(), hd_view: true, hd_create: true },
  },
  {
    id: 'tech_support',
    name: 'Técnico de Suporte',
    description: 'Atende chamados da fila de helpdesk',
    userCount: 2,
    builtIn: true,
    permissions: {
      ...allFalse(),
      hd_view: true, hd_create: true, hd_attend: true, hd_pause: true, hd_finish: true,
      inv_link: true,
    },
  },
  {
    id: 'tech_hardware',
    name: 'Técnico de Hardware',
    description: 'Atende fila de hardware e gerencia inventário',
    userCount: 1,
    builtIn: true,
    permissions: {
      ...allFalse(),
      hd_view: true, hd_create: true, hd_attend: true, hd_pause: true, hd_finish: true,
      inv_view: true, inv_create: true, inv_edit: true, inv_link: true, inv_export: true,
    },
  },
  {
    id: 'manager',
    name: 'Gestor',
    description: 'Supervisiona, reatribui e acessa relatórios',
    userCount: 1,
    builtIn: true,
    permissions: {
      ...allFalse(),
      hd_view: true, hd_create: true, hd_attend: true, hd_pause: true, hd_finish: true,
      inv_view: true, inv_create: true, inv_edit: true, inv_link: true, inv_export: true,
      gov_view: true, gov_create: true, gov_approve: true, gov_export: true,
    },
  },
  {
    id: 'admin',
    name: 'Administrador',
    description: 'Acesso total ao sistema e configurações',
    userCount: 1,
    builtIn: true,
    permissions: Object.fromEntries(ALL_PERM_KEYS.map((k) => [k, true])) as Record<string, boolean>,
  },
]

const INITIAL_CUSTOM_PROFILES: Profile[] = [
  {
    id: 'tecnico_externo',
    name: 'Técnico Externo',
    description: 'Acesso limitado para prestadores externos',
    userCount: 0,
    builtIn: false,
    permissions: { ...allFalse(), hd_view: true, inv_view: true },
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function enabledKeys(perms: Record<string, boolean>): string[] {
  return ALL_PERM_KEYS.filter((k) => perms[k])
}

// ── Toggle ─────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        checked ? 'bg-[#4f6ef7]' : 'bg-zinc-200'
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

// ── View Permissions Modal (read-only) ─────────────────────────────────────────

function ViewPermissionsModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{profile.name}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{profile.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 space-y-4">
          {PERMISSION_GROUPS.map(({ group, perms }) => {
            const anyEnabled = perms.some((p) => profile.permissions[p.key])
            return (
              <div key={group} className={cn('rounded-lg border p-3', anyEnabled ? 'bg-zinc-50 border-zinc-100' : 'bg-zinc-50/40 border-zinc-100 opacity-60')}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{group}</p>
                <div className="space-y-1.5">
                  {perms.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className={cn('text-xs', profile.permissions[key] ? 'text-zinc-800' : 'text-zinc-400 line-through')}>
                        {label}
                      </span>
                      <span className={cn(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                        profile.permissions[key]
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                      )}>
                        {profile.permissions[key] ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="border-t px-6 py-3 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Edit / New Profile Modal ───────────────────────────────────────────────────

interface ProfileModalProps {
  initial?: Profile | null
  onClose: () => void
  onSave: (name: string, description: string, permissions: Record<string, boolean>) => void
}

function ProfileModal({ initial, onClose, onSave }: ProfileModalProps) {
  const [name, setName]             = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [perms, setPerms]           = useState<Record<string, boolean>>(
    initial?.permissions ?? allFalse()
  )

  const backdropRef = useRef<HTMLDivElement>(null)

  function togglePerm(key: string) {
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSave(name.trim(), description.trim(), perms)
  }

  const enabledCount = ALL_PERM_KEYS.filter((k) => perms[k]).length

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-base font-semibold text-zinc-900">
            {initial ? 'Editar Perfil' : 'Novo Perfil'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form id="profile-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-4 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Nome do perfil <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Técnico Externo"
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Descrição <span className="text-zinc-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do perfil..."
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-700">Permissões</label>
              <span className="text-[11px] text-zinc-400">
                {enabledCount} de {ALL_PERM_KEYS.length} ativas
              </span>
            </div>

            <div className="space-y-3">
              {PERMISSION_GROUPS.map(({ group, perms: groupPerms }) => (
                <div key={group} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{group}</p>
                  <div className="space-y-2">
                    {groupPerms.map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-zinc-700">{label}</span>
                        <Toggle checked={!!perms[key]} onChange={() => togglePerm(key)} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t px-6 py-3 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="profile-form"
            disabled={!name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Salvar Perfil
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete confirm modal ───────────────────────────────────────────────────────

function DeleteModal({ profile, onClose, onConfirm }: { profile: Profile; onClose: () => void; onConfirm: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-2">Excluir perfil?</h2>
        <p className="text-sm text-zinc-500 mb-6">
          O perfil <span className="font-semibold text-zinc-800">"{profile.name}"</span> será removido permanentemente. Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Toast ──────────────────────────────────────────────────────────────────────

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

// ── Profile card ───────────────────────────────────────────────────────────────

interface ProfileCardProps {
  profile: Profile
  onView: (p: Profile) => void
  onEdit?: (p: Profile) => void
  onDelete?: (p: Profile) => void
}

function ProfileCard({ profile, onView, onEdit, onDelete }: ProfileCardProps) {
  const keys = enabledKeys(profile.permissions)
  const visibleKeys = keys.slice(0, 4)
  const remaining = keys.length - visibleKeys.length
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative flex flex-col gap-4 p-5 rounded-xl border bg-white hover:border-zinc-300 hover:shadow-sm transition-all group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Badge */}
      <div className="absolute top-4 right-4">
        {profile.builtIn ? (
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full">
            Padrão
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4f6ef7] bg-[#eef1ff] border border-[#c7d0ff] px-2 py-0.5 rounded-full">
            Personalizado
          </span>
        )}
      </div>

      {/* Name + description */}
      <div className="pr-24">
        <h3 className="font-semibold text-zinc-900 text-sm leading-tight">{profile.name}</h3>
        <p className="text-xs text-zinc-400 mt-1">{profile.description}</p>
      </div>

      {/* User count */}
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        <Users className="w-3.5 h-3.5 text-zinc-400" />
        <span>{profile.userCount === 0 ? 'Nenhum usuário' : `${profile.userCount} usuário${profile.userCount > 1 ? 's' : ''}`}</span>
      </div>

      {/* Permissions summary */}
      <div className="flex flex-wrap gap-1.5">
        {visibleKeys.length === 0 ? (
          <span className="text-[11px] text-zinc-400 italic">Nenhuma permissão ativa</span>
        ) : (
          <>
            {visibleKeys.map((key) => (
              <span key={key} className="text-[11px] bg-zinc-100 text-zinc-600 border border-zinc-200 px-2 py-0.5 rounded-full">
                {PERM_LABEL[key]}
              </span>
            ))}
            {remaining > 0 && (
              <span className="text-[11px] bg-[#eef1ff] text-[#4f6ef7] border border-[#c7d0ff] px-2 py-0.5 rounded-full font-medium">
                +{remaining} mais
              </span>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
        <button
          onClick={() => onView(profile)}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 px-2 py-1.5 rounded-md hover:bg-zinc-100 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          Ver Permissões
        </button>

        {!profile.builtIn && onEdit && (
          <button
            onClick={() => onEdit(profile)}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 px-2 py-1.5 rounded-md hover:bg-zinc-100 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </button>
        )}

        {!profile.builtIn && onDelete && (
          <button
            onClick={() => onDelete(profile)}
            disabled={profile.userCount > 0}
            title={profile.userCount > 0 ? 'Remova os usuários vinculados antes de excluir' : undefined}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-md transition-all ml-auto',
              hovered && profile.userCount === 0
                ? 'text-red-600 hover:bg-red-50 opacity-100'
                : 'text-zinc-300 opacity-0 group-hover:opacity-100 cursor-not-allowed'
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Excluir
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ProfilesPage() {
  const [customProfiles, setCustomProfiles] = useState<Profile[]>(INITIAL_CUSTOM_PROFILES)
  const [viewProfile, setViewProfile]       = useState<Profile | null>(null)
  const [editProfile, setEditProfile]       = useState<Profile | null | 'new'>('new' as const | null)
  const [deleteProfile, setDeleteProfile]   = useState<Profile | null>(null)
  const [toast, setToast]                   = useState({ message: '', visible: false })
  const toastTimer                          = useRef<ReturnType<typeof setTimeout> | null>(null)

  // reset editProfile initial value properly
  const [showNew, setShowNew] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, visible: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000)
  }

  function handleSave(name: string, description: string, permissions: Record<string, boolean>) {
    if (editing) {
      setCustomProfiles((prev) =>
        prev.map((p) => p.id === editing.id ? { ...p, name, description, permissions } : p)
      )
      setEditing(null)
      showToast('Perfil atualizado com sucesso.')
    } else {
      const newProfile: Profile = {
        id: `custom_${Date.now()}`,
        name,
        description,
        permissions,
        builtIn: false,
        userCount: 0,
      }
      setCustomProfiles((prev) => [...prev, newProfile])
      setShowNew(false)
      showToast(`Perfil "${name}" criado com sucesso.`)
    }
  }

  function handleDelete(profile: Profile) {
    setCustomProfiles((prev) => prev.filter((p) => p.id !== profile.id))
    setDeleteProfile(null)
    showToast(`Perfil "${profile.name}" excluído.`)
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Perfis de Acesso</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Gerencie os conjuntos de permissões do tenant.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowNew(true) }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Perfil
        </button>
      </div>

      {/* Built-in profiles */}
      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Perfis padrão</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {BUILTIN_PROFILES.map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              onView={setViewProfile}
            />
          ))}
        </div>
      </div>

      {/* Custom profiles */}
      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
          Perfis personalizados
          <span className="ml-2 text-[10px] font-bold bg-[#eef1ff] text-[#4f6ef7] border border-[#c7d0ff] px-1.5 py-0.5 rounded-full normal-case tracking-normal">
            {customProfiles.length}
          </span>
        </h2>

        {customProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-zinc-200 rounded-xl text-center">
            <p className="text-sm text-zinc-400 mb-3">Nenhum perfil personalizado criado ainda.</p>
            <button
              onClick={() => { setEditing(null); setShowNew(true) }}
              className="flex items-center gap-1.5 text-sm font-medium text-[#4f6ef7] hover:underline"
            >
              <Plus className="w-4 h-4" />
              Criar primeiro perfil
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {customProfiles.map((p) => (
              <ProfileCard
                key={p.id}
                profile={p}
                onView={setViewProfile}
                onEdit={(profile) => { setEditing(profile); setShowNew(false) }}
                onDelete={setDeleteProfile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {viewProfile && (
        <ViewPermissionsModal profile={viewProfile} onClose={() => setViewProfile(null)} />
      )}

      {(showNew || editing) && (
        <ProfileModal
          initial={editing ?? null}
          onClose={() => { setShowNew(false); setEditing(null) }}
          onSave={handleSave}
        />
      )}

      {deleteProfile && (
        <DeleteModal
          profile={deleteProfile}
          onClose={() => setDeleteProfile(null)}
          onConfirm={() => handleDelete(deleteProfile)}
        />
      )}

      <Toast {...toast} />
    </div>
  )
}
