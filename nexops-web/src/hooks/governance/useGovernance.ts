import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { governanceService } from '@/services/governance.service'
import type { UpdateSlaConfigRequest } from '@/types/governance.types'

export const govKeys = {
  dashboard:   (from?: string, to?: string) => ['governance', 'dashboard', from, to] as const,
  technician:  (id: string, from?: string, to?: string) => ['governance', 'tech', id, from, to] as const,
  slaConfig:   () => ['governance', 'sla-config'] as const,
  notifications: () => ['governance', 'notifications'] as const,
}

export function useGovernanceDashboard(from?: string, to?: string) {
  return useQuery({
    queryKey: govKeys.dashboard(from, to),
    queryFn: () => governanceService.getDashboard(from, to),
  })
}

export function useTechnicianMetrics(id: string, from?: string, to?: string) {
  return useQuery({
    queryKey: govKeys.technician(id, from, to),
    queryFn: () => governanceService.getTechnicianMetrics(id, from, to),
    enabled: !!id,
  })
}

export function useSlaConfigs() {
  return useQuery({
    queryKey: govKeys.slaConfig(),
    queryFn: governanceService.getSlaConfigs,
    staleTime: 60_000,
  })
}

export function useUpdateSlaConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSlaConfigRequest }) =>
      governanceService.updateSlaConfig(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: govKeys.slaConfig() }),
  })
}

export function useSlaNotifications() {
  return useQuery({
    queryKey: govKeys.notifications(),
    queryFn: governanceService.getNotifications,
    refetchInterval: 30_000, // auto-refresh every 30s
  })
}

export function useMarkNotificationAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => governanceService.markNotificationAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: govKeys.notifications() }),
  })
}

export function useMarkAllNotificationsAsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => governanceService.markAllNotificationsAsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: govKeys.notifications() }),
  })
}
