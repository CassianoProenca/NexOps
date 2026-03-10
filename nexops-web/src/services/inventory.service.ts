import { api } from '@/lib/api'
import type {
  AssetResponse,
  AssetMovementResponse,
  RegisterAssetRequest,
  UpdateAssetRequest,
  AssignAssetRequest,
  AssetActionRequest,
  StockItemResponse,
  StockMovementResponse,
  CreateStockItemRequest,
  StockAdjustmentRequest,
} from '@/types/inventory.types'

export const inventoryService = {
  // ── Assets ───────────────────────────────────────────────────────────────

  getAssets: (): Promise<AssetResponse[]> =>
    api.get('/v1/assets').then((r) => r.data),

  getAsset: (id: string): Promise<AssetResponse> =>
    api.get(`/v1/assets/${id}`).then((r) => r.data),

  getAssetMovements: (id: string): Promise<AssetMovementResponse[]> =>
    api.get(`/v1/assets/${id}/movements`).then((r) => r.data),

  registerAsset: (data: RegisterAssetRequest): Promise<AssetResponse> =>
    api.post('/v1/assets', data).then((r) => r.data),

  updateAsset: (id: string, data: UpdateAssetRequest): Promise<AssetResponse> =>
    api.put(`/v1/assets/${id}`, data).then((r) => r.data),

  assignAsset: (id: string, data: AssignAssetRequest): Promise<AssetResponse> =>
    api.post(`/v1/assets/${id}/assign`, data).then((r) => r.data),

  unassignAsset: (id: string): Promise<AssetResponse> =>
    api.post(`/v1/assets/${id}/unassign`).then((r) => r.data),

  sendToMaintenance: (id: string, data: AssetActionRequest): Promise<AssetResponse> =>
    api.post(`/v1/assets/${id}/maintenance`, data).then((r) => r.data),

  discardAsset: (id: string, data: AssetActionRequest): Promise<AssetResponse> =>
    api.post(`/v1/assets/${id}/discard`, data).then((r) => r.data),

  // ── Stock ─────────────────────────────────────────────────────────────────

  getStockItems: (): Promise<StockItemResponse[]> =>
    api.get('/v1/stock').then((r) => r.data),

  getStockAlerts: (): Promise<StockItemResponse[]> =>
    api.get('/v1/stock/alerts').then((r) => r.data),

  getStockItem: (id: string): Promise<StockItemResponse> =>
    api.get(`/v1/stock/${id}`).then((r) => r.data),

  getStockMovements: (id: string): Promise<StockMovementResponse[]> =>
    api.get(`/v1/stock/${id}/movements`).then((r) => r.data),

  createStockItem: (data: CreateStockItemRequest): Promise<StockItemResponse> =>
    api.post('/v1/stock', data).then((r) => r.data),

  addStock: (id: string, data: StockAdjustmentRequest): Promise<StockItemResponse> =>
    api.post(`/v1/stock/${id}/add`, data).then((r) => r.data),

  removeStock: (id: string, data: StockAdjustmentRequest): Promise<StockItemResponse> =>
    api.post(`/v1/stock/${id}/remove`, data).then((r) => r.data),
}
