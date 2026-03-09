import { useState } from 'react'
import {
  LayoutDashboard,
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
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
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

interface NavSectionProps {
  title: string
  collapsed: boolean
  items: NavItem[]
}

function NavSection({ title, collapsed, items }: NavSectionProps) {
  const location = useLocation()

  return (
    <div className="space-y-1">
      {collapsed ? (
        <div className="flex justify-center my-3">
          <div className="w-6 h-px bg-zinc-200" />
        </div>
      ) : (
        <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-text-muted mt-6 mb-2">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {items.map((item) => {
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
        })}
      </div>
    </div>
  )
}

// ── Governance nav subitems ───────────────────────────────────────────────────

const GOVERNANCE_SUBITEMS: NavItem[] = [
  { icon: BarChart2,          label: 'Dashboard',           href: '/app/governance'               },
  { icon: Bell,               label: 'Notificações',        href: '/app/governance/notificacoes'  }, // [ROLE: MANAGER, ADMIN]
  { icon: SlidersHorizontal,  label: 'Configuração de SLA', href: '/app/governance/configuracao'  }, // [ROLE: ADMIN]
]

function GovernanceNavSection({ collapsed }: { collapsed: boolean }) {
  const location = useLocation()
  const [expanded, setExpanded] = useState(
    () => localStorage.getItem('sidebar_governance_expanded') !== 'false'
  )

  const hasActiveChild = GOVERNANCE_SUBITEMS.some((item) => location.pathname === item.href)

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
          {GOVERNANCE_SUBITEMS.map((item) => {
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
          {GOVERNANCE_SUBITEMS.map((item) => {
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

// ── Admin nav subitems ────────────────────────────────────────────────────────

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
      <div className="space-y-1">
        <div className="flex justify-center my-3">
          <div className="w-6 h-px bg-zinc-200" />
        </div>
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
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-text-muted mt-6 mb-2">
        Administração
      </h3>

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

// ─────────────────────────────────────────────────────────────────────────────

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
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
              Votorantim
            </span>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        {/* [ROLE: END_USER] */}
        <NavSection
          title="Usuário Final"
          collapsed={collapsed}
          items={[
            { icon: Home,       label: 'Home',          href: '/app'                          },
            { icon: Ticket,     label: 'Meus Chamados', href: '/app/helpdesk/meus-chamados'   },
            { icon: PlusCircle, label: 'Abrir Chamado', href: '/app/helpdesk/novo'            },
          ]}
        />

        {/* [ROLE: TECHNICIAN] */}
        <NavSection
          title="Técnico"
          collapsed={collapsed}
          items={[
            { icon: LayoutDashboard, label: 'Home',              href: '/app/helpdesk/tecnico'         },
            { icon: Briefcase,       label: 'Meus Trabalhos',    href: '/app/helpdesk/meus-trabalhos', badge: '7' },
            { icon: ListTodo,        label: 'Fila de Chamados',  href: '/app/helpdesk/fila'            },
            { icon: Monitor,         label: 'Painel TV',         href: '/app/helpdesk/painel'          },
          ]}
        />

        {/* [ROLE: MANAGER, ADMIN] */}
        <NavSection
          title="Gestão"
          collapsed={collapsed}
          items={[
            { icon: Users,   label: 'Todos os Chamados', href: '/app/helpdesk/todos' },
            { icon: Package, label: 'Inventário',        href: '/app/inventory'      },
          ]}
        />

        {/* [ROLE: MANAGER, ADMIN] — Governança com subitem de configuração */}
        <GovernanceNavSection collapsed={collapsed} />

        {/* [ROLE: ADMIN] */}
        <AdminNavSection collapsed={collapsed} />
      </ScrollArea>

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
                    <AvatarFallback className="bg-brand text-white text-[10px] font-bold">CP</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-semibold">Cassiano Proença</p>
                  <p className="text-xs opacity-70">Administrador</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="flex items-center gap-3 py-1.5 px-1 rounded-lg bg-background/50">
              <Avatar className="h-8 w-8 border border-white shrink-0">
                <AvatarFallback className="bg-brand text-white text-[10px] font-bold">CP</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-xs font-bold text-text-primary truncate">Cassiano Proença</span>
                <span className="text-[10px] text-text-muted truncate">Administrador</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
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
