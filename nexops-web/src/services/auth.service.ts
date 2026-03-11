import { api } from '@/lib/api'
import type {
  LoginRequest,
  RegisterRequest,
  InviteRequest,
  InviteResponse,
  FirstAccessRequest,
  RefreshRequest,
  TokenPairResponse,
} from '@/types/auth.types'

export const authService = {
  login: (data: LoginRequest): Promise<TokenPairResponse> =>
    api.post('/v1/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest): Promise<TokenPairResponse> =>
    api.post('/v1/register', data).then((r) => r.data),

  createInvite: (data: InviteRequest): Promise<InviteResponse> =>
    api.post('/v1/users/invite', data).then((r) => r.data),

  firstAccess: (data: FirstAccessRequest): Promise<TokenPairResponse> =>
    api.post('/v1/users/first-access', data).then((r) => r.data),

  refresh: (data: RefreshRequest): Promise<TokenPairResponse> =>
    api.post('/v1/auth/refresh', data).then((r) => r.data),

  logout: (data: RefreshRequest): Promise<void> =>
    api.post('/v1/auth/logout', data).then(() => undefined),

  // ─── Roles ─────────────────────────────────────────────────────────────────

  getRoles: (): Promise<Role[]> =>
    api.get('/v1/roles').then((r) => r.data),

  createRole: (data: Partial<Role>): Promise<Role> =>
    api.post('/v1/roles', data).then((r) => r.data),

  updateRole: (id: string, data: Partial<Role>): Promise<Role> =>
    api.put(`/v1/roles/${id}`, data).then((r) => r.data),

  deleteRole: (id: string): Promise<void> =>
    api.delete(`/v1/roles/${id}`).then(() => undefined),
}
