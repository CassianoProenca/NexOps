import { Navigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'

interface ProtectedRouteProps {
  /** Código de permissão exato (ver INTEGRATION.md §5 — tabela de permissões). */
  permission?: string
  children: React.ReactNode
}

/**
 * Guarda de rota autenticada.
 *
 * 1. Se o usuário não está autenticado → redireciona para /login.
 * 2. Se `permission` foi fornecido e o usuário não a possui → redireciona para /app.
 * 3. Caso contrário → renderiza children.
 */
export function ProtectedRoute({ permission, children }: ProtectedRouteProps) {
  const user = useAppStore((s) => s.user)
  const hasPermission = useAppStore((s) => s.hasPermission)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Se o usuário está pendente, deve forçar a troca de senha (exceto se já estiver indo para lá)
  if (user.status === 'PENDING') {
    return <Navigate to="/primeiro-acesso" replace />
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}
