// ─── Requests ────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
  tenantSlug: string
}

export interface RefreshRequest {
  refreshToken: string
}

// ─── Responses ───────────────────────────────────────────────────────────────

/** POST /v1/auth/login  |  POST /v1/auth/refresh */
export interface TokenPairResponse {
  accessToken: string
  refreshToken: string
  tokenType: string // always "Bearer"
}

// ─── JWT Claims (extraídos pelo JwtService do backend) ───────────────────────
// sub         → userId (UUID string)
// email       → string
// tenant      → tenantSlug (string)
// permissions → string[]

// ─── Principal no Zustand ────────────────────────────────────────────────────
/**
 * Shape do usuário autenticado armazenado no store.
 * Derivado das claims do JWT.
 * O campo `name` não está no token — usar e-mail como fallback até que
 * GET /v1/users/me seja implementado no backend.
 */
export interface AuthenticatedUser {
  userId: string    // UUID como string (claim: sub)
  email: string
  tenantSlug: string // claim: tenant
  name?: string
}

// ─── Tenant (super-admin) ─────────────────────────────────────────────────────

export interface CreateTenantRequest {
  name: string
  slug: string      // pattern: ^[a-z0-9-]+$
  plan: string
  maxUsers: number  // mínimo 1
}

export interface TenantResponse {
  id: string
  name: string
  slug: string
  schemaName: string
  status: string
  plan: string
  maxUsers: number
  createdAt: string // ISO 8601
}
