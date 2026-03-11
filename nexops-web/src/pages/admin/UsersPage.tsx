import { useState, useRef, useEffect } from 'react'
import {
  Search,
  UserPlus,
  MoreHorizontal,
  X,
  ChevronDown,
  Loader2,
  Check,
  Eye,
  EyeOff,
  ShieldAlert,
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
import { APP_PERMISSIONS } from '@/types/auth.types'
import type { PermissionCode, Role } from '@/types/auth.types'
import { useUsers } from '@/hooks/auth/useUsers'
import { useRoles } from '@/hooks/auth/useRoles'
import { useAppStore } from '@/store/appStore'

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  ACTIVE:   'Ativo',
  INACTIVE: 'Inativo',
  PENDING:  'Pendente',
}

function formatLastAccess(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
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

function NativeSelect({
  value,
  onChange,
  options,
  className,
  disabled
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
  disabled?: boolean
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none border border-zinc-200 rounded-lg px-3 py-2 pr-8 text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors disabled:bg-zinc-50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE:   'bg-green-50 text-green-700 border border-green-200',
    INACTIVE: 'bg-zinc-100 text-zinc-500 border border-zinc-200',
    PENDING:  'bg-amber-50 text-amber-700 border border-amber-200',
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold', styles[status] || styles.PENDING)}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        status === 'ACTIVE' ? 'bg-green-500' : status === 'PENDING' ? 'bg-amber-500' : 'bg-zinc-400'
      )} />
      {STATUS_LABEL[status] || status}
    </span>
  )
}

// ── User Edit Sheet ────────────────────────────────────────────────────────────

