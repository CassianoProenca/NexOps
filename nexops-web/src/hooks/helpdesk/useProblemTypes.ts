import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { helpdeskService } from '@/services/helpdesk.service'
import type { CreateProblemTypeRequest } from '@/types/helpdesk.types'

export const ptKeys = {
  all: ['problem-types'] as const,
}

export function useProblemTypes() {
  return useQuery({
    queryKey: ptKeys.all,
    queryFn: helpdeskService.getProblemTypes,
    staleTime: 60_000,
  })
}

export function useCreateProblemType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProblemTypeRequest) => helpdeskService.createProblemType(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ptKeys.all }),
  })
}

export function useDeactivateProblemType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => helpdeskService.deactivateProblemType(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ptKeys.all }),
  })
}
