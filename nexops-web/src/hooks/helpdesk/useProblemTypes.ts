import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { helpdeskService } from '@/services/helpdesk.service'
import type { ProblemType } from '@/services/helpdesk.service'

export function useProblemTypes() {
  const queryClient = useQueryClient()

  const { data: problemTypes = [], isLoading, error } = useQuery({
    queryKey: ['problem-types'],
    queryFn: () => helpdeskService.getProblemTypes(),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<ProblemType>) => helpdeskService.createProblemType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem-types'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => helpdeskService.deleteProblemType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problem-types'] })
    },
  })

  return {
    problemTypes,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
