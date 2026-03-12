import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  FlaskConical,
  Home,
  Ticket,
  PlusCircle,
  ListTodo,
  Monitor,
  Briefcase,
  Users,
  Package,
  BarChart2,
  SlidersHorizontal,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Settings,
  Settings2,
  Building2,
  Shield,
  MailCheck,
  Sparkles,
  Tag,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { authService } from '@/services/auth.service'
import {
  useDevPermissions,
  DEV_STORAGE_KEY,
  DEV_PROFILES,
  DEV_PROFILE_LABELS,
  DEV_PROFILE_COLORS,
} from '@/hooks/useDevPermissions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  badge?: string
}

// ── Nav item renderer ─────────────────────────────────────────────────────────

function NavItemButton({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation()
  const isActive = location.pathname === item.href

  return (
    <TooltipProvider key={item.label} delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={item.href}>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 h-10 px-3 transition-all',
                collapsed ? 'px-0 justify-center' : '',
                isActive
                  ? 'bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand'
                  : 'text-text-secondary hover:bg-secondary'
              )}
            >
              <div className="relative shrink-0">
                <item.icon
                  className={cn(
                    'w-5 h-5',
                    isActive ? 'text-brand' : 'text-text-secondary'
                  )}
                />
                {collapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-error border border-sidebar" />
                )}
              </div>
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between overflow-hidden">
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-brand text-white px-1.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Button>
          </Link>
        </TooltipTrigger>
        {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  )
}

function NavGroup({ items, collapsed }: { items: NavItem[]; collapsed: boolean }) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <NavItemButton key={item.href} item={item} collapsed={collapsed} />
      ))}
    </div>
  )
}

function GroupSeparator({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('my-2', collapsed ? 'flex justify-center' : 'mx-3')}>
      <div className={cn('h-px bg-zinc-200', collapsed ? 'w-6' : 'w-full')} />
    </div>
  )
}

// ── Governance nav (expandable) ───────────────────────────────────────────────

