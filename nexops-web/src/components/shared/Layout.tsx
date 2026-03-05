import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  )
}
