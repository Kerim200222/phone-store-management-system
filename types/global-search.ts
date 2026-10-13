/**
 * ==============================================================================
 * GÜN 29: GLOBAL ARAMA (COMMAND PALETTE) VERİ MODELLERİ
 * ==============================================================================
 */

export type SearchResultType = "customer" | "product" | "service_ticket" | "navigation"

export interface BaseSearchResult {
  id: string
  title: string
  subtitle: string
  type: SearchResultType
  url: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  meta?: Record<string, string | number | null | undefined>
}

export interface CustomerSearchResult extends BaseSearchResult {
  type: "customer"
  phone?: string
  email?: string
}

export interface ProductSearchResult extends BaseSearchResult {
  type: "product"
  barcode?: string | null
  imei?: string | null
  stockQuantity: number
  price: number
  categoryName?: string
}

export interface ServiceTicketSearchResult extends BaseSearchResult {
  type: "service_ticket"
  ticketNumber: string
  customerName: string
  deviceModel: string
  imei?: string | null
  status: string
}

export interface NavigationSearchResult extends BaseSearchResult {
  type: "navigation"
  category: "Gezinme" | "Hızlı Eylem"
}

export type GlobalSearchResultItem =
  | CustomerSearchResult
  | ProductSearchResult
  | ServiceTicketSearchResult
  | NavigationSearchResult

export interface GlobalSearchResponse {
  query: string
  totalCount: number
  results: {
    tickets: ServiceTicketSearchResult[]
    products: ProductSearchResult[]
    customers: CustomerSearchResult[]
    navigation: NavigationSearchResult[]
  }
}
