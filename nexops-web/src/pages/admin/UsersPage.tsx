import { useState, useEffect, useRef } from 'react'
import {
  Search,
  UserPlus,
  MoreHorizontal,
  X,
  ChevronDown,
  Copy,
  Send,
  AlertTriangle,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'

// ── Types ──────────────────────────────────────────────────────────────────────

type UserProfile = 'user' | 'tech_support' | 'tech_hardware' | 'manager' | 'admin'
type UserStatus  = 'active' | 'inactive' | 'pending'

interface AppUser {
  id: number
  name: string
  email: string
  profile: UserProfile
  status: UserStatus
  lastAccess: string | null
  permissions: Record<string, boolean>
}

// ── Permissions ────────────────────────────────────────────────────────────────

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

function allFalse(): Record<string, boolean> {
  return Object.fromEntries(ALL_PERM_KEYS.map((k) => [k, false]))
}

const PROFILE_PERMS: Record<UserProfile, Record<string, boolean>> = {
  user: {
    ...allFalse(),
    hd_view: true,
    hd_create: true,
  },
  tech_support: {
    ...allFalse(),
    hd_view: true, hd_create: true, hd_attend: true, hd_pause: true, hd_finish: true,
    inv_link: true,
  },
  tech_hardware: {
    ...allFalse(),
    hd_view: true, hd_create: true, hd_attend: true, hd_pause: true, hd_finish: true,
    inv_view: true, inv_create: true, inv_edit: true, inv_link: true, inv_export: true,
  },
  manager: {
    ...allFalse(),
    hd_view: true, hd_create: true, hd_attend: true, hd_pause: true, hd_finish: true,
    inv_view: true, inv_create: true, inv_edit: true, inv_link: true, inv_export: true,
    gov_view: true, gov_create: true, gov_approve: true, gov_export: true,
  },
  admin: Object.fromEntries(ALL_PERM_KEYS.map((k) => [k, true])) as Record<string, boolean>,
}

function profileToPermissions(profile: UserProfile): Record<string, boolean> {
  return { ...PROFILE_PERMS[profile] }
}

function isCustomized(profile: UserProfile, perms: Record<string, boolean>): boolean {
  const preset = PROFILE_PERMS[profile]
  return ALL_PERM_KEYS.some((k) => preset[k] !== perms[k])
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const SMTP_CONFIGURED = false

const INITIAL_USERS: AppUser[] = [
  {
    id: 1,
    name: 'Cassiano Proença',
    email: 'cassiano@prefvotorantim.sp.gov.br',
    profile: 'admin',
    status: 'active',
    lastAccess: '2026-03-06T09:14:00',
    permissions: profileToPermissions('admin'),
  },
  {
    id: 2,
    name: 'Rafael Oliveira',
    email: 'rafael.oliveira@prefvotorantim.sp.gov.br',
    profile: 'tech_support',
    status: 'active',
    lastAccess: '2026-03-06T08:47:00',
    permissions: profileToPermissions('tech_support'),
  },
  {
    id: 3,
    name: 'Ana Beatriz Santos',
    email: 'ana.santos@prefvotorantim.sp.gov.br',
    profile: 'manager',
    status: 'active',
    lastAccess: '2026-03-05T17:22:00',
    permissions: profileToPermissions('manager'),
  },
  {
    id: 4,
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@prefvotorantim.sp.gov.br',
    profile: 'tech_hardware',
    status: 'active',
    lastAccess: '2026-03-06T07:55:00',
    permissions: profileToPermissions('tech_hardware'),
  },
  {
    id: 5,
    name: 'Marina Costa',
    email: 'marina.costa@prefvotorantim.sp.gov.br',
    profile: 'user',
    status: 'active',
    lastAccess: '2026-03-04T11:30:00',
    // customized: removed hd_create
    permissions: { ...profileToPermissions('user'), hd_create: false },
  },
  {
    id: 6,
    name: 'Thiago Mendes',
    email: 'thiago.mendes@prefvotorantim.sp.gov.br',
    profile: 'tech_support',
    status: 'pending',
    lastAccess: null,
    permissions: profileToPermissions('tech_support'),
  },
  {
    id: 7,
    name: 'Juliana Ramos',
    email: 'juliana.ramos@prefvotorantim.sp.gov.br',
    profile: 'user',
    status: 'pending',
    lastAccess: null,
    permissions: profileToPermissions('user'),
  },
  {
    id: 8,
    name: 'Fernando Alves',
    email: 'fernando.alves@prefvotorantim.sp.gov.br',
    profile: 'user',
    status: 'inactive',
    lastAccess: '2025-11-12T14:00:00',
    permissions: profileToPermissions('user'),
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

const PROFILE_LABEL: Record<UserProfile, string> = {
  user:          'Usuário Final',
  tech_support:  'Técnico de Suporte',
  tech_hardware: 'Técnico de Hardware',
  manager:       'Gestor',
  admin:         'Administrador',
}

const STATUS_LABEL: Record<UserStatus, string> = {
  active:   'Ativo',
  inactive: 'Inativo',
  pending:  'Pendente',
}

function formatLastAccess(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date('2026-03-06T10:00:00')
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}min atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function nameInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const AVATAR_COLORS = [
  '#4f6ef7', '#7c3aed', '#db2777', '#ea580c',
  '#16a34a', '#0891b2', '#9333ea', '#ca8a04',
]

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// ── Toggle switch ──────────────────────────────────────────────────────────────

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

// ── Select component ───────────────────────────────────────────────────────────

interface SelectOption { value: string; label: string }

function NativeSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-zinc-200 rounded-lg px-3 py-2 pr-8 text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
    </div>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: UserStatus }) {
  const styles: Record<UserStatus, string> = {
    active:   'bg-green-50 text-green-700 border border-green-200',
    inactive: 'bg-zinc-100 text-zinc-500 border border-zinc-200',
    pending:  'bg-amber-50 text-amber-700 border border-amber-200',
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold', styles[status])}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        status === 'active' ? 'bg-green-500' : status === 'pending' ? 'bg-amber-500' : 'bg-zinc-400'
      )} />
      {STATUS_LABEL[status]}
    </span>
  )
}

