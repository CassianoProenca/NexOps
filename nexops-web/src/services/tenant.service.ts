import { api } from '@/lib/api'

export interface TenantSettings {
  id: string
  cnpj: string
  nomeFantasia: string
  email: string
  status: string
  createdAt: string
}

export interface ExtraSettings {
  tenantId: string
  smtpHost?: string
  smtpPort?: number
  smtpUsername?: string
  smtpFromEmail?: string
  smtpFromName?: string
  smtpUseTls?: boolean
  hasSmtpPassword?: boolean // Indica se já existe senha salva
  aiProvider?: 'OPENAI' | 'GOOGLE' | 'ANTHROPIC'
  aiModel?: string
  aiEnabled?: boolean
  hasAiApiKey?: boolean // Indica se já existe chave salva
  updatedAt: string
}

export interface SmtpUpdateData {
  host: string
  port: number
  username?: string
  password?: string
  fromEmail: string
  fromName: string
  useTls: boolean
}

export const tenantService = {
  getSettings: (): Promise<TenantSettings> =>
    api.get('/v1/tenant/settings').then((r) => r.data),

  updateSettings: (data: { nomeFantasia: string }): Promise<TenantSettings> =>
    api.put('/v1/tenant/settings', data).then((r) => r.data),

  getExtraSettings: (): Promise<ExtraSettings> =>
    api.get('/v1/tenant/settings/extra').then((r) => r.data),

  updateSmtp: (data: SmtpUpdateData): Promise<ExtraSettings> =>
    api.put('/v1/tenant/settings/smtp', data).then((r) => r.data),

  updateAi: (data: { provider: string; apiKey: string; model: string; enabled: boolean }): Promise<ExtraSettings> =>
    api.put('/v1/tenant/settings/ai', data).then((r) => r.data),

  testSmtp: (data: SmtpUpdateData): Promise<{ success: boolean; message: string }> =>
    api.post('/v1/tenant/settings/smtp/test', data).then((r) => r.data),
}
