import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import type { Role } from '@/types/auth.types'

export function useRoles() {
  const queryClient = useQueryClient()

  // ── Query ─────────────────────────────────────────────────────────────────
  const { data: roles = [], isLoading, error, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: () => authService.getRoles(),
  })

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: Partial<Role>) => authService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> }) =>
      authService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => authService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    },
  })

  return {
    roles,
    isLoading,
    error,
    refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
