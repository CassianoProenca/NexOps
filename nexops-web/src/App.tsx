import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Ticket, Package, ShieldCheck, TrendingUp, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Pages — auth
import LoginPage           from '@/pages/auth/LoginPage'
import FirstAccessPage     from '@/pages/auth/FirstAccessPage'
import ForgotPasswordPage  from '@/pages/auth/ForgotPasswordPage'
import ExpiredInvitePage   from '@/pages/auth/ExpiredInvitePage'

// Pages — helpdesk (usuário final)
import HomePage              from '@/pages/helpdesk/user/HomePage'
import MyCasesPage           from '@/pages/helpdesk/user/MyCasesPage'
import NewCasePage           from '@/pages/helpdesk/user/NewCasePage'
import TicketDetailUserPage  from '@/pages/helpdesk/user/TicketDetailUserPage'

// Pages — helpdesk (técnico)
import TechnicianHomePage    from '@/pages/helpdesk/tech/TechnicianHomePage'
import TicketQueuePage       from '@/pages/helpdesk/tech/TicketQueuePage'
import QueuePanelPage        from '@/pages/helpdesk/tech/QueuePanelPage'
import MyTicketsPage         from '@/pages/helpdesk/tech/MyTicketsPage'
import TicketDetailTechPage  from '@/pages/helpdesk/tech/TicketDetailTechPage'

// Pages — transversais
import NotificationsPage        from '@/pages/NotificationsPage'

// Pages — helpdesk (admin/gestor)
import AllTicketsPage           from '@/pages/helpdesk/admin/AllTicketsPage'
import TicketDetailManagerPage  from '@/pages/helpdesk/admin/TicketDetailManagerPage'
import DepartmentsPage          from '@/pages/helpdesk/admin/DepartmentsPage'
import ProblemTypesPage         from '@/pages/helpdesk/admin/ProblemTypesPage'

// Pages — administração
import UsersPage            from '@/pages/admin/UsersPage'
import ProfilesPage         from '@/pages/admin/ProfilesPage'
import TenantSettingsPage   from '@/pages/admin/TenantSettingsPage'
import SmtpPage             from '@/pages/admin/SmtpPage'
import AISettingsPage       from '@/pages/admin/AISettingsPage'

/* ── AppShell: injeta o Layout nas rotas autenticadas ── */
function AppShell() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

/* ── Dashboard (gestor/admin — futuro) ── */
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group p-6 rounded-xl border bg-surface hover:border-brand/40 transition-all hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className={stat.bg + ' p-3 rounded-lg'}>
                <stat.icon className={stat.color + ' h-6 w-6'} />
              </div>
              <Badge variant="secondary" className="bg-background text-text-muted font-normal">
                {stat.trend}
              </Badge>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-text-muted">{stat.label}</p>
              <p className="text-3xl font-bold mt-1 tracking-tight text-text-primary">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

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
                  <p className="font-medium text-text-primary line-clamp-1 text-xs uppercase tracking-tight">
                    Servidor de Arquivos Offline
                  </p>
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

/* ── Placeholder genérico para rotas ainda não implementadas ── */
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-text-muted italic">
      Página em desenvolvimento...
    </div>
  )
}

/* ── App ── */
export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          {/* Redireciona raiz para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rotas públicas — sem Layout */}
          <Route path="/login"            element={<LoginPage />} />
          <Route path="/primeiro-acesso"  element={<FirstAccessPage />} />
          <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
          <Route path="/invite-expired"   element={<ExpiredInvitePage />} />

          {/* Painel TV — sem layout base */}
          <Route path="/app/helpdesk/painel" element={<QueuePanelPage />} />

          {/* Rotas autenticadas — dentro do AppShell (Layout) */}
          <Route path="/app" element={<AppShell />}>

            {/* [ROLE: END_USER] — Home do usuário final */}
            <Route index element={<HomePage />} />

            {/* [ROLE: MANAGER, ADMIN] — Dashboard analítico */}
            <Route path="dashboard"      element={<Dashboard />} />

            {/* [ROLE: ALL] — Notificações */}
            <Route path="notificacoes"   element={<NotificationsPage />} />

            {/* ── Helpdesk ── */}

            {/* [ROLE: END_USER] */}
            <Route path="helpdesk/meus-chamados"   element={<MyCasesPage />} />
            <Route path="helpdesk/novo"             element={<NewCasePage />} />
            <Route path="helpdesk/meu-chamado/:id"  element={<TicketDetailUserPage />} />

            {/* [ROLE: TECHNICIAN] — detail view */}
            <Route path="helpdesk/chamado/:id"      element={<TicketDetailTechPage />} />

            {/* [ROLE: TECHNICIAN] */}
            <Route path="helpdesk/tecnico"        element={<TechnicianHomePage />} />
            <Route path="helpdesk/meus-trabalhos" element={<MyTicketsPage />} />
            <Route path="helpdesk/fila"           element={<TicketQueuePage />} />

            {/* [ROLE: MANAGER, ADMIN] */}
            <Route path="helpdesk/todos"                    element={<AllTicketsPage />} />
            <Route path="helpdesk/chamado-gestor/:id"       element={<TicketDetailManagerPage />} />
            <Route path="helpdesk/departamentos"           element={<DepartmentsPage />} />
            <Route path="helpdesk/tipos-de-problema"       element={<ProblemTypesPage />} />

            {/* ── Inventário ── */}
            {/* [ROLE: MANAGER, ADMIN] */}
            <Route path="inventory"               element={<NotFound />} />

            {/* ── Governança ── */}
            {/* [ROLE: MANAGER, ADMIN] */}
            <Route path="governance"              element={<NotFound />} />

            {/* ── Administração ── */}
            {/* [ROLE: ADMIN] */}
            <Route path="admin/usuarios"          element={<UsersPage />} />
            <Route path="admin/perfis"            element={<ProfilesPage />} />
            <Route path="admin/configuracoes"     element={<TenantSettingsPage />} />
            <Route path="admin/smtp"              element={<SmtpPage />} />
            <Route path="admin/ia"                element={<AISettingsPage />} />

            {/* Fallback interno */}
            <Route path="*"                       element={<NotFound />} />
          </Route>

          {/* Fallback global → login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  )
}
