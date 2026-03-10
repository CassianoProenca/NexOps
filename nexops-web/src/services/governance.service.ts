import { api } from '@/lib/api'
import type {
  GovernanceMetrics,
  SlaConfig,
  UpdateSlaConfigRequest,
} from '@/types/governance.types'

export const governanceService = {
  getDashboard: (from?: string, to?: string): Promise<GovernanceMetrics> =>
    api.get('/v1/governance/dashboard', { params: { from, to } }).then((r) => r.data),

  getTechnicianMetrics: (
    id: string,
    from?: string,
    to?: string,
  ): Promise<GovernanceMetrics> =>
    api
      .get(`/v1/governance/technicians/${id}/sla`, { params: { from, to } })
      .then((r) => r.data),

  getSlaConfigs: (): Promise<SlaConfig[]> =>
    api.get('/v1/governance/sla/config').then((r) => r.data),

  updateSlaConfig: (id: string, data: UpdateSlaConfigRequest): Promise<SlaConfig> =>
    api.put(`/v1/governance/sla/config/${id}`, data).then((r) => r.data),
}