// ── Sheet body content ─────────────────────────────────────────────────────────

interface UserSheetContentProps {
  user: AppUser
  onSave: (updated: AppUser) => void
  onClose: () => void
}

function UserSheetContent({ user, onSave, onClose }: UserSheetContentProps) {
  const [profile, setProfile]   = useState<UserProfile>(user.profile)
  const [perms, setPerms]       = useState<Record<string, boolean>>(user.permissions)
  const [isActive, setIsActive] = useState(user.status === 'active')

  useEffect(() => {
    setProfile(user.profile)
    setPerms(user.permissions)
    setIsActive(user.status === 'active')
  }, [user.id])

  function handleProfileChange(p: UserProfile) {
    setProfile(p)
    setPerms(profileToPermissions(p))
  }

  function togglePerm(key: string) {
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const customized = isCustomized(profile, perms)

  function handleSave() {
    let status: UserStatus = user.status
    if (user.status !== 'pending') {
      status = isActive ? 'active' : 'inactive'
    }
    onSave({ ...user, profile, permissions: perms, status })
    onClose()
  }

  return (
    <>
      {/* Sheet header */}
      <SheetHeader className="flex-row items-center gap-3 border-b px-5 py-4 space-y-0 pr-12">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: avatarColor(user.name) }}
        >
          {nameInitials(user.name)}
        </div>
        <div className="min-w-0">
          <SheetTitle className="text-sm font-semibold text-zinc-900 leading-tight">
            {user.name}
          </SheetTitle>
          <SheetDescription className="text-[11px] text-zinc-400 truncate mt-0">
            {user.email}
          </SheetDescription>
        </div>
      </SheetHeader>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Perfil Base */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
            Perfil Base
          </label>
          <NativeSelect
            value={profile}
            onChange={(v) => handleProfileChange(v as UserProfile)}
            options={[
              { value: 'user',          label: 'Usuário Final' },
              { value: 'tech_support',  label: 'Técnico de Suporte' },
              { value: 'tech_hardware', label: 'Técnico de Hardware' },
              { value: 'manager',       label: 'Gestor' },
              { value: 'admin',         label: 'Administrador' },
            ]}
          />
        </div>

        {/* Permissions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              Permissões
            </label>
            {customized && (
              <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                Personalizado
              </span>
            )}
          </div>

          <div className="space-y-4">
            {PERMISSION_GROUPS.map(({ group, perms: groupPerms }) => (
              <div
                key={group}
                className={cn(
                  'rounded-lg border p-3',
                  customized ? 'bg-amber-50/40 border-amber-100' : 'bg-zinc-50 border-zinc-100'
                )}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">{group}</p>
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

        {/* Status da conta (active/inactive only) */}
        {user.status !== 'pending' && (
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-zinc-800">Conta ativa</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {isActive ? 'Usuário pode acessar o sistema.' : 'Acesso bloqueado.'}
                </p>
              </div>
              <Toggle checked={isActive} onChange={setIsActive} />
            </div>
            {!isActive && (
              <div className="mt-2 flex items-start gap-1.5 text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2.5 py-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p className="text-[11px]">O usuário não conseguirá fazer login enquanto a conta estiver inativa.</p>
              </div>
            )}
          </div>
        )}

        {/* Pending: resend invite */}
        {user.status === 'pending' && (
          <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 space-y-2">
            <p className="text-xs font-semibold text-amber-800">Convite pendente</p>
            <p className="text-[11px] text-amber-700">O usuário ainda não aceitou o convite.</p>
            <div className="flex gap-2 pt-1">
              <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors">
                <Send className="w-3.5 h-3.5" />
                Reenviar Convite
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors">
                <Copy className="w-3.5 h-3.5" />
                Copiar Link
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sheet footer */}
      <SheetFooter className="border-t px-5 py-3 flex-row justify-end gap-2 mt-0">
        <SheetClose asChild>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </SheetClose>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors"
        >
          Salvar Alterações
        </button>
      </SheetFooter>
    </>
  )
}

