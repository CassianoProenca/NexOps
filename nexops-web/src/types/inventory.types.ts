// ─── Enums ───────────────────────────────────────────────────────────────────

export type AssetStatus =
  | 'REGISTERED'
  | 'AVAILABLE'
  | 'IN_USE'
  | 'IN_MAINTENANCE'
  | 'DISCARDED'

export type AssetCategory =
  | 'DESKTOP'
  | 'NOTEBOOK'
  | 'MONITOR'
  | 'PRINTER'
  | 'PHONE'
  | 'OTHER'

export type AssetMovementType =
  | 'REGISTERED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'SENT_TO_MAINTENANCE'
  | 'RETURNED_FROM_MAINTENANCE'
  | 'DISCARDED'

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT'

// ─── Assets ──────────────────────────────────────────────────────────────────

/** POST /v1/assets */
export interface RegisterAssetRequest {
  patrimonyNumber: string
  name: string
  category: AssetCategory
  serialNumber?: string
  model?: string
  manufacturer?: string
  departmentId: string
}

/** PUT /v1/assets/:id */
export interface UpdateAssetRequest {
  name?: string
  description?: string
  notes?: string
  warrantyUntil?: string // ISO date (YYYY-MM-DD)
}

/** POST /v1/assets/:id/assign */
export interface AssignAssetRequest {
  userId: string
  departmentId: string
}

/** POST /v1/assets/:id/maintenance  |  POST /v1/assets/:id/discard */
export interface AssetActionRequest {
  notes: string
}

/** GET /v1/assets  |  GET /v1/assets/:id */
export interface AssetResponse {
  id: string
  patrimonyNumber: string
  name: string
  description: string | null
  category: AssetCategory
  status: AssetStatus
  serialNumber: string | null
  model: string | null
  manufacturer: string | null
  purchaseDate: string | null   // ISO date
  purchaseValue: number | null
  warrantyUntil: string | null  // ISO date
  assignedUserId: string | null
  assignedDepartmentId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

/** GET /v1/assets/:id/movements → AssetMovementResponse[] */
export interface AssetMovementResponse {
  id: string
  assetId: string
  movementType: AssetMovementType
  fromUserId: string | null
  toUserId: string | null
  fromDepartmentId: string | null
  toDepartmentId: string | null
  performedById: string
  notes: string | null
  createdAt: string
}

// ─── Stock ────────────────────────────────────────────────────────────────────

/** POST /v1/stock */
export interface CreateStockItemRequest {
  name: string
  category: string
  unit: string
  minimumQuantity: number
  location?: string
}

/** POST /v1/stock/:id/add  |  POST /v1/stock/:id/remove */
export interface StockAdjustmentRequest {
  quantity: number
  reason?: string
  relatedTicketId?: string
}

/** GET /v1/stock  |  GET /v1/stock/:id  |  GET /v1/stock/alerts */
export interface StockItemResponse {
  id: string
  name: string
  description: string | null
  category: string
  unit: string
  currentQuantity: number
  minimumQuantity: number
  location: string | null
  active: boolean
  isBelowMinimum: boolean
  createdAt: string
  updatedAt: string
}

/** GET /v1/stock/:id/movements → StockMovementResponse[] */
export interface StockMovementResponse {
  id: string
  stockItemId: string
  movementType: StockMovementType
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string | null
  performedById: string
  relatedTicketId: string | null
  createdAt: string
}
