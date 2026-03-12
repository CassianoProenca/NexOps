import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'

export function useUsers() {
  const queryClient = useQueryClient()

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => authService.getUsers(),
    refetchInterval: 30000, // Atualiza a cada 30 segundos automaticamente
  })

  const inviteMutation = useMutation({
    mutationFn: (data: { name: string; email: string; roleId: string; password?: string }) =>
      authService.createInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { roleId: string; permissions: string[] } }) =>
      authService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  return {
    users,
    isLoading,
    error,
    invite: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
    update: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}
