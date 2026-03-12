import { useMutation } from '@tanstack/react-query'
import { aiService } from '@/services/ai.service'

export function useSuggestSolutions() {
  const mutation = useMutation({
    mutationFn: (problem: string) => aiService.suggestSolutions(problem),
  })
  return {
    suggest: mutation.mutate,
    suggestAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    solutions: mutation.data?.solutions ?? null,
    error: mutation.error,
    reset: mutation.reset,
  }
}

export function useTechnicianSummary() {
  const mutation = useMutation({
    mutationFn: (ticketsSummary: string) => aiService.technicianSummary(ticketsSummary),
  })
  return {
    generate: mutation.mutateAsync,
    isLoading: mutation.isPending,
    summary: mutation.data?.summary ?? null,
    error: mutation.error,
    reset: mutation.reset,
  }
}

export function useGenerateReport() {
  const mutation = useMutation({
    mutationFn: ({ period, metricsData }: { period: string; metricsData: string }) =>
      aiService.generateReport(period, metricsData),
  })
  return {
    generate: mutation.mutateAsync,
    isLoading: mutation.isPending,
    report: mutation.data?.report ?? null,
    error: mutation.error,
    reset: mutation.reset,
  }
}
