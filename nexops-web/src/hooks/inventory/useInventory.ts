import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryService } from '@/services/inventory.service'
import type {
  RegisterAssetRequest,
  UpdateAssetRequest,
  AssignAssetRequest,
  AssetActionRequest,
  CreateStockItemRequest,
  StockAdjustmentRequest,
} from '@/types/inventory.types'

export const invKeys = {
  assets:         () => ['assets'] as const,
  asset:          (id: string) => ['assets', id] as const,
  assetMovements: (id: string) => ['assets', id, 'movements'] as const,
  stock:          () => ['stock'] as const,
  stockAlerts:    () => ['stock', 'alerts'] as const,
  stockItem:      (id: string) => ['stock', id] as const,
  stockMovements: (id: string) => ['stock', id, 'movements'] as const,
}

// ── Assets ────────────────────────────────────────────────────────────────────

export function useAssets() {
  return useQuery({ queryKey: invKeys.assets(), queryFn: inventoryService.getAssets })
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: invKeys.asset(id),
    queryFn: () => inventoryService.getAsset(id),
    enabled: !!id,
  })
}

export function useAssetMovements(id: string) {
  return useQuery({
    queryKey: invKeys.assetMovements(id),
    queryFn: () => inventoryService.getAssetMovements(id),
    enabled: !!id,
  })
}

export function useRegisterAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RegisterAssetRequest) => inventoryService.registerAsset(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: invKeys.assets() }),
  })
}

export function useUpdateAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetRequest }) =>
      inventoryService.updateAsset(id, data),
    onSuccess: (asset) => {
      qc.invalidateQueries({ queryKey: invKeys.asset(asset.id) })
      qc.invalidateQueries({ queryKey: invKeys.assets() })
    },
  })
}

export function useAssignAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignAssetRequest }) =>
      inventoryService.assignAsset(id, data),
    onSuccess: (asset) => {
      qc.invalidateQueries({ queryKey: invKeys.asset(asset.id) })
      qc.invalidateQueries({ queryKey: invKeys.assetMovements(asset.id) })
    },
  })
}

export function useUnassignAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => inventoryService.unassignAsset(id),
    onSuccess: (asset) => {
      qc.invalidateQueries({ queryKey: invKeys.asset(asset.id) })
      qc.invalidateQueries({ queryKey: invKeys.assetMovements(asset.id) })
    },
  })
}

export function useAssetMaintenance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssetActionRequest }) =>
      inventoryService.sendToMaintenance(id, data),
    onSuccess: (asset) => {
      qc.invalidateQueries({ queryKey: invKeys.asset(asset.id) })
      qc.invalidateQueries({ queryKey: invKeys.assetMovements(asset.id) })
    },
  })
}

export function useDiscardAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssetActionRequest }) =>
      inventoryService.discardAsset(id, data),
    onSuccess: (asset) => {
      qc.invalidateQueries({ queryKey: invKeys.asset(asset.id) })
      qc.invalidateQueries({ queryKey: invKeys.assetMovements(asset.id) })
    },
  })
}

// ── Stock ─────────────────────────────────────────────────────────────────────

export function useStockItems() {
  return useQuery({ queryKey: invKeys.stock(), queryFn: inventoryService.getStockItems })
}

export function useStockAlerts() {
  return useQuery({
    queryKey: invKeys.stockAlerts(),
    queryFn: inventoryService.getStockAlerts,
    staleTime: 60_000,
  })
}

export function useStockItem(id: string) {
  return useQuery({
    queryKey: invKeys.stockItem(id),
    queryFn: () => inventoryService.getStockItem(id),
    enabled: !!id,
  })
}

export function useStockMovements(id: string) {
  return useQuery({
    queryKey: invKeys.stockMovements(id),
    queryFn: () => inventoryService.getStockMovements(id),
    enabled: !!id,
  })
}

export function useCreateStockItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateStockItemRequest) => inventoryService.createStockItem(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: invKeys.stock() }),
  })
}

export function useAddStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StockAdjustmentRequest }) =>
      inventoryService.addStock(id, data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: invKeys.stockItem(item.id) })
      qc.invalidateQueries({ queryKey: invKeys.stock() })
      qc.invalidateQueries({ queryKey: invKeys.stockAlerts() })
    },
  })
}

export function useRemoveStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StockAdjustmentRequest }) =>
      inventoryService.removeStock(id, data),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: invKeys.stockItem(item.id) })
      qc.invalidateQueries({ queryKey: invKeys.stock() })
      qc.invalidateQueries({ queryKey: invKeys.stockAlerts() })
    },
  })
}
