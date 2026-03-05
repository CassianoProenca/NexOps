import { CheckCircle } from 'lucide-react'

export function Footer() {
  return (
    <footer
      className="flex items-center justify-between px-4 h-9 border-t text-xs shrink-0"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text-muted)',
      }}
    >
      <span>NexOps v0.1.0</span>

      <div className="flex items-center gap-1.5">
        <CheckCircle size={13} style={{ color: 'var(--success)' }} />
        <span>Todos os sistemas operacionais</span>
      </div>
    </footer>
  )
}
