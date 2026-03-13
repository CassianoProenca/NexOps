import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tenantService } from '@/services/tenant.service'


export function useTenantSettings() {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: () => tenantService.getSettings(),
  })

  const updateMutation = useMutation({
    mutationFn: (data: { nomeFantasia: string }) => tenantService.updateSettings(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['tenant-settings'], updated)
    },
  })

  return {
    settings,
    isLoading,
    update: updateMutation.mutateAsync,
    isSaving: updateMutation.isPending,
  }
}

export function useExtraSettings() {
  const queryClient = useQueryClient()

  const { data: extra, isLoading } = useQuery({
    queryKey: ['tenant-extra-settings'],
    queryFn: () => tenantService.getExtraSettings(),
  })

  const updateSmtpMutation = useMutation({
    mutationFn: (data: any) => tenantService.updateSmtp(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['tenant-extra-settings'], updated)
    },
  })

  const updateAiMutation = useMutation({
    mutationFn: (data: { provider: string; apiKey: string; model: string; enabled: boolean }) =>
      tenantService.updateAi(data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['tenant-extra-settings'], updated)
    },
  })

  const testSmtpMutation = useMutation({
    mutationFn: (data: any) => tenantService.testSmtp(data),
  })

  return {
    extra,
    isLoading,
    updateSmtp: updateSmtpMutation.mutateAsync,
    updateAi: (data: { provider: string; apiKey: string; model: string; enabled: boolean }) =>
      updateAiMutation.mutateAsync(data),
    testSmtp: testSmtpMutation.mutateAsync,
    isSavingSmtp: updateSmtpMutation.isPending,
    isSavingAi: updateAiMutation.isPending,
    isTestingSmtp: testSmtpMutation.isPending,
  }
}
