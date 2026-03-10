import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode'
import { authService } from '@/services/auth.service'
import { useAppStore } from '@/store/appStore'
import type { LoginRequest } from '@/types/auth.types'
import type { AuthenticatedUser } from '@/types/auth.types'

interface JwtPayload {
  sub: string           // userId
  email: string
  tenant: string        // tenantSlug
  permissions: string[]
  exp: number
}

export function useAuth() {
  const navigate = useNavigate()
  const { setAuth, clearAuth, accessToken, user } = useAppStore()

  // ── Login ─────────────────────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (tokens) => {
      console.log('[useAuth] onSuccess fired', tokens)
      const decoded = jwtDecode<JwtPayload>(tokens.accessToken)
      console.log('[useAuth] decoded JWT', decoded)
      const authUser: AuthenticatedUser = {
        userId: decoded.sub,
        email: decoded.email,
        tenantSlug: decoded.tenant,
      }
      setAuth(
        authUser,
        decoded.tenant,
        tokens.accessToken,
        tokens.refreshToken,
        decoded.permissions ?? [],
      )
      console.log('[useAuth] setAuth called, navigating to /app')
      navigate('/app')
    },
  })

  // ── Logout ────────────────────────────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: () => {
      const { refreshToken } = useAppStore.getState()
      return authService.logout({ refreshToken: refreshToken ?? '' })
    },
    onSettled: () => {
      clearAuth()
      navigate('/login', { replace: true })
    },
  })

  return {
    user,
    isAuthenticated: !!accessToken && !!user,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
  }
}
