import { z } from "zod"
import { POSCustomerSelect } from "@/types/pos"

/**
 * İkinci El Cihaz Alım Formu Validasyon Şeması (Zod)
 */
export const purchaseFormSchema = z.object({
  customerId: z.string().min(1, { message: "Lütfen cihazı satın alacağınız müşteriyi seçiniz." }),
  brand: z.string().min(1, { message: "Cihaz markası zorunludur." }).max(50),
  model: z.string().min(1, { message: "Cihaz modeli zorunludur." }).max(60),
  imei: z
    .string()
    .min(15, { message: "IMEI numarası tam 15 haneli olmalıdır." })
    .max(15, { message: "IMEI numarası tam 15 haneli olmalıdır." })
    .regex(/^[0-9]{15}$/, { message: "IMEI yalnızca 15 haneli rakamlardan oluşmalıdır." }),
  batteryHealth: z
    .number()
    .min(1, { message: "Batarya sağlığı en az %1 olmalıdır." })
    .max(100, { message: "Batarya sağlığı en fazla %100 olabilir." }),
  cosmeticCondition: z.enum([
    "A+ (Kusursuz / Sıfır Ayarında)",
    "A (Çok Temiz / Mikro Kılcal)",
    "B (Hafif Kılcal Çizikler)",
    "C (Darbeli / Kasada Ezik Var)",
  ]),
  storage: z.enum(["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"]),
  color: z.string().min(1, { message: "Kasa rengi zorunludur." }),
  purchasePrice: z
    .number()
    .min(1, { message: "Alış fiyatı 0'dan büyük olmalıdır (Kasadan para çıkışı)." }),
  targetSalePrice: z
    .number()
    .min(1, { message: "Hedef satış fiyatı 0'dan büyük olmalıdır." }),
  paymentMethod: z.enum(["cash", "bank_transfer", "on_account"]),
  hasBox: z.boolean(),
  hasInvoice: z.boolean(),
  hasOriginalCharger: z.boolean(),
  shelfLocation: z.string().max(50).optional().or(z.literal("")),
  technicalNotes: z.string().max(1000).optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
})

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>

/**
 * İkinci El Cihaz Alım Sözleşmesi Modeli
 */
export interface PurchaseContractData {
  contractNumber: string
  receiptNo: string
  productId: string
  date: string
  customer: POSCustomerSelect
  customerName: string
  customerPhone: string
  customerTckn?: string | null
  customerAddress?: string | null
  brand: string
  model: string
  imei: string
  batteryHealth: number
  cosmeticCondition: string
  storage: string
  color: string
  hasBox: boolean
  hasInvoice: boolean
  hasCharger: boolean
  technicalNotes?: string
  purchasePrice: number
  targetSalePrice: number
  paymentMethod: "cash" | "bank_transfer" | "on_account"
  estimatedProfit: number
  profitMarginPercent: number
  storeName?: string
  storeAddress?: string
  storePhone?: string
}

/**
 * Hızlı Test Cihaz Şablonları
 */
export interface PurchasePreset {
  id: string
  title: string
  brand: string
  model: string
  storage: "64 GB" | "128 GB" | "256 GB" | "512 GB" | "1 TB"
  color: string
  batteryHealth: number
  cosmeticCondition: "A+ (Kusursuz / Sıfır Ayarında)" | "A (Çok Temiz / Mikro Kılcal)" | "B (Hafif Kılcal Çizikler)" | "C (Darbeli / Kasada Ezik Var)"
  purchasePrice: number
  targetSalePrice: number
  hasBox: boolean
  hasInvoice: boolean
  hasOriginalCharger: boolean
  shelfLocation: string
  technicalNotes: string
  imageUrl: string
}

export const PURCHASE_PRESETS: PurchasePreset[] = [
  {
    id: "preset-iphone13",
    title: "📱 iPhone 13 128GB (Gece Yarısı)",
    brand: "Apple",
    model: "iPhone 13 (A2633)",
    storage: "128 GB",
    color: "Gece Yarısı",
    batteryHealth: 88,
    cosmeticCondition: "A (Çok Temiz / Mikro Kılcal)",
    purchasePrice: 21500,
    targetSalePrice: 28500,
    hasBox: true,
    hasInvoice: true,
    hasOriginalCharger: false,
    shelfLocation: "İkinci El Vitrin A-1",
    technicalNotes: "FaceID ve TrueTone aktif. Orijinal ekran ve batarya. Değişen parça yok.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "preset-s23ultra",
    title: "📱 Galaxy S23 Ultra 256GB (Yeşil)",
    brand: "Samsung",
    model: "Galaxy S23 Ultra (SM-S918B)",
    storage: "256 GB",
    color: "Botanik Yeşil",
    batteryHealth: 94,
    cosmeticCondition: "A+ (Kusursuz / Sıfır Ayarında)",
    purchasePrice: 32000,
    targetSalePrice: 41900,
    hasBox: true,
    hasInvoice: true,
    hasOriginalCharger: true,
    shelfLocation: "İkinci El Vitrin A-2",
    technicalNotes: "Samsung Türkiye çıkışlı. S-Pen tam çalışıyor, ekranda ve kasada çizik dahi yok.",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "preset-redmi",
    title: "📱 Redmi Note 12 Pro 5G (Mavi)",
    brand: "Xiaomi",
    model: "Redmi Note 12 Pro 5G",
    storage: "256 GB",
    color: "Gök Mavisi",
    batteryHealth: 91,
    cosmeticCondition: "B (Hafif Kılcal Çizikler)",
    purchasePrice: 7800,
    targetSalePrice: 11200,
    hasBox: false,
    hasInvoice: true,
    hasOriginalCharger: true,
    shelfLocation: "Giriş Seviye İkinci El Rafı",
    technicalNotes: "67W Hızlı şarj çalışıyor. Arka kapakta hafif kılcal çizik mevcut, ekran koruyucu ile kullanılmış.",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
  },
]
