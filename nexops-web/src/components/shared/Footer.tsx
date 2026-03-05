import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="h-10 border-t bg-surface/50 px-6 flex items-center justify-between text-xs text-text-muted">
      <div className="flex items-center gap-4">
        <span>&copy; {currentYear} NexOps</span>
        <Separator orientation="vertical" className="h-3" />
        <span>v0.1.0-alpha (TCC)</span>
      </div>

      <div className="flex items-center gap-2 font-medium">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
        </span>
        <span className="text-success uppercase tracking-wider">Operacional</span>
      </div>
    </footer>
  )
}
