// ─── Requests ────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  senha: string
}

export interface RegisterRequest {
  cnpj: string
  nomeFantasia: string
  email: string
  senha: string
  confirmacaoSenha: string
}

export interface InviteRequest {
  email: string
}

export interface FirstAccessRequest {
  token: string
  nome: string
  email: string
  senha: string
  confirmacaoSenha: string
}

export interface RefreshRequest {
  refreshToken: string
}

// ─── Responses ───────────────────────────────────────────────────────────────

/** POST /v1/auth/login  |  POST /v1/auth/refresh  |  POST /v1/register */
export interface TokenPairResponse {
  accessToken: string
  refreshToken: string
  tokenType: string // always "Bearer"
}

export interface InviteResponse {
  inviteLink: string
}

// ─── JWT Claims (extraídos pelo JwtService do backend) ───────────────────────
// sub         → userId (UUID string)
// nome        → string
// email       → string
// tenantId    → UUID string
// permissions → string[]

// ─── Principal no Zustand ────────────────────────────────────────────────────
export interface AuthenticatedUser {
  userId: string   // UUID como string (claim: sub)
  nome: string
  email: string
  tenantId: string // claim: tenantId
}
