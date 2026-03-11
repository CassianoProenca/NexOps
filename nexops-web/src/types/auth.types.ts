// ─── Permissions ──────────────────────────────────────────────────────────────

export type PermissionCode =
  | 'TICKET_CREATE'
  | 'TICKET_MANAGE'
  | 'TICKET_VIEW_ALL'
  | 'REPORT_VIEW_ALL'
  | 'SLA_CONFIG'
  | 'USER_MANAGE'
  | 'ROLE_MANAGE'
  | 'DEPT_MANAGE'
  | 'ASSET_MANAGE'

export interface PermissionGroup {
  group: string
  perms: { key: PermissionCode; label: string }[]
}

export const APP_PERMISSIONS: PermissionGroup[] = [
  {
    group: 'Helpdesk',
    perms: [
      { key: 'TICKET_CREATE',   label: 'Criar chamados' },
      { key: 'TICKET_VIEW_ALL', label: 'Visualizar todos os chamados' },
      { key: 'TICKET_MANAGE',   label: 'Gerenciar/Atender chamados' },
    ],
  },
  {
    group: 'Inventário',
    perms: [
      { key: 'ASSET_MANAGE',    label: 'Gerenciar ativos e estoque' },
    ],
  },
  {
    group: 'Governança',
    perms: [
      { key: 'REPORT_VIEW_ALL', label: 'Visualizar relatórios e dashboards' },
      { key: 'SLA_CONFIG',      label: 'Configurar níveis de serviço (SLA)' },
    ],
  },
  {
    group: 'Administração',
    perms: [
      { key: 'USER_MANAGE',     label: 'Gerenciar usuários e convites' },
      { key: 'ROLE_MANAGE',     label: 'Gerenciar perfis de acesso' },
      { key: 'DEPT_MANAGE',     label: 'Gerenciar departamentos' },
    ],
  },
]

// ─── Roles / Profiles ────────────────────────────────────────────────────────

export type Role = {
  id: string
  name: string
  description: string
  permissions: PermissionCode[]
  builtIn: boolean
  userCount: number
}

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
  roleId: string // Adicionado roleId para o convite
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
