/**
 * ==============================================================================
 * GÜN 26: DASHBOARD ANALİTİK VE RAPOR TİP TANIMLARI
 * ==============================================================================
 */

import { DateFilterType } from "@/lib/date-filters"

export interface TopSellingProduct {
  productId: string
  name: string
  brand: string
  categoryName: string
  totalQuantity: number
  totalRevenue: number
  totalProfit: number
  currentStock: number
  imageUrl?: string | null
}

export interface PaymentMethodMetric {
  method: "cash" | "credit_card" | "bank_transfer" | "on_account" | "split" | string
  amount: number
  count: number
  percentage: number
}

export interface DashboardRevenueMetrics {
  total: number               // Toplam Ciro (Satış + Servis)
  sales: number               // Ürün Satış Cirosu
  repairs: number             // Teknik Servis Geliri
  purchasesExpense: number    // İkinci El Cihaz Alım Gideri
  salesCount: number          // Satış İşlem Adedi
  repairsCount: number        // Servis Tahsilat Adedi
  transactionCount: number    // Toplam Gelir İşlemi Sayısı
}

export interface DashboardProfitMetrics {
  grossProfit: number         // Brüt Kâr (Ciro - COGS)
  cogs: number                // Satılan Malların Maliyeti (Cost of Goods Sold)
  profitMargin: number        // Kâr Marjı Yüzdesi (%)
  isProfitable: boolean       // Kârda mı zararda mı?
}

export interface ServiceQueueSummary {
  pending: number             // Bekleyen Cihaz
  inProgress: number          // İşlemde Olan Cihaz
  completed: number           // Hazır / Teslime Bekleyen Cihaz
  totalActive: number         // Kuyruktaki Toplam Cihaz (Bekliyor + İşlemde)
}

export interface CriticalStockItem {
  id: string
  name: string
  brand: string
  stockQuantity: number
  minStockLevel: number
  salePrice: number
}

export interface CriticalStockSummary {
  count: number
  items: CriticalStockItem[]
}

export interface RecentTransactionItem {
  id: string
  transactionNumber: string
  type: "sale" | "purchase" | "repair_payment" | "return" | string
  paymentMethod: string
  amount: number
  notes?: string | null
  createdAt: string
  customerName?: string | null
}

export interface ActiveTicketItem {
  id: string
  ticketNumber: string
  deviceBrand: string
  deviceModel: string
  issueDescription: string
  devicePassword?: string | null
  status: "bekliyor" | "islemde" | "parca_bekliyor" | "tamamlandi" | string
  estimatedCost: number
  customerName?: string | null
  createdAt: string
}

export interface DashboardAnalyticsData {
  period: {
    filter: DateFilterType
    startDate: string
    endDate: string
    displayLabel: string
  }
  revenue: DashboardRevenueMetrics
  profit: DashboardProfitMetrics
  topProducts: TopSellingProduct[]
  paymentMethods: PaymentMethodMetric[]
  serviceQueue: ServiceQueueSummary
  criticalStock: CriticalStockSummary
  recentTransactions: RecentTransactionItem[]
  activeTickets: ActiveTicketItem[]
}

export interface DashboardAnalyticsResponse {
  success: boolean
  data?: DashboardAnalyticsData
  error?: string
  source?: "supabase_rpc" | "supabase_aggregated" | "mock_fallback"
}
