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
  smtpPassword?: string
  smtpFromEmail?: string
  smtpFromName?: string
  smtpUseTls?: boolean
  aiProvider?: 'OPENAI' | 'GOOGLE' | 'ANTHROPIC'
  aiApiKey?: string
  aiModel?: string
  aiEnabled?: boolean
  updatedAt: string
}

export const tenantService = {
  getSettings: (): Promise<TenantSettings> =>
    api.get('/v1/tenant/settings').then((r) => r.data),

  updateSettings: (data: { nomeFantasia: string }): Promise<TenantSettings> =>
    api.put('/v1/tenant/settings', data).then((r) => r.data),

  getExtraSettings: (): Promise<ExtraSettings> =>
    api.get('/v1/tenant/settings/extra').then((r) => r.data),

  updateSmtp: (data: Partial<ExtraSettings>): Promise<ExtraSettings> =>
    api.put('/v1/tenant/settings/smtp', data).then((r) => r.data),

  updateAi: (data: Partial<ExtraSettings>): Promise<ExtraSettings> =>
    api.put('/v1/tenant/settings/ai', data).then((r) => r.data),
}
