import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Ticket, Package, ShieldCheck, TrendingUp, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Pages
import UserHome from './pages/helpdesk/user/Home'
import NewTicket from './pages/helpdesk/user/NewTicket'
import TechTasks from './pages/helpdesk/tech/Tasks'

function Dashboard() {
  const stats = [
    {
      label: 'Chamados Abertos',
      value: '24',
      icon: Ticket,
      color: 'text-brand',
      bg: 'bg-brand-subtle',
      trend: '+12%',
    },
    {
      label: 'Ativos em Inventário',
      value: '312',
      icon: Package,
      color: 'text-success',
      bg: 'bg-green-50',
      trend: '+2',
    },
    {
      label: 'Conformidade SLA',
      value: '98.2%',
      icon: ShieldCheck,
      color: 'text-info',
      bg: 'bg-cyan-50',
      trend: '+0.4%',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
          <span>Home</span>
          <span className="text-border">/</span>
          <span className="text-brand">Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Bem-vindo ao NexOps, Cassiano.
        </h1>
        <p className="text-text-secondary max-w-2xl">
          Aqui está um resumo das operações de TI para a Prefeitura de Votorantim hoje.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group p-6 rounded-xl border bg-surface hover:border-brand/40 transition-all hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className={stat.bg + " p-3 rounded-lg"}>
                <stat.icon className={stat.color + " h-6 w-6"} />
              </div>
              <Badge variant="secondary" className="bg-background text-text-muted font-normal">
                {stat.trend}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-text-muted">
                {stat.label}
              </p>
              <p className="text-3xl font-bold mt-1 tracking-tight text-text-primary">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl border bg-surface space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-brand" />
            Atividade Recente
          </h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg bg-background/50 text-text-muted text-sm italic">
            Gráfico de desempenho será carregado aqui...
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-surface space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-error">
            <Clock className="h-5 w-5" />
            Chamados Críticos
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-background/30 text-sm">
                <div className="h-2 w-2 rounded-full bg-error animate-pulse" />
                <div className="flex-1">
                  <p className="font-medium text-text-primary line-clamp-1 text-xs uppercase tracking-tight">Servidor de Arquivos Offline</p>
                  <p className="text-[10px] text-text-muted font-bold">SLA expira em 15min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/helpdesk/user" element={<UserHome />} />
            <Route path="/helpdesk/new" element={<NewTicket />} />
            <Route path="/helpdesk/tasks" element={<TechTasks />} />
            {/* Outras rotas como placeholders */}
            <Route path="*" element={<div className="flex flex-col items-center justify-center h-full text-text-muted italic">Página em desenvolvimento...</div>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  )
}

export default App
