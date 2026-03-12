import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { useAppStore } from '@/store/appStore'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useDevPermissions } from '@/hooks/useDevPermissions'

// Pages — auth
import LoginPage           from '@/pages/auth/LoginPage'
import RegisterPage        from '@/pages/auth/RegisterPage'
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

// Pages — governança
import GovernanceDashboardPage    from '@/pages/governance/GovernanceDashboardPage'
import TechnicianSLADetailPage    from '@/pages/governance/TechnicianSLADetailPage'
import SLAConfigPage              from '@/pages/governance/SLAConfigPage'
import SLANotificationsPage       from '@/pages/governance/SLANotificationsPage'

// Pages — inventário
import AssetsPage  from '@/pages/inventory/AssetsPage'
import StockPage   from '@/pages/inventory/StockPage'

// Pages — administração
import AdminHomePage        from '@/pages/admin/AdminHomePage'
import UsersPage            from '@/pages/admin/UsersPage'
import ProfilesPage         from '@/pages/admin/ProfilesPage'
import TenantSettingsPage   from '@/pages/admin/TenantSettingsPage'
import SmtpPage             from '@/pages/admin/SmtpPage'
import AISettingsPage       from '@/pages/admin/AISettingsPage'

/* ── AppShell: injeta o Layout nas rotas autenticadas ── */
function AppShell() {
  return (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  )
}

/* ── AppIndex: renders the correct home based on permissions (no redirect) ── */
function AppIndex() {
  const rawPermissions = useAppStore((s) => s.permissions)
  const permissions = useDevPermissions(rawPermissions)

  if (permissions.includes('USER_MANAGE') || permissions.includes('SETTINGS_EDIT')) {
    return <AdminHomePage />
  }
  if (permissions.includes('REPORT_VIEW_ALL')) {
    return <AdminHomePage />
  }
  if (permissions.includes('TICKET_MANAGE')) {
    return <TechnicianHomePage />
  }
  return <HomePage />
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
          <Route path="/register"         element={<RegisterPage />} />
          <Route path="/primeiro-acesso"  element={<FirstAccessPage />} />
          <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
          <Route path="/invite-expired"   element={<ExpiredInvitePage />} />

          {/* Painel TV — sem layout base */}
          <Route path="/app/helpdesk/painel" element={<QueuePanelPage />} />

          {/* Rotas autenticadas — dentro do AppShell (Layout) */}
          <Route path="/app" element={<AppShell />}>

            {/* Redirect inteligente baseado em permissões */}
            <Route index element={<AppIndex />} />

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
            <Route
              path="helpdesk/todos"
              element={
                <ProtectedRoute permission="TICKET_VIEW_ALL">
                  <AllTicketsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="helpdesk/chamado-gestor/:id"
              element={
                <ProtectedRoute permission="TICKET_VIEW_ALL">
                  <TicketDetailManagerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="helpdesk/departamentos"
              element={
                <ProtectedRoute permission="DEPT_MANAGE">
                  <DepartmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="helpdesk/tipos-de-problema"
              element={
                <ProtectedRoute permission="DEPT_MANAGE">
                  <ProblemTypesPage />
                </ProtectedRoute>
              }
            />

            {/* ── Inventário ── */}
            {/* [ROLE: MANAGER, ADMIN] */}
            <Route path="inventory"               element={<Navigate to="inventory/assets" replace />} />
            <Route
              path="inventory/assets"
              element={
                <ProtectedRoute permission="ASSET_VIEW">
                  <AssetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="inventory/stock"
              element={
                <ProtectedRoute permission="ASSET_VIEW">
                  <StockPage />
                </ProtectedRoute>
              }
            />

            {/* ── Governança ── */}
            {/* [ROLE: MANAGER, ADMIN] */}
            <Route
              path="governance"
              element={
                <ProtectedRoute permission="REPORT_VIEW_ALL">
                  <GovernanceDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="governance/tecnico/:id"
              element={
                <ProtectedRoute permission="REPORT_VIEW_ALL">
                  <TechnicianSLADetailPage />
                </ProtectedRoute>
              }
            />
            {/* [ROLE: MANAGER, ADMIN] */}
            <Route
              path="governance/notificacoes"
              element={
                <ProtectedRoute permission="REPORT_VIEW_ALL">
                  <SLANotificationsPage />
                </ProtectedRoute>
              }
            />
            {/* [ROLE: ADMIN] */}
            <Route
              path="governance/configuracao"
              element={
                <ProtectedRoute permission="SLA_CONFIG">
                  <SLAConfigPage />
                </ProtectedRoute>
              }
            />

            {/* ── Administração ── */}
            {/* [ROLE: ADMIN] */}
            <Route
              path="admin/usuarios"
              element={
                <ProtectedRoute permission="USER_MANAGE">
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/perfis"
              element={
                <ProtectedRoute permission="ROLE_MANAGE">
                  <ProfilesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/configuracoes"
              element={
                <ProtectedRoute permission="SETTINGS_EDIT">
                  <TenantSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/smtp"
              element={
                <ProtectedRoute permission="SETTINGS_EDIT">
                  <SmtpPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/ia"
              element={
                <ProtectedRoute permission="AI_CONFIG">
                  <AISettingsPage />
                </ProtectedRoute>
              }
            />

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
