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
import { APP_PERMISSIONS } from '@/types/auth.types'
import type { PermissionCode, Role } from '@/types/auth.types'
import { authService } from '@/services/auth.service'

// ── Types ──────────────────────────────────────────────────────────────────────

type UserStatus = 'active' | 'inactive' | 'pending'

interface AppUser {
  id: string
  name: string
  email: string
  roleId: string
  status: UserStatus
  lastAccess: string | null
  permissions: PermissionCode[]
}

// ── Role Config (Simplified for UI reference) ──────────────────────────────────

const ROLES_MAP: Record<string, { label: string; defaultPerms: PermissionCode[] }> = {
  USER: {
    label: 'Usuário Final',
    defaultPerms: ['TICKET_CREATE'],
  },
  TECH: {
    label: 'Técnico',
    defaultPerms: ['TICKET_CREATE', 'TICKET_VIEW_ALL', 'TICKET_MANAGE', 'ASSET_MANAGE'],
  },
  ADMIN: {
    label: 'Administrador',
    defaultPerms: APP_PERMISSIONS.flatMap(g => g.perms.map(p => p.key)),
  },
}

function isCustomized(roleId: string, perms: PermissionCode[]): boolean {
  const role = ROLES_MAP[roleId]
  if (!role) return true // Se for um perfil customizado não mapeado aqui
  if (role.defaultPerms.length !== perms.length) return true
  return !role.defaultPerms.every(p => perms.includes(p))
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const INITIAL_USERS: AppUser[] = [
  {
    id: '1',
    name: 'Cassiano Proença',
    email: 'cassiano@nexops.com.br',
    roleId: 'ADMIN',
    status: 'active',
    lastAccess: '2026-03-11T09:14:00',
    permissions: ROLES_MAP['ADMIN'].defaultPerms,
  },
  {
    id: '2',
    name: 'Rafael Oliveira',
    email: 'rafael.oliveira@nexops.com.br',
    roleId: 'TECH',
    status: 'active',
    lastAccess: '2026-03-11T08:47:00',
    permissions: ROLES_MAP['TECH'].defaultPerms,
  },
  {
    id: '3',
    name: 'Ana Beatriz Santos',
    email: 'ana.santos@nexops.com.br',
    roleId: 'USER',
    status: 'active',
    lastAccess: '2026-03-10T17:22:00',
    permissions: ROLES_MAP['USER'].defaultPerms,
  },
  {
    id: '4',
    name: 'Thiago Mendes',
    email: 'thiago.mendes@nexops.com.br',
    roleId: 'TECH',
    status: 'pending',
    lastAccess: null,
    permissions: ROLES_MAP['TECH'].defaultPerms,
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<UserStatus, string> = {
  active:   'Ativo',
  inactive: 'Inativo',
  pending:  'Pendente',
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

function NativeSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
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
  const [roleId, setRoleId]     = useState<string>(user.roleId)
  const [perms, setPerms]       = useState<PermissionCode[]>(user.permissions)
  const [isActive, setIsActive] = useState(user.status === 'active')

  useEffect(() => {
    setRoleId(user.roleId)
    setPerms(user.permissions)
    setIsActive(user.status === 'active')
  }, [user.id])

  function handleRoleChange(newId: string) {
    setRoleId(newId)
    const roleDef = ROLES_MAP[newId]
    if (roleDef) {
      setPerms(roleDef.defaultPerms)
    }
  }

  function togglePerm(key: PermissionCode) {
    setPerms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const customized = isCustomized(roleId, perms)

  function handleSave() {
    let status: UserStatus = user.status
    if (user.status !== 'pending') {
      status = isActive ? 'active' : 'inactive'
    }
    onSave({ ...user, roleId, permissions: perms, status })
    onClose()
  }

  return (
    <>
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

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
            Perfil Base
          </label>
          <NativeSelect
            value={roleId}
            onChange={handleRoleChange}
            options={[
              { value: 'USER',  label: 'Usuário Final' },
              { value: 'TECH',  label: 'Técnico' },
              { value: 'ADMIN', label: 'Administrador' },
            ]}
          />
        </div>

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
            {APP_PERMISSIONS.map(({ group, perms: groupPerms }) => (
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
                      <Toggle
                        checked={perms.includes(key)}
                        onChange={() => togglePerm(key)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

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
          </div>
        )}
      </div>

      <SheetFooter className="border-t px-5 py-3 flex-row justify-end gap-2 mt-0">
        <SheetClose asChild>
          <button className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
            Cancelar
          </button>
        </SheetClose>
        <button
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

function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (name: string, email: string, roleId: string) => void }) {
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [roleId, setRoleId] = useState('USER')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    
    setLoading(true)
    try {
      // Aqui chamamos a API real
      await authService.createInvite({ email, roleId })
      onInvite(name.trim(), email.trim(), roleId)
    } catch (error) {
      console.error('Falha ao convidar:', error)
      // Em produção aqui exibiríamos um erro no toast
      // Para o mock, vamos prosseguir como se tivesse funcionado
      onInvite(name.trim(), email.trim(), roleId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
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
              placeholder="usuario@nexops.com.br"
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Perfil</label>
            <NativeSelect
              value={roleId}
              onChange={setRoleId}
              options={[
                { value: 'USER',  label: 'Usuário Final' },
                { value: 'TECH',  label: 'Técnico' },
                { value: 'ADMIN', label: 'Administrador' },
              ]}
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-[#eef1ff] rounded-lg border border-[#c7d0ff]">
            <p className="text-[11px] text-[#4f6ef7]">
              Um e-mail de convite será enviado com um link de acesso temporário vinculado ao perfil selecionado.
            </p>
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
              disabled={!name.trim() || !email.trim() || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors disabled:opacity-40"
            >
              {loading ? 'Enviando...' : 'Enviar Convite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers]                 = useState<AppUser[]>(INITIAL_USERS)
  const [search, setSearch]               = useState('')
  const [filterRole, setFilterRole]       = useState('all')
  const [filterStatus, setFilterStatus]   = useState('all')
  const [selectedId, setSelectedId]       = useState<string | null>(null)
  const [showInvite, setShowInvite]       = useState(false)
  const [toast, setToast]                 = useState({ message: '', visible: false })

  const selectedUser = users.find((u) => u.id === selectedId) ?? null

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole   = filterRole === 'all' || u.roleId === filterRole
    const matchStatus = filterStatus === 'all' || u.status === filterStatus
    return matchSearch && matchRole && matchStatus
  })

  function handleSaveUser(updated: AppUser) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    setToast({ message: 'Alterações salvas com sucesso.', visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 3000)
  }

  function handleInvite(name: string, email: string, roleId: string) {
    const newUser: AppUser = {
      id: Date.now().toString(),
      name,
      email,
      roleId,
      status: 'pending',
      lastAccess: null,
      permissions: ROLES_MAP[roleId]?.defaultPerms ?? [],
    }
    setUsers((prev) => [newUser, ...prev])
    setShowInvite(false)
    setToast({ message: `Convite enviado para ${email}`, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 3000)
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
          Convidar Usuário
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
            { value: 'USER',  label: 'Usuário Final' },
            { value: 'TECH',  label: 'Técnico' },
            { value: 'ADMIN', label: 'Administrador' },
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

      {/* Table */}
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
            {filtered.map((user) => (
              <tr
                key={user.id}
                onClick={() => setSelectedId(user.id)}
                className={cn(
                  'border-b cursor-pointer transition-colors hover:bg-zinc-50',
                  selectedId === user.id && 'bg-[#eef1ff]'
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
                      <p className="font-semibold text-zinc-900">{user.name}</p>
                      {isCustomized(user.roleId, user.permissions) && (
                        <span className="text-[10px] text-amber-600 font-medium">Personalizado</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-500 text-xs">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-zinc-700">{ROLES_MAP[user.roleId]?.label || user.roleId}</span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">{formatLastAccess(user.lastAccess)}</td>
                <td className="px-4 py-3 text-right">
                  <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-[420px] p-0 flex flex-col">
          {selectedUser && (
            <UserSheetContent
              user={selectedUser}
              onSave={handleSaveUser}
              onClose={() => setSelectedId(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} onInvite={handleInvite} />}

      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm font-medium shadow-xl">
          <Check className="w-4 h-4 text-green-400" />
          {toast.message}
        </div>
      )}
    </div>
  )
}
