import { api } from '@/lib/api'
import type { LoginRequest, RefreshRequest, TokenPairResponse } from '@/types/auth.types'

export const authService = {
  login: (data: LoginRequest): Promise<TokenPairResponse> =>
    api.post('/v1/auth/login', data).then((r) => r.data),

  refresh: (data: RefreshRequest): Promise<TokenPairResponse> =>
    api.post('/v1/auth/refresh', data).then((r) => r.data),

  logout: (data: RefreshRequest): Promise<void> =>
    api.post('/v1/auth/logout', data).then(() => undefined),
}