function GovernanceNavSection({
  collapsed,
  hasSlaConfig,
}: {
  collapsed: boolean
  hasSlaConfig: boolean
}) {
  const location = useLocation()
  const [expanded, setExpanded] = useState(
    () => localStorage.getItem('sidebar_governance_expanded') !== 'false'
  )

  const subitems: NavItem[] = [
    { icon: BarChart2, label: 'Dashboard', href: '/app/governance' },
    { icon: Bell, label: 'Notificações', href: '/app/governance/notificacoes' },
    ...(hasSlaConfig
      ? [{ icon: SlidersHorizontal, label: 'Configuração de SLA', href: '/app/governance/configuracao' }]
      : []),
  ]

  const hasActiveChild = subitems.some((item) => location.pathname === item.href)

  function toggle() {
    const next = !expanded
    setExpanded(next)
    localStorage.setItem('sidebar_governance_expanded', String(next))
  }

  if (collapsed) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'w-full px-0 justify-center h-10 transition-all',
              hasActiveChild
                ? 'bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand'
                : 'text-text-secondary hover:bg-secondary'
            )}
          >
            <BarChart2 className={cn('w-5 h-5 shrink-0', hasActiveChild ? 'text-brand' : 'text-text-secondary')} />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" sideOffset={8} className="w-52 p-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 pt-1 pb-2">
            Governança
          </p>
          {subitems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link key={item.label} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-2.5 h-9 px-2 text-sm',
                    isActive
                      ? 'bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand'
                      : 'text-text-secondary hover:bg-secondary'
                  )}
                >
                  <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand' : 'text-text-secondary')} />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="space-y-1">
      <button
        onClick={toggle}
        className={cn(
          'w-full flex items-center gap-3 h-10 px-3 rounded-md text-sm font-medium transition-all',
          hasActiveChild
            ? 'text-brand bg-brand/10 hover:bg-brand/15'
            : 'text-text-secondary hover:bg-secondary'
        )}
      >
        <BarChart2 className={cn('w-5 h-5 shrink-0', hasActiveChild ? 'text-brand' : 'text-text-secondary')} />
        <span className="flex-1 text-left truncate">Governança</span>
        <ChevronDown
          className={cn('w-4 h-4 shrink-0 transition-transform duration-200', expanded && 'rotate-180')}
        />
      </button>

      {expanded && (
        <div className="ml-4 pl-3 border-l border-zinc-200 space-y-0.5">
          {subitems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link key={item.label} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 h-9 px-3 transition-all',
                    isActive
                      ? 'bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand'
                      : 'text-text-secondary hover:bg-secondary'
                  )}
                >
                  <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand' : 'text-text-secondary')} />
                  <span className="text-sm font-medium truncate">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Admin nav (expandable) ────────────────────────────────────────────────────

const ADMIN_SUBITEMS: NavItem[] = [
  { icon: Users,     label: 'Usuários',          href: '/app/admin/usuarios'             },
  { icon: Shield,    label: 'Perfis de Acesso',  href: '/app/admin/perfis'               },
  { icon: Building2, label: 'Configurações',     href: '/app/admin/configuracoes'        },
  { icon: MailCheck, label: 'SMTP',              href: '/app/admin/smtp'                 },
  { icon: Sparkles,  label: 'IA (BYOK)',         href: '/app/admin/ia'                   },
  { icon: Building2, label: 'Departamentos',     href: '/app/helpdesk/departamentos'     },
  { icon: Tag,       label: 'Tipos de Problema', href: '/app/helpdesk/tipos-de-problema' },
]

function AdminNavSection({ collapsed }: { collapsed: boolean }) {
  const location = useLocation()
  const [expanded, setExpanded] = useState(
    () => localStorage.getItem('sidebar_admin_expanded') !== 'false'
  )

  const hasActiveChild = ADMIN_SUBITEMS.some((item) => location.pathname === item.href)

  function toggle() {
    const next = !expanded
    setExpanded(next)
    localStorage.setItem('sidebar_admin_expanded', String(next))
  }

  if (collapsed) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'w-full px-0 justify-center h-10 transition-all',
              hasActiveChild
                ? 'bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand'
                : 'text-text-secondary hover:bg-secondary'
            )}
          >
            <Settings2 className={cn('w-5 h-5 shrink-0', hasActiveChild ? 'text-brand' : 'text-text-secondary')} />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="right" align="start" sideOffset={8} className="w-52 p-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 pt-1 pb-2">
            Administração
          </p>
          {ADMIN_SUBITEMS.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link key={item.label} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-2.5 h-9 px-2 text-sm',
                    isActive
                      ? 'bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand'
                      : 'text-text-secondary hover:bg-secondary'
                  )}
                >
                  <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand' : 'text-text-secondary')} />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <div className="space-y-1">
      <button
        onClick={toggle}
        className={cn(
          'w-full flex items-center gap-3 h-10 px-3 rounded-md text-sm font-medium transition-all',
          hasActiveChild
            ? 'text-brand bg-brand/10 hover:bg-brand/15'
            : 'text-text-secondary hover:bg-secondary'
        )}
      >
        <Settings2 className={cn('w-5 h-5 shrink-0', hasActiveChild ? 'text-brand' : 'text-text-secondary')} />
        <span className="flex-1 text-left truncate">Sistema</span>
        <ChevronDown
          className={cn('w-4 h-4 shrink-0 transition-transform duration-200', expanded && 'rotate-180')}
        />
      </button>

      {expanded && (
        <div className="ml-4 pl-3 border-l border-zinc-200 space-y-0.5">
          {ADMIN_SUBITEMS.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link key={item.label} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 h-9 px-3 transition-all',
                    isActive
                      ? 'bg-brand/10 text-brand hover:bg-brand/15 hover:text-brand'
                      : 'text-text-secondary hover:bg-secondary'
                  )}
                >
                  <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand' : 'text-text-secondary')} />
                  <span className="text-sm font-medium truncate">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Dev Preview ───────────────────────────────────────────────────────────────

type DevProfile = keyof typeof DEV_PROFILES

function DevProfileSwitcher({ collapsed }: { collapsed: boolean }) {
  const [profile, setProfile] = useState<DevProfile>(
    () => (localStorage.getItem(DEV_STORAGE_KEY) as DevProfile) ?? 'real'
  )
  const [open, setOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(DEV_STORAGE_KEY, profile)
    window.dispatchEvent(new Event('nexops:dev-profile-change'))
  }, [profile])

  const options = Object.keys(DEV_PROFILES) as DevProfile[]

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                const idx = options.indexOf(profile)
                setProfile(options[(idx + 1) % options.length])
              }}
              className={cn(
                'w-full h-8 flex items-center justify-center rounded-md border border-dashed text-[10px] font-bold transition-colors',
                DEV_PROFILE_COLORS[profile]
              )}
            >
              <FlaskConical className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-xs font-semibold">Preview: {DEV_PROFILE_LABELS[profile]}</p>
            <p className="text-[10px] text-zinc-400">Clique para trocar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="relative mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-dashed text-xs font-semibold transition-colors',
          DEV_PROFILE_COLORS[profile]
        )}
      >
        <FlaskConical className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 text-left truncate">Preview: {DEV_PROFILE_LABELS[profile]}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { setProfile(opt); setOpen(false) }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors hover:bg-zinc-50',
                profile === opt ? 'font-semibold' : 'text-zinc-600'
              )}
            >
              <span className={cn('w-2 h-2 rounded-full shrink-0', profile === opt ? 'bg-current' : 'bg-zinc-300')} />
              {DEV_PROFILE_LABELS[opt]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(nome: string): string {
  const parts = nome.trim().split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getRoleLabel(permissions: string[]): string {
  if (permissions.includes('USER_MANAGE') || permissions.includes('ROLE_MANAGE')) return 'Administrador'
  if (permissions.includes('REPORT_VIEW_ALL')) return 'Gestor'
  if (permissions.includes('TICKET_MANAGE')) return 'Técnico'
  return 'Usuário'
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const realPermissions = useAppStore((s) => s.permissions)
  const clearAuth = useAppStore((s) => s.clearAuth)
  const refreshToken = useAppStore((s) => s.refreshToken)

  const permissions = useDevPermissions(realPermissions)

  const displayName = user?.nome ?? ''
  const initials = displayName ? getInitials(displayName) : '?'
  const roleLabel = getRoleLabel(permissions)

  // ── Permission flags ──────────────────────────────────────────────────────
  // Pode operar chamados (TECH, GESTOR, ADMIN)
  const canManageTickets = permissions.includes('TICKET_MANAGE')
  // Sem TICKET_MANAGE → usuário final
  const isEndUser = !canManageTickets
  // Tem relatórios → GESTOR ou ADMIN
  const hasReports = permissions.includes('REPORT_VIEW_ALL')
  const hasSlaConfig = permissions.includes('SLA_CONFIG')
  // Seção sistema → só ADMIN
  const hasAdminSettings = permissions.includes('USER_MANAGE') || permissions.includes('ROLE_MANAGE')

  // ── Nav groups ────────────────────────────────────────────────────────────
  const endUserItems: NavItem[] = [
    { icon: Home,       label: 'Home',          href: '/app'                        },
    { icon: Ticket,     label: 'Meus Chamados', href: '/app/helpdesk/meus-chamados' },
    { icon: PlusCircle, label: 'Abrir Chamado', href: '/app/helpdesk/novo'          },
  ]

  const techItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Home',             href: '/app'                          },
    { icon: Briefcase,       label: 'Meus Trabalhos',   href: '/app/helpdesk/meus-trabalhos', badge: '7' },
    { icon: ListTodo,        label: 'Fila de Chamados', href: '/app/helpdesk/fila'            },
    { icon: Monitor,         label: 'Painel TV',        href: '/app/helpdesk/painel'          },
    { icon: Ticket,          label: 'Meus Chamados',    href: '/app/helpdesk/meus-chamados'   },
    { icon: PlusCircle,      label: 'Abrir Chamado',    href: '/app/helpdesk/novo'            },
  ]

  // Gestão/visão geral — apenas GESTOR e ADMIN (têm REPORT_VIEW_ALL)
  // Home já aparece no grupo tech; aqui só os itens extras de oversight
  const managerItems: NavItem[] = [
    { icon: Users,   label: 'Todos os Chamados', href: '/app/helpdesk/todos' },
    { icon: Package, label: 'Inventário',        href: '/app/inventory'      },
  ]

  // Build the list of visible groups (each is a ReactNode or null)
  type Group = { key: string; show: boolean; node: React.ReactNode }

  const groups: Group[] = [
    {
      key: 'user',
      show: isEndUser,
      node: <NavGroup items={endUserItems} collapsed={collapsed} />,
    },
    {
      key: 'tech',
      show: canManageTickets,
      node: <NavGroup items={techItems} collapsed={collapsed} />,
    },
    {
      key: 'manager',
      show: hasReports,           // só GESTOR e ADMIN
      node: <NavGroup items={managerItems} collapsed={collapsed} />,
    },
    {
      key: 'governance',
      show: hasReports,
      node: <GovernanceNavSection collapsed={collapsed} hasSlaConfig={hasSlaConfig} />,
    },
    {
      key: 'admin',
      show: hasAdminSettings,
      node: <AdminNavSection collapsed={collapsed} />,
    },
  ]

  const visibleGroups = groups.filter((g) => g.show)

  async function handleLogout() {
    try {
      if (refreshToken) await authService.logout({ refreshToken })
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen border-r border-zinc-200 bg-sidebar transition-all duration-200 ease-in-out shrink-0',
        collapsed ? 'w-14' : 'w-64'
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-16 border-b border-zinc-200',
          collapsed ? 'justify-center' : 'px-3 gap-3'
        )}
      >
        <div className="shrink-0 w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-lg">N</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-base tracking-tight text-text-primary leading-tight">
              NexOps
            </span>
            <span className="text-[10px] text-brand font-medium tracking-wider uppercase leading-tight">
              Sistema
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-3">
        {import.meta.env.DEV && (
          <>
            <DevProfileSwitcher collapsed={collapsed} />
            <GroupSeparator collapsed={collapsed} />
          </>
        )}
        {visibleGroups.map((group, idx) => (
          <div key={group.key}>
            {idx > 0 && <GroupSeparator collapsed={collapsed} />}
            {group.node}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-zinc-200">
        {/* Configurações */}
        <div className={cn('px-2 pt-2', collapsed ? 'flex justify-center' : '')}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'h-10 transition-all text-text-secondary',
                    collapsed ? 'w-10 px-0 justify-center' : 'w-full justify-start gap-3 px-3'
                  )}
                >
                  <Settings className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">Configurações</span>
                  )}
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Configurações</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator className="mx-2 my-1.5 w-auto" />

        {/* User */}
        <div className={cn('px-2 pb-2', collapsed ? 'flex justify-center' : '')}>
          {collapsed ? (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 border border-white cursor-pointer">
                    <AvatarFallback className="bg-brand text-white text-[10px] font-bold">{initials}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-semibold">{displayName}</p>
                  <p className="text-xs opacity-70">{roleLabel}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="flex items-center gap-3 py-1.5 px-1 rounded-lg bg-background/50">
              <Avatar className="h-8 w-8 border border-white shrink-0">
                <AvatarFallback className="bg-brand text-white text-[10px] font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-xs font-bold text-text-primary truncate">{displayName}</span>
                <span className="text-[10px] text-text-muted truncate">{roleLabel}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-text-muted hover:text-error transition-colors shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Toggle collapse */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-white hidden lg:flex items-center justify-center shadow-sm z-20 hover:bg-brand-subtle hover:border-brand transition-all group"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-text-muted group-hover:text-brand" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-text-muted group-hover:text-brand" />
        )}
      </button>
    </aside>
  )
}
