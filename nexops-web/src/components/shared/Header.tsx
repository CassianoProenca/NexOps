import { Bell, Search, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface HeaderProps {
  onToggleSidebar: () => void
}

const UNREAD_COUNT = 3

export function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-10 w-full h-16 border-b bg-surface/80 backdrop-blur-sm px-6">
      <div className="flex items-center justify-between h-full gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Global Search */}
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted transition-colors group-focus-within:text-brand" />
            <Input
              placeholder="Pesquisar... (⌘K)"
              className="pl-10 pr-12 h-10 w-full bg-background/50 border-border focus-visible:ring-brand/20 transition-all focus-visible:border-brand"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 text-text-secondary"
                  onClick={() => navigate('/app/notificacoes')}
                >
                  <Bell className="h-5 w-5" />
                  {UNREAD_COUNT > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center rounded-full bg-error border-2 border-surface text-[9px] font-bold text-white leading-none px-0.5">
                      {UNREAD_COUNT}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notificações</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  )
}
