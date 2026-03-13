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
  ticketsByProblemType: Record<string, number> // name → count
  ticketsByTechnician: Record<string, number>  // name  → count
  ticketsBySlaLevel: Record<string, number>    // N1, N2, N3 → count
  timeSeries: TimeSeriesPoint[]
  slaComplianceByProblemType: Record<string, number>
  slaComplianceByTechnician: Record<string, number>
  technicianIds: Record<string, string>        // name → UUID
  periodStart: string
  periodEnd: string
}

export interface TimeSeriesPoint {
  date: string
  tickets: number
  slaCompliance: number
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

// GET /v1/governance/technicians/:id/tickets
export interface TechnicianTicketItem {
  id: string
  title: string
  problemTypeName: string
  slaLevel: 'N1' | 'N2' | 'N3'
  openedAt: string
  closedAt: string | null
  onSla: boolean
}
