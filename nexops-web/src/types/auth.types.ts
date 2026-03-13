// ─── Permissions ──────────────────────────────────────────────────────────────

export type PermissionCode =
  // Helpdesk
  | 'TICKET_CREATE'
  | 'TICKET_VIEW_OWN'
  | 'TICKET_VIEW_DEPT'
  | 'TICKET_VIEW_ALL'
  | 'TICKET_ATTEND'
  | 'TICKET_PAUSE'
  | 'TICKET_CLOSE'
  | 'TICKET_MANAGE'
  | 'TICKET_ASSIGN'
  | 'TICKET_RESOLVE'
  | 'TICKET_DELETE'
  | 'DEPT_MANAGE'
  // Inventory
  | 'ASSET_VIEW'
  | 'ASSET_CREATE'
  | 'ASSET_EDIT'
  | 'ASSET_MOVE'
  | 'ASSET_MANAGE'
  // Governance
  | 'REPORT_VIEW_ALL'
  | 'SLA_CONFIG'
  // Admin/IAM
  | 'USER_MANAGE'
  | 'ROLE_MANAGE'
  | 'INVITE_CREATE'
  | 'SETTINGS_VIEW'
  | 'SETTINGS_EDIT'
  | 'AI_CONFIG'

export interface PermissionGroup {
  group: string
  perms: { key: PermissionCode; label: string }[]
}

export const APP_PERMISSIONS: PermissionGroup[] = [
  {
    group: 'Helpdesk',
    perms: [
      { key: 'TICKET_CREATE',   label: 'Abrir Novos Chamados' },
      { key: 'TICKET_VIEW_OWN', label: 'Consultar Meus Chamados' },
      { key: 'TICKET_VIEW_DEPT',label: 'Ver Chamados do Departamento' },
      { key: 'TICKET_VIEW_ALL', label: 'Ver Todos os Chamados (Global)' },
      { key: 'TICKET_ATTEND',   label: 'Atender Chamados da Fila' },
      { key: 'TICKET_PAUSE',    label: 'Pausar e Retomar Chamados' },
      { key: 'TICKET_CLOSE',    label: 'Finalizar Chamados' },
      { key: 'TICKET_MANAGE',   label: 'Interagir e Comentar' },
      { key: 'TICKET_ASSIGN',   label: 'Atribuir Técnicos' },
      { key: 'TICKET_RESOLVE',  label: 'Resolver Chamados' },
      { key: 'TICKET_DELETE',   label: 'Excluir Chamados' },
      { key: 'DEPT_MANAGE',     label: 'Gerenciar Filas e Departamentos' },
    ],
  },
  {
    group: 'Inventário',
    perms: [
      { key: 'ASSET_VIEW',      label: 'Visualizar Ativos' },
      { key: 'ASSET_CREATE',    label: 'Cadastrar Ativos' },
      { key: 'ASSET_EDIT',      label: 'Editar Ativos' },
      { key: 'ASSET_MOVE',      label: 'Movimentar Ativos' },
      { key: 'ASSET_MANAGE',    label: 'Gestão Total de Inventário' },
    ],
  },
  {
    group: 'Governança',
    perms: [
      { key: 'REPORT_VIEW_ALL', label: 'Relatórios e Dashboards' },
      { key: 'SLA_CONFIG',      label: 'Configurar Acordos de Nível de Serviço' },
    ],
  },
  {
    group: 'Administração',
    perms: [
      { key: 'USER_MANAGE',     label: 'Gerenciar Usuários' },
      { key: 'ROLE_MANAGE',     label: 'Gerenciar Perfis de Acesso' },
      { key: 'INVITE_CREATE',   label: 'Enviar Convites' },
      { key: 'SETTINGS_VIEW',   label: 'Ver Configurações da Empresa' },
      { key: 'SETTINGS_EDIT',   label: 'Alterar Configurações e Marca' },
      { key: 'AI_CONFIG',       label: 'Configurar IA (OpenAI/Gemini)' },
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
  name: string
  email: string
  roleId: string
  password?: string
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

export interface TokenPairResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export interface InviteResponse {
  inviteLink: string
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  roles: string[]
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE'
  lastLoginAt: string | null
}

// ─── Principal no Zustand ────────────────────────────────────────────────────
export interface AuthenticatedUser {
  userId: string   // UUID como string (claim: sub)
  nome: string
  email: string
  tenantId: string // claim: tenantId
  status: string   // claim: status (ACTIVE, PENDING, SUSPENDED)
}
