import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { helpdeskService } from '@/services/helpdesk.service'
import type { Department } from '@/services/helpdesk.service'

export function useDepartments() {
  const queryClient = useQueryClient()

  const { data: departments = [], isLoading, error } = useQuery({
    queryKey: ['departments'],
    queryFn: () => helpdeskService.getDepartments(),
  })

  const createMutation = useMutation({
    mutationFn: (data: Partial<Department>) => helpdeskService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
      helpdeskService.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => helpdeskService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => helpdeskService.reactivateDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })

  return {
    departments,
    isLoading,
    error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    reactivate: reactivateMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReactivating: reactivateMutation.isPending,
  }
}
