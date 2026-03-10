import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { helpdeskService } from '@/services/helpdesk.service'
import type { CreateDepartmentRequest } from '@/types/helpdesk.types'

export const deptKeys = {
  all: ['departments'] as const,
}

export function useDepartments() {
  return useQuery({
    queryKey: deptKeys.all,
    queryFn: helpdeskService.getDepartments,
    staleTime: 60_000,
  })
}

export function useCreateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) => helpdeskService.createDepartment(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: deptKeys.all }),
  })
}

export function useDeactivateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => helpdeskService.deactivateDepartment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: deptKeys.all }),
  })
}
