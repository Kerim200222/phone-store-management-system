/**
 * ==============================================================================
 * GÜN 28: DÜŞÜK STOK UYARI SİSTEMİ TİP TANIMLARI
 * ==============================================================================
 */

export type StockSeverity = "out_of_stock" | "critical" | "warning"

export type StockAlertFilter = "all" | "out_of_stock" | "critical" | "warning"

export interface LowStockProduct {
  id: string
  name: string
  brand: string
  model: string | null
  barcode: string | null
  imei: string | null
  stockQuantity: number
  minStockLevel: number
  purchasePrice: number
  salePrice: number
  imageUrl?: string | null
  categoryId?: string | null
  categoryName: string
  severity: StockSeverity
}

export interface StockAlertSummary {
  threshold: number
  totalCount: number
  outOfStockCount: number
  criticalCount: number
  warningCount: number
  products: LowStockProduct[]
  lastCheckedAt: string
}

export interface StockAlertResponse {
  success: boolean
  data?: StockAlertSummary
  error?: string
  source?: "supabase_rpc" | "supabase_direct" | "mock_fallback"
}
