import { z } from "zod"

/**
 * ==============================================================================
 * GÜN 25: CİHAZ GEÇMİŞİ VE IMEI ZAMAN ÇİZELGESİ (DEVICE HISTORY & TIMELINE)
 * ==============================================================================
 */

/**
 * Cihaz Geçmiş Olay Türleri
 */
export type DeviceHistoryEventType = 
  | "purchase"           // 2. El Cihaz Alımı (Mağazaya Giriş)
  | "sale"               // POS Satışı (Müşteriye Çıkış)
  | "repair_intake"      // Servis Kabulü (Arıza Girişi)
  | "repair_parts_added" // Parça Montajı & İşçilik
  | "repair_completed"   // Onarım Tamamlandı & Test
  | "repair_delivered"   // Cihaz Teslimi & Kasa Tahsilatı
  | "warranty_check"     // Garanti / Ekspertiz Kontrolü
  | "return"             // İade / Değişim

/**
 * Cihazın Mevcut Fiziksel ve Operasyonel Durumu
 */
export type DeviceCurrentStatus = 
  | "in_stock"          // Mağazada / Vitrinde Satışa Hazır
  | "sold"              // Müşteride (Satıldı)
  | "in_service"        // Teknik Serviste (İşlemde / Parça Bekliyor)
  | "ready_for_pickup"  // Onarıldı / Müşteri Teslimatı Bekliyor
  | "delivered"         // Onarıldı ve Teslim Edildi

/**
 * Zaman Çizelgesindeki Tekil Olay Modeli
 */
export interface DeviceTimelineEvent {
  id: string
  type: DeviceHistoryEventType
  date: string // ISO date
  title: string
  description: string
  badgeText: string
  badgeColor: "emerald" | "blue" | "purple" | "amber" | "rose" | "cyan"
  iconName: "shopping-bag" | "credit-card" | "wrench" | "boxes" | "check-circle" | "shield-check" | "rotate-ccw" | "tag"
  amount?: number | null // TL tutar (varsa)
  customer?: {
    id?: string
    name: string
    phone?: string
  } | null
  staffName?: string
  metadata?: {
    ticketNumber?: string
    transactionNumber?: string
    invoiceNumber?: string
    partsUsed?: { partName: string; quantity: number; unitPrice: number; totalPrice: number }[]
    laborCost?: number
    warrantyMonths?: number
    warrantyEndDate?: string
    batteryHealth?: number
    cosmeticCondition?: string
    notes?: string
    paymentMethod?: string
    physicalCondition?: string
    devicePassword?: string
    screenCondition?: string
    technicianNotes?: string
  }
}

/**
 * Cihazın Genel Künye ve İstatistik Özeti
 */
export interface DeviceSummary {
  imei: string
  serialNumber?: string | null
  brand: string
  model: string
  storage?: string | null
  color?: string | null
  condition?: "sıfır" | "ikinci el" | null
  currentStatus: DeviceCurrentStatus
  batteryHealth?: number | null
  cosmeticCondition?: string | null
  firstSeenDate: string
  lastActivityDate: string
  totalRepairsCount: number
  totalRepairSpent: number
  purchasePrice?: number | null
  salePrice?: number | null
  activeWarranty?: {
    isActive: boolean
    months: number
    type: string // "Servis Onarım Garantisi" | "Resmi Üretici Garantisi"
    endDate: string
    remainingDays: number
  } | null
  currentOwner?: {
    id?: string
    name: string
    phone: string
  } | null
}

/**
 * IMEI Sorgulama Sonuç Paketi
 */
export interface DeviceHistoryQueryResult {
  device: DeviceSummary
  events: DeviceTimelineEvent[]
}

/**
 * Hızlı Demo Test Şablonu (Örnek IMEI Ön Tanımı)
 */
export interface DeviceHistoryPreset {
  id: string
  imei: string
  brand: string
  model: string
  storage: string
  color: string
  summaryText: string
  eventCount: number
  badge: string
}

/**
 * 15 Haneli IMEI Doğrulama Şeması (Zod)
 */
export const imeiQuerySchema = z.object({
  imei: z
    .string()
    .trim()
    .length(15, { message: "IMEI numarası tam olarak 15 haneli olmalıdır." })
    .regex(/^[0-9]{15}$/, { message: "IMEI numarası yalnızca rakamlardan oluşmalıdır." }),
})

export type IMEIQueryFormData = z.infer<typeof imeiQuerySchema>