function UserEditSheet({ 
  user, 
  roles, 
  onClose,
  onSave
}: { 
  user: any; 
  roles: Role[]; 
  onClose: () => void;
  onSave: (userId: string, data: any) => Promise<void>
}) {
  const currentUser = useAppStore(s => s.user)
  const isSelf = currentUser?.userId === user.id
  
  // No seu backend, o usuário pode ter múltiplas roles, mas no UI simplificamos para uma principal
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [perms, setPerms] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Inicializa dados quando abre
  useEffect(() => {
    // Busca a Role ID correspondente ao nome que vem no user.roles (assumindo que o backend mandou nomes)
    // Se o backend mandar IDs em vez de nomes, ajustamos aqui. 
    // Por enquanto, vamos tentar encontrar pelo nome ou pegar a primeira role.
    const userRoleName = user.roles?.[0]
    const roleObj = roles.find(r => r.name === userRoleName)
    setSelectedRoleId(roleObj?.id || '')
    
    // Aqui no futuro o backend deve mandar a lista de PermissionCodes reais do usuário
    setPerms(roleObj?.permissions || [])
  }, [user, roles])

  function handleRoleChange(roleId: string) {
    setSelectedRoleId(roleId)
    const roleObj = roles.find(r => r.id === roleId)
    if (roleObj) {
      setPerms(roleObj.permissions) // Reset para o padrão da nova role
    }
  }

  function togglePerm(key: string) {
    // Trava de segurança: não deixa o admin remover ROLE_MANAGE de si mesmo
    if (isSelf && key === 'ROLE_MANAGE' && perms.includes(key)) {
      alert("Por segurança, você não pode remover sua própria permissão de gerenciar perfis.")
      return
    }
    
    setPerms(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  async function handleInternalSave() {
    setIsSaving(true)
    try {
      // Aqui chamaremos o backend para atualizar o usuário
      // Por enquanto simulamos
      await onSave(user.id, { roleId: selectedRoleId, permissions: perms })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <SheetHeader className="px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: avatarColor(user.name) }}>
            {nameInitials(user.name)}
          </div>
          <div>
            <SheetTitle>{user.name}</SheetTitle>
            <SheetDescription>{user.email}</SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isSelf && (
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Você está editando seu próprio perfil. Algumas permissões críticas estão travadas para evitar que você perca o acesso administrativo.</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Perfil de Acesso (Base)</label>
          <NativeSelect 
            value={selectedRoleId} 
            onChange={handleRoleChange} 
            options={roles.map(r => ({ value: r.id, label: r.name }))}
          />
          <p className="mt-1.5 text-[11px] text-zinc-400">Alterar o perfil base resetará as permissões abaixo para o padrão do cargo.</p>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400">Permissões Específicas</label>
          {APP_PERMISSIONS.map(group => (
            <div key={group.group} className="space-y-2 border-l-2 border-zinc-100 pl-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase">{group.group}</p>
              {group.perms.map(p => (
                <div key={p.key} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-zinc-600">{p.label}</span>
                  <Toggle 
                    checked={perms.includes(p.key)} 
                    onChange={() => togglePerm(p.key)} 
                    disabled={isSelf && (p.key === 'ROLE_MANAGE' || p.key === 'USER_MANAGE')}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <SheetFooter className="p-6 border-t bg-zinc-50/50">
        <SheetClose asChild>
          <button className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors">Cancelar</button>
        </SheetClose>
        <button 
          onClick={handleInternalSave}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors flex items-center gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Salvar Alterações
        </button>
      </SheetFooter>
    </>
  )
}

// ── Invite modal ───────────────────────────────────────────────────────────────

function InviteModal({ onClose, roles }: { onClose: () => void; roles: Role[] }) {
  const { invite, isInviting } = useUsers()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState(roles[0]?.id || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !roleId || !password) return
    
    try {
      await invite({ name, email, roleId, password })
      onClose()
    } catch (error) {
      console.error('Falha ao criar usuário:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-zinc-900">Novo Usuário</h2>
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
              disabled={isInviting}
              placeholder="Ex: João da Silva"
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 transition-colors disabled:bg-zinc-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">E-mail corporativo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isInviting}
              placeholder="usuario@nexops.com.br"
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 transition-colors disabled:bg-zinc-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Perfil de Acesso</label>
            <NativeSelect
              value={roleId}
              onChange={setRoleId}
              disabled={isInviting}
              options={roles.map(r => ({ value: r.id, label: r.name }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Senha Temporária</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isInviting}
                placeholder="Defina uma senha inicial"
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 transition-colors disabled:bg-zinc-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-[#eef1ff] rounded-lg border border-[#c7d0ff]">
            <p className="text-[11px] text-[#4f6ef7]">
              O usuário será criado com status <strong>Pendente</strong>. Ele deverá alterar essa senha no primeiro acesso para ativar a conta.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isInviting}
              className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !email.trim() || !password || isInviting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {isInviting && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { users, isLoading: loadingUsers, update } = useUsers()
  const { roles, isLoading: loadingRoles } = useRoles()
  
  const [search, setSearch]               = useState('')
  const [filterRole, setFilterRole]       = useState('all')
  const [filterStatus, setFilterStatus]   = useState('all')
  const [showInvite, setShowInvite]       = useState(false)
  const [selectedUser, setSelectedUser]   = useState<any | null>(null)
  const [toast, setToast]                 = useState({ message: '', visible: false })

  function showToast(message: string) {
    setToast({ message, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 3000)
  }

  const filtered = users.filter((u: any) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole   = filterRole === 'all' || u.roles?.some((r: string) => r === filterRole) || u.roles?.some((r: any) => r.name === filterRole)
    const matchStatus = filterStatus === 'all' || u.status === filterStatus
    return matchSearch && matchRole && matchStatus
  })

  async function handleUpdateUser(userId: string, data: any) {
    try {
      await update({ id: userId, data })
      showToast("Alterações aplicadas com sucesso.")
    } catch (e) {
      console.error(e)
      showToast("Erro ao atualizar usuário.")
    }
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b shrink-0">
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
          Novo Usuário
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 px-8 py-3 border-b shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30"
          />
        </div>
        <NativeSelect
          value={filterRole}
          onChange={setFilterRole}
          className="w-44"
          options={[
            { value: 'all',   label: 'Todos os perfis' },
            ...roles.map(r => ({ value: r.name, label: r.name }))
          ]}
        />
        <NativeSelect
          value={filterStatus}
          onChange={setFilterStatus}
          className="w-36"
          options={[
            { value: 'all',      label: 'Todos os status' },
            { value: 'ACTIVE',   label: 'Ativos' },
            { value: 'PENDING',  label: 'Pendentes' },
            { value: 'INACTIVE', label: 'Inativos' },
          ]}
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {(loadingUsers || loadingRoles) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            <p className="text-sm text-zinc-400">Carregando usuários...</p>
          </div>
        ) : (
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
              {filtered.map((user: any) => (
                <tr
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="border-b transition-colors hover:bg-zinc-50 group cursor-pointer"
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
                        <p className="font-semibold text-zinc-900">{user.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-zinc-700">{user.roles?.join(', ') || 'Sem perfil'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{formatLastAccess(user.lastLoginAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                      className="p-1.5 rounded-md hover:bg-zinc-200 text-zinc-400 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-sm text-zinc-400 italic">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Sheets & Modals */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          {selectedUser && (
            <UserEditSheet 
              user={selectedUser} 
              roles={roles} 
              onClose={() => setSelectedUser(null)} 
              onSave={handleUpdateUser}
            />
          )}
        </SheetContent>
      </Sheet>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} roles={roles} />}

      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm font-medium shadow-xl">
          <Check className="w-4 h-4 text-green-400 shrink-0" />
          {toast.message}
        </div>
      )}
    </div>
  )
}
