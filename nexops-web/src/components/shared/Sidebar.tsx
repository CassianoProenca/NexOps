import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Clock,
  Briefcase,
  Users,
  Package,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Building2,
  FileText,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

interface NavSectionProps {
  title: string
  collapsed: boolean
  items: Array<{
    icon: any
    label: string
    href: string
    badge?: string
  }>
}

function NavSection({ title, collapsed, items }: NavSectionProps) {
  const location = useLocation()

  return (
    <div className="space-y-1 px-2">
      {!collapsed && (
        <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-text-muted mt-6 mb-2">
          {title}
        </h3>
      )}
      <div className={cn("space-y-1", collapsed ? "mt-4" : "")}>
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
                      <item.icon className={cn(
                        "w-5 h-5 flex-shrink-0",
                        isActive ? "text-brand" : "text-text-secondary"
                      )} />
                      {!collapsed && (
                        <div className="flex flex-1 items-center justify-between overflow-hidden">
                          <span className="text-sm font-medium truncate">
                            {item.label}
                          </span>
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
                {collapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    </div>
  )
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen border-r bg-sidebar transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo Area */}
      <div className="flex items-center h-16 px-4 border-b">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-sm">
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
        <NavSection
          title="Principal"
          collapsed={collapsed}
          items={[
            { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
          ]}
        />

        <NavSection
          title="Usuário"
          collapsed={collapsed}
          items={[
            { icon: Ticket, label: 'Meus Chamados', href: '/helpdesk/user' },
            { icon: PlusCircle, label: 'Abrir Chamado', href: '/helpdesk/new' },
          ]}
        />

        <NavSection
          title="Técnico"
          collapsed={collapsed}
          items={[
            { icon: Briefcase, label: 'Meus Trabalhos', href: '/helpdesk/tasks', badge: '3' },
            { icon: Clock, label: 'Fila Global', href: '/helpdesk/queue' },
          ]}
        />

        <NavSection
          title="Gestão"
          collapsed={collapsed}
          items={[
            { icon: Users, label: 'Todos Chamados', href: '/helpdesk/all' },
            { icon: Package, label: 'Inventário', href: '/inventory' },
            { icon: ShieldCheck, label: 'Governança', href: '/governance' },
          ]}
        />

        <NavSection
          title="Sistema"
          collapsed={collapsed}
          items={[
            { icon: Building2, label: 'Departamentos', href: '/admin/depts' },
            { icon: FileText, label: 'Tipos de Problema', href: '/admin/types' },
          ]}
        />
      </ScrollArea>

      <div className="p-2 mt-auto border-t space-y-1">
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
                <Settings className="w-5 h-5 flex-shrink-0 text-text-secondary" />
                {!collapsed && (
                  <span className="text-sm font-medium text-text-secondary">Configurações</span>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Configurações</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <Separator className="my-2" />

        <div className={cn(
          "flex items-center gap-3 p-2 rounded-lg",
          collapsed ? "justify-center" : "bg-background/50"
        )}>
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
            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted hover:text-error transition-colors">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Collapse Toggle - Moved inside for better reliability */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute -right-3 top-20 h-6 w-6 rounded-full border bg-white flex items-center justify-center shadow-sm z-20 hover:bg-brand-subtle hover:border-brand transition-all group",
          "hidden lg:flex"
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
