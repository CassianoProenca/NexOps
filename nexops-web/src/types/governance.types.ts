// GET /v1/governance/dashboard?from=&to=
// GET /v1/governance/technicians/:id/sla?from=&to=
export interface GovernanceMetrics {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  closedTickets: number
  slaBreachCount: number
  slaCompliancePercent: number
  avgResolutionMinutes: number
  ticketsByProblemType: Record<string, number> // problemTypeId → count
  ticketsByTechnician: Record<string, number>  // technicianId  → count
  periodStart: string
  periodEnd: string
}

// GET /v1/governance/sla/config   → SlaConfig[]
// PUT /v1/governance/sla/config/:id → SlaConfig
export interface SlaConfig {
  id: string
  problemTypeId: string
  slaLevel: 'N1' | 'N2' | 'N3'
  responseMinutes: number
  resolutionMinutes: number
  notifyManagerAtPercent: number
  active: boolean
  createdAt: string
}

/** Corpo do PUT /v1/governance/sla/config/:id */
export interface UpdateSlaConfigRequest {
  responseMinutes: number
  resolutionMinutes: number
  notifyManagerAtPercent: number
}
