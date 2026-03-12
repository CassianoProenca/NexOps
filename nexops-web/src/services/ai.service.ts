import { api } from '@/lib/api'

export interface AnalyzeTicketRequest {
  description: string
  departments: { id: string; name: string }[]
  problemTypes: { id: string; name: string }[]
}

export interface AnalyzeTicketResponse {
  suggestedTitle: string
  suggestedDepartmentId: string | null
  suggestedProblemTypeId: string | null
  solutions: string[]
  nextQuestion: string
}

export const aiService = {
  suggestSolutions: (problem: string): Promise<{ solutions: string[] }> =>
    api.post('/v1/ai/suggest-solutions', { problem }).then((r) => r.data),

  analyzeTicket: (data: AnalyzeTicketRequest): Promise<AnalyzeTicketResponse> =>
    api.post('/v1/ai/analyze-ticket', data).then((r) => r.data),

  technicianSummary: (ticketsSummary: string): Promise<{ summary: string }> =>
    api.post('/v1/ai/technician-summary', { ticketsSummary }).then((r) => r.data),

  generateReport: (period: string, metricsData: string): Promise<{ report: string }> =>
    api.post('/v1/ai/generate-report', { period, metricsData }).then((r) => r.data),
}