// ── Invite modal ───────────────────────────────────────────────────────────────

interface InviteModalProps {
  onClose: () => void
  onInvite: (name: string, email: string, profile: UserProfile) => void
}

function InviteModal({ onClose, onInvite }: InviteModalProps) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [profile, setProfile] = useState<UserProfile>('user')

  const backdropRef = useRef<HTMLDivElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    onInvite(name.trim(), email.trim(), profile)
  }

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-zinc-900">Convidar Usuário</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@prefvotorantim.sp.gov.br"
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Perfil</label>
            <NativeSelect
              value={profile}
              onChange={(v) => setProfile(v as UserProfile)}
              options={[
                { value: 'user',          label: 'Usuário Final' },
                { value: 'tech_support',  label: 'Técnico de Suporte' },
                { value: 'tech_hardware', label: 'Técnico de Hardware' },
                { value: 'manager',       label: 'Gestor' },
                { value: 'admin',         label: 'Administrador' },
              ]}
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-[#eef1ff] rounded-lg border border-[#c7d0ff]">
            {SMTP_CONFIGURED ? (
              <p className="text-[11px] text-[#4f6ef7]">
                Um e-mail de convite será enviado para o endereço informado com um link de acesso temporário.
              </p>
            ) : (
              <p className="text-[11px] text-[#4f6ef7]">
                O SMTP não está configurado. Um link de convite será gerado — copie e envie manualmente ao usuário.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !email.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {SMTP_CONFIGURED ? 'Enviar Convite' : 'Gerar Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Toast ──────────────────────────────────────────────────────────────────────

interface ToastState { message: string; visible: boolean }

function Toast({ message, visible }: ToastState) {
  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm font-medium shadow-xl transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      )}
    >
      <Check className="w-4 h-4 text-green-400 shrink-0" />
      {message}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers]                 = useState<AppUser[]>(INITIAL_USERS)
  const [search, setSearch]               = useState('')
  const [filterProfile, setFilterProfile] = useState('all')
  const [filterStatus, setFilterStatus]   = useState('all')
  const [selectedId, setSelectedId]       = useState<number | null>(null)
  const [showInvite, setShowInvite]       = useState(false)
  const [openMenuId, setOpenMenuId]       = useState<number | null>(null)
  const [toast, setToast]                 = useState<ToastState>({ message: '', visible: false })

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, visible: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500)
  }

  const selectedUser = users.find((u) => u.id === selectedId) ?? null

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchProfile = filterProfile === 'all' || u.profile === filterProfile
    const matchStatus  = filterStatus  === 'all' || u.status  === filterStatus
    return matchSearch && matchProfile && matchStatus
  })

  function handleSaveUser(updated: AppUser) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    showToast('Alterações salvas com sucesso.')
  }

  function handleInvite(name: string, email: string, profile: UserProfile) {
    const newUser: AppUser = {
      id: Date.now(),
      name,
      email,
      profile,
      status: 'pending',
      lastAccess: null,
      permissions: profileToPermissions(profile),
    }
    setUsers((prev) => [newUser, ...prev])
    setShowInvite(false)
    showToast(
      SMTP_CONFIGURED
        ? `Convite enviado para ${email}`
        : 'Link de convite gerado — copie e envie manualmente.'
    )
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 104px)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b bg-white shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-zinc-900">Usuários</h1>
          <span className="text-xs font-bold bg-[#eef1ff] text-[#4f6ef7] px-2 py-0.5 rounded-full border border-[#c7d0ff]">
            {users.length}
          </span>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Convidar Usuário
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-8 py-3 border-b bg-white shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors"
          />
        </div>
        <NativeSelect
          value={filterProfile}
          onChange={setFilterProfile}
          className="w-44"
          options={[
            { value: 'all',          label: 'Todos os perfis' },
            { value: 'user',          label: 'Usuário Final' },
            { value: 'tech_support',  label: 'Técnico de Suporte' },
            { value: 'tech_hardware', label: 'Técnico de Hardware' },
            { value: 'manager',       label: 'Gestor' },
            { value: 'admin',         label: 'Administrador' },
          ]}
        />
        <NativeSelect
          value={filterStatus}
          onChange={setFilterStatus}
          className="w-36"
          options={[
            { value: 'all',      label: 'Todos os status' },
            { value: 'active',   label: 'Ativos' },
            { value: 'pending',  label: 'Pendentes' },
            { value: 'inactive', label: 'Inativos' },
          ]}
        />
      </div>

      {/* Table — full width, sempre */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-zinc-50 sticky top-0 z-10">
              <th className="text-left px-8 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Nome</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">E-mail</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Perfil</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Status</th>
              <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">Último acesso</th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const isSelected = user.id === selectedId
              return (
                <tr
                  key={user.id}
                  onClick={() => setSelectedId(isSelected ? null : user.id)}
                  className={cn(
                    'border-b cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-[#eef1ff] border-l-2 border-l-[#4f6ef7]'
                      : 'hover:bg-zinc-50 border-l-2 border-l-transparent'
                  )}
                >
                  <td className="px-8 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: avatarColor(user.name) }}
                      >
                        {nameInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 leading-tight">{user.name}</p>
                        {isCustomized(user.profile, user.permissions) && (
                          <span className="text-[10px] text-amber-600 font-medium">Permissões personalizadas</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-zinc-700">{PROFILE_LABEL[user.profile]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{formatLastAccess(user.lastAccess)}</td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === user.id ? null : user.id)
                        }}
                        className="p-1.5 rounded-md hover:bg-zinc-200 text-zinc-400 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === user.id && (
                        <div
                          className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg border shadow-lg z-20 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => { setSelectedId(user.id); setOpenMenuId(null) }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 text-zinc-700"
                          >
                            Editar permissões
                          </button>
                          {user.status === 'active' && (
                            <button
                              onClick={() => {
                                setUsers((prev) =>
                                  prev.map((u) => u.id === user.id ? { ...u, status: 'inactive' } : u)
                                )
                                setOpenMenuId(null)
                                showToast('Usuário desativado.')
                              }}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 text-red-600"
                            >
                              Desativar conta
                            </button>
                          )}
                          {user.status === 'inactive' && (
                            <button
                              onClick={() => {
                                setUsers((prev) =>
                                  prev.map((u) => u.id === user.id ? { ...u, status: 'active' } : u)
                                )
                                setOpenMenuId(null)
                                showToast('Usuário reativado.')
                              }}
                              className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 text-green-700"
                            >
                              Reativar conta
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-16 text-center text-sm text-zinc-400 italic">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sheet — overlay, abre pela direita */}
      <Sheet
        open={selectedId !== null}
        onOpenChange={(open) => { if (!open) setSelectedId(null) }}
      >
        <SheetContent
          side="right"
          className="w-[420px] sm:w-[420px] p-0 flex flex-col gap-0 overflow-hidden"
        >
          {selectedUser && (
            <UserSheetContent
              key={selectedUser.id}
              user={selectedUser}
              onSave={handleSaveUser}
              onClose={() => setSelectedId(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Invite modal */}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onInvite={handleInvite} />}

      {/* Toast */}
      <Toast {...toast} />

      {/* Close menu on outside click */}
      {openMenuId !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
      )}
    </div>
  )
}
