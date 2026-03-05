import { useState } from 'react'
import {
  LifeBuoy,
  Package,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'

interface NavItem {
  label: string
  icon: React.ReactNode
  href: string
  active?: boolean
}

const navItems: NavItem[] = [
  { label: 'Helpdesk', icon: <LifeBuoy size={20} />, href: '/helpdesk' },
  { label: 'Inventário', icon: <Package size={20} />, href: '/inventory' },
  { label: 'Governança', icon: <ShieldCheck size={20} />, href: '/governance' },
  { label: 'Admin', icon: <Settings size={20} />, href: '/admin' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [activeHref, setActiveHref] = useState('/helpdesk')

  return (
    <aside
      className="flex flex-col h-screen border-r transition-all duration-200"
      style={{
        width: collapsed ? '64px' : '240px',
        backgroundColor: 'var(--sidebar)',
        borderColor: 'var(--sidebar-border)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center h-14 px-4 border-b"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--brand)',
          }}
        >
          <Zap size={18} color="#fff" />
        </div>
        {!collapsed && (
          <span
            className="ml-2.5 font-semibold text-base tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            NexOps
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeHref === item.href
          return (
            <button
              key={item.href}
              onClick={() => setActiveHref(item.href)}
              className="flex items-center w-full rounded-md px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer"
              style={{
                backgroundColor: isActive ? 'var(--brand-subtle)' : 'transparent',
                color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                justifyContent: collapsed ? 'center' : 'flex-start',
              }}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0" style={{ color: isActive ? 'var(--brand)' : 'var(--text-secondary)' }}>
                {item.icon}
              </span>
              {!collapsed && <span className="ml-2.5">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Toggle button */}
      <div
        className="p-2 border-t"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full rounded-md py-1.5 transition-colors cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          title={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}
