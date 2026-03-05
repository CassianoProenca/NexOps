import { Menu, Search, Plus, Bell } from 'lucide-react'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-10 flex items-center h-14 px-4 gap-3 border-b"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="flex items-center justify-center rounded-md p-1.5 transition-colors cursor-pointer"
        style={{ color: 'var(--text-secondary)' }}
        title="Alternar sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div
        className="flex items-center flex-1 max-w-sm rounded-md px-3 py-1.5 gap-2 border"
        style={{
          backgroundColor: 'var(--background)',
          borderColor: 'var(--border)',
        }}
      >
        <Search size={16} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-sm"
          style={{
            color: 'var(--text-primary)',
          }}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button
          className="flex items-center justify-center rounded-md p-1.5 transition-colors cursor-pointer relative"
          style={{ color: 'var(--text-secondary)' }}
          title="Notificações"
        >
          <Bell size={20} />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--brand)' }}
          />
        </button>

        {/* Novo Chamado */}
        <button
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor: 'var(--brand)',
            color: '#ffffff',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--brand-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--brand)'
          }}
        >
          <Plus size={16} />
          Novo Chamado
        </button>
      </div>
    </header>
  )
}
