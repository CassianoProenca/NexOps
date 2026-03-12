import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 1024)

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev)

  return (
    <div className="flex h-screen bg-background text-text-primary overflow-hidden font-sans selection:bg-brand/10 selection:text-brand">
      {/* Sidebar Component */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div
        className={cn(
          'flex flex-col flex-1 min-w-0 transition-all duration-200 ease-in-out relative',
          'bg-background'
        )}
      >
        {/* Header Component */}
        <Header onToggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div className="animate-in fade-in duration-300">
            {children}
          </div>
        </main>

        {/* Footer Component */}
        <Footer />
      </div>

      {/* Mobile Sidebar Backdrop */}
      {!sidebarCollapsed && (
        <div
          className="lg:hidden absolute inset-0 bg-black/20 backdrop-blur-sm z-20"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}
