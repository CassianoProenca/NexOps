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
  ShieldCheck,
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
      {!collapsed && (
        <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-text-muted mt-6 mb-2">
          {title}
        </h3>
      )}
      <div className={cn('space-y-1', collapsed ? 'mt-4' : '')}>
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
                      <item.icon
                        className={cn(
                          'w-5 h-5 shrink-0',
                          isActive ? 'text-brand' : 'text-text-secondary'
                        )}
                      />
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

// ── Admin nav subitems ────────────────────────────────────────────────────────

const ADMIN_SUBITEMS: NavItem[] = [
  { icon: Users,     label: 'Usuários',         href: '/app/admin/usuarios'      },
  { icon: Shield,    label: 'Perfis de Acesso', href: '/app/admin/perfis'        },
  { icon: Building2, label: 'Configurações',    href: '/app/admin/configuracoes' },
  { icon: MailCheck, label: 'SMTP',             href: '/app/admin/smtp'          },
  { icon: Sparkles,  label: 'IA (BYOK)',        href: '/app/admin/ia'            },
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

  // Sidebar itself collapsed → show icon only with tooltip
  if (collapsed) {
    return (
      <div className="space-y-1 mt-4">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent side="right">Administração</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-text-muted mt-6 mb-2">
        Administração
      </h3>

      {/* Parent toggle */}
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

      {/* Subitems */}
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
        'relative flex flex-col h-screen border-r border-zinc-200 bg-sidebar transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-3 border-b border-zinc-200">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-text-primary leading-tight">
                NexOps
              </span>
              <span className="text-[10px] text-brand font-medium tracking-wider uppercase leading-tight">
                Votorantim
              </span>
            </div>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* [ROLE: END_USER] — visível apenas para usuários finais */}
        <NavSection
          title="Usuário Final"
          collapsed={collapsed}
          items={[
            { icon: Home, label: 'Home', href: '/app' },
            { icon: Ticket, label: 'Meus Chamados', href: '/app/helpdesk/meus-chamados' },
            { icon: PlusCircle, label: 'Abrir Chamado', href: '/app/helpdesk/novo' },
          ]}
        />

        {/* [ROLE: TECHNICIAN] — visível apenas para técnicos */}
        <NavSection
          title="Técnico"
          collapsed={collapsed}
          items={[
            { icon: LayoutDashboard, label: 'Home', href: '/app/helpdesk/tecnico' },
            { icon: Briefcase, label: 'Meus Trabalhos', href: '/app/helpdesk/meus-trabalhos', badge: '7' },
            { icon: ListTodo, label: 'Fila de Chamados', href: '/app/helpdesk/fila' },
            { icon: Monitor,  label: 'Painel TV',        href: '/app/helpdesk/painel' },
          ]}
        />

        {/* [ROLE: MANAGER, ADMIN] — visível para gestores e admins */}
        <NavSection
          title="Gestão"
          collapsed={collapsed}
          items={[
            { icon: Users, label: 'Todos os Chamados', href: '/app/helpdesk/todos' },
            { icon: Package, label: 'Inventário', href: '/app/inventory' },
            { icon: ShieldCheck, label: 'Governança', href: '/app/governance' },
          ]}
        />

        {/* [ROLE: ADMIN] — visível apenas para admins */}
        <AdminNavSection collapsed={collapsed} />
      </ScrollArea>

      <div className="px-3 py-2 mt-auto border-t border-zinc-200 space-y-1">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-10 px-3',
                  collapsed ? 'px-0 justify-center' : ''
                )}
              >
                <Settings className="w-5 h-5 shrink-0 text-text-secondary" />
                {!collapsed && (
                  <span className="text-sm font-medium text-text-secondary">Configurações</span>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Configurações</TooltipContent>}
          </Tooltip>
        </TooltipProvider>

        <Separator className="my-2" />

        <div
          className={cn(
            'flex items-center gap-3 py-2 rounded-lg',
            collapsed ? 'justify-center' : 'bg-background/50'
          )}
        >
          <Avatar className="h-8 w-8 border border-white">
            <AvatarFallback className="bg-brand text-white text-[10px] font-bold">CP</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-xs font-bold text-text-primary truncate">Cassiano Proença</span>
              <span className="text-[10px] text-text-muted truncate">Administrador</span>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-text-muted hover:text-error transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Toggle collapse */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-20 h-6 w-6 rounded-full border bg-white flex items-center justify-center shadow-sm z-20 hover:bg-brand-subtle hover:border-brand transition-all group',
          'hidden lg:flex'
        )}
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
