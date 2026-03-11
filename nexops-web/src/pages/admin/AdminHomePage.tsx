// [ROLE: MANAGER, ADMIN]

import { useNavigate } from 'react-router-dom'
import { Users, Package, BarChart2, ListChecks, ArrowRight, Settings2 } from 'lucide-react'
import { useAppStore } from '@/store/appStore'

const ACCENT = '#2563eb'
const ACCENT_SUBTLE = '#eff6ff'

const QUICK_ACTIONS = [
  {
    icon: ListChecks,
    label: 'Todos os Chamados',
    description: 'Acompanhe e gerencie todos os tickets',
    href: '/app/helpdesk/todos',
  },
  {
    icon: BarChart2,
    label: 'Governança',
    description: 'Dashboard de SLA e desempenho',
    href: '/app/governance',
  },
  {
    icon: Package,
    label: 'Inventário',
    description: 'Ativos e estoque da organização',
    href: '/app/inventory',
  },
  {
    icon: Users,
    label: 'Usuários',
    description: 'Gerencie acessos e perfis',
    href: '/app/admin/usuarios',
  },
  {
    icon: Settings2,
    label: 'Configurações',
    description: 'Departamentos, SMTP e integrações',
    href: '/app/admin/configuracoes',
  },
]

export default function AdminHomePage() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const firstName = user?.nome?.split(' ')[0] ?? 'usuário'

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Bom dia, {firstName}.</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Por onde você quer começar hoje?
        </p>
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.href}
            onClick={() => navigate(action.href)}
            className="flex items-center gap-4 p-5 rounded-xl border border-zinc-200 bg-white text-left hover:border-brand hover:shadow-sm transition-all group"
          >
            <div className="rounded-lg p-3 shrink-0" style={{ background: ACCENT_SUBTLE }}>
              <action.icon className="w-5 h-5" style={{ color: ACCENT }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-zinc-900 text-sm">{action.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">{action.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-brand transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
