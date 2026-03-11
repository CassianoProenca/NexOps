import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode'
import { authService } from '@/services/auth.service'
import { useAppStore } from '@/store/appStore'
import type { LoginRequest, RegisterRequest, AuthenticatedUser } from '@/types/auth.types'

interface JwtPayload {
  sub: string           // userId
  nome: string
  email: string
  tenantId: string      // UUID string
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
      console.log('[useAuth] login success, tokens:', tokens)
      try {
        const decoded = jwtDecode<JwtPayload>(tokens.accessToken)
        console.log('[useAuth] decoded JWT:', decoded)
        const authUser: AuthenticatedUser = {
          userId: decoded.sub,
          nome: decoded.nome,
          email: decoded.email,
          tenantId: decoded.tenantId,
        }
        setAuth(authUser, decoded.tenantId, tokens.accessToken, tokens.refreshToken, decoded.permissions ?? [])
        navigate('/app')
      } catch (e) {
        console.error('[useAuth] error processing login token:', e)
        throw e
      }
    },
  })

  // ── Register ───────────────────────────────────────────────────────────────
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (tokens) => {
      console.log('[useAuth] register success, tokens:', tokens)
      try {
        const decoded = jwtDecode<JwtPayload>(tokens.accessToken)
        console.log('[useAuth] decoded JWT:', decoded)
        const authUser: AuthenticatedUser = {
          userId: decoded.sub,
          nome: decoded.nome,
          email: decoded.email,
          tenantId: decoded.tenantId,
        }
        setAuth(authUser, decoded.tenantId, tokens.accessToken, tokens.refreshToken, decoded.permissions ?? [])
        navigate('/app')
      } catch (e) {
        console.error('[useAuth] error processing register token:', e)
        throw e
      }
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
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  }
}
