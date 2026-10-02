import { z } from "zod"

export const CategoryTypeEnum = z.enum(["Cihaz", "Aksesuar", "Yedek Parça", "Hizmet"])
export type CategoryType = z.infer<typeof CategoryTypeEnum>

// Zod Validation Schema for Categories
export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Kategori adı en az 2 karakter olmalıdır." })
    .max(50, { message: "Kategori adı en fazla 50 karakter olabilir." }),
  slug: z
    .string()
    .min(2, { message: "Slug en az 2 karakter olmalıdır." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug yalnızca küçük harfler, rakamlar ve tire (-) içerebilir.",
    }),
  type: CategoryTypeEnum,
  description: z
    .string()
    .max(250, { message: "Açıklama 250 karakterden uzun olamaz." })
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
})

export type CategoryFormData = z.infer<typeof categoryFormSchema>

export interface CategoryItem {
  id: string
  name: string
  slug: string
  type: CategoryType
  description?: string | null
  productCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Zod Validation Schema for Brands
export const brandFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Marka adı en az 2 karakter olmalıdır." })
    .max(40, { message: "Marka adı 40 karakterden uzun olamaz." }),
  country: z.string().optional().or(z.literal("")),
  categoryType: CategoryTypeEnum,
  isActive: z.boolean(),
})

export type BrandFormData = z.infer<typeof brandFormSchema>

export interface BrandItem {
  id: string
  name: string
  country?: string | null
  categoryType: CategoryType
  productCount: number
  isActive: boolean
}

// ==========================================
// ZOD VALIDATION SCHEMA FOR PRODUCTS (ÜRÜN / AKSESUAR / YEDEK PARÇA / TELEFON)
// ==========================================
export const ProductTypeEnum = z.enum(["phone", "accessory_part"])
export type ProductType = z.infer<typeof ProductTypeEnum>

export const CosmeticConditionOptions = [
  "Sıfır (Kutulu Jelatinli)",
  "A+ (Kusursuz / Sıfır Ayarında)",
  "A (Çok Temiz / Mikro Kılcal)",
  "B (Temiz / Hafif Kullanım İzi)",
  "C (Kozmetik Kusurlu / Çıkma)"
] as const

export const PhoneStorageOptions = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB"] as const
export const PhoneColorOptions = ["Uzay Grisi", "Gümüş", "Gece Yarısı", "Doğal Titanyum", "Siyah Titanyum", "Mavi Titanyum", "Altın", "Beyaz", "Yıldız Işığı"] as const
export const PhoneWarrantyOptions = ["Apple Türkiye (Resmi)", "Samsung Türkiye (Resmi)", "İthalatçı Garantili", "Mağaza 6 Ay Servis Garantili", "Mağaza 1 Yıl Servis Garantili", "Garantisi Bitti"] as const

export const productFormSchema = z
  .object({
    productType: ProductTypeEnum,
    name: z
      .string()
      .min(2, { message: "Ürün adı en az 2 karakter olmalıdır." })
      .max(100, { message: "Ürün adı en fazla 100 karakter olabilir." }),
    barcode: z
      .string()
      .min(3, { message: "Barkod en az 3 karakter olmalıdır." })
      .max(50, { message: "Barkod en fazla 50 karakter olabilir." }),
    categoryId: z.string().min(1, { message: "Lütfen bir kategori seçiniz." }),
    categoryName: z.string().min(1, { message: "Kategori adı gereklidir." }),
    brand: z
      .string()
      .min(1, { message: "Marka adı zorunludur." })
      .max(50, { message: "Marka adı en fazla 50 karakter olabilir." }),
    model: z.string().max(60, { message: "Model en fazla 60 karakter olabilir." }).optional().or(z.literal("")),
    condition: z.enum(["sıfır", "ikinci el"]),
    
    // Telefon Varyasyonu Özel Dinamik Alanları
    imei: z.string().optional().or(z.literal("")),
    batteryHealth: z
      .number()
      .min(1, { message: "Batarya sağlığı en az %1 olmalıdır." })
      .max(100, { message: "Batarya sağlığı en fazla %100 olabilir." })
      .optional(),
    cosmeticCondition: z.string().optional().or(z.literal("")),
    storage: z.string().optional().or(z.literal("")),
    color: z.string().optional().or(z.literal("")),
    warrantyStatus: z.string().optional().or(z.literal("")),

    // Fiyatlandırma
    purchasePrice: z
      .number()
      .min(0, { message: "Alış fiyatı 0 veya daha büyük olmalıdır." }),
    salePrice: z
      .number()
      .min(0, { message: "Satış fiyatı 0 veya daha büyük olmalıdır." }),

    // Stok Sayımı (Aksesuar & Yedek Parça için dinamik)
    stockQuantity: z
      .number()
      .int({ message: "Stok adedi tam sayı olmalıdır." })
      .min(0, { message: "Stok adedi 0 veya daha büyük olmalıdır." }),
    minStockLevel: z
      .number()
      .int({ message: "Kritik stok seviyesi tam sayı olmalıdır." })
      .min(0, { message: "Kritik stok 0 veya daha büyük olmalıdır." }),

    shelfLocation: z.string().max(50).optional().or(z.literal("")),
    description: z.string().max(500, { message: "Açıklama 500 karakterden uzun olamaz." }).optional().or(z.literal("")),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.productType === "phone") {
      // 1. IMEI Numarası Zorunlu ve tam 15 Haneli Rakam
      if (!data.imei || data.imei.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["imei"],
          message: "Telefonlar için 15 haneli IMEI numarası zorunludur.",
        })
      } else if (!/^[0-9]{15}$/.test(data.imei.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["imei"],
          message: "IMEI numarası tam 15 haneli rakamlardan oluşmalıdır.",
        })
      }

      // 2. Batarya Sağlığı Zorunlu (%1 - %100)
      if (data.batteryHealth === undefined || data.batteryHealth === null || Number.isNaN(data.batteryHealth)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["batteryHealth"],
          message: "Telefonlar için batarya sağlığı (%1 - %100) zorunludur.",
        })
      }

      // 3. Kozmetik Durum Seçimi Zorunlu
      if (!data.cosmeticCondition || data.cosmeticCondition.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cosmeticCondition"],
          message: "Telefonlar için kozmetik durum seçimi zorunludur.",
        })
      }
    } else {
      // Aksesuar / Yedek Parça için stok adedi kontrolü
      if (data.stockQuantity === undefined || data.stockQuantity === null || Number.isNaN(data.stockQuantity)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stockQuantity"],
          message: "Aksesuar ve yedek parçalar için geçerli bir stok adedi girilmelidir.",
        })
      }
    }
  })

export type ProductFormData = z.infer<typeof productFormSchema>

// Türkiye GS1 formatında (869 ile başlayan) 13 haneli EAN barkod üretici
export function generateEAN13Barcode(prefix = "869"): string {
  let code = prefix
  while (code.length < 12) {
    code += Math.floor(Math.random() * 10).toString()
  }
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i], 10)
    sum += i % 2 === 0 ? digit : digit * 3
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return code + checkDigit.toString()
}

// 15 Haneli Luhn Algoritmalı Gerçekçi IMEI Üretici
export function generateLuhnIMEI(): string {
  const tacPrefixes = ["354892", "358742", "869012", "359145", "867204"]
  const prefix = tacPrefixes[Math.floor(Math.random() * tacPrefixes.length)]
  let imei14 = prefix
  while (imei14.length < 14) {
    imei14 += Math.floor(Math.random() * 10).toString()
  }
  let sum = 0
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(imei14[i], 10)
    if (i % 2 !== 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return imei14 + checkDigit.toString()
}

// ==========================================
// ENVANTER LİSTELEME & TABLO FİLTRELEME TİPLERİ
// ==========================================
export type StockStatusType = "all" | "in_stock" | "critical" | "out_of_stock"
export type SortField = "name" | "sale_price" | "stock_quantity" | "created_at"
export type SortOrder = "asc" | "desc"

export interface InventoryItem {
  id: string
  name: string
  brand: string
  model: string | null
  category: string
  category_id?: string
  barcode: string | null
  imei: string | null
  condition: "sıfır" | "ikinci el"
  battery_health?: number | null
  cosmetic_condition?: string | null
  storage?: string | null
  color?: string | null
  purchase_price: number
  sale_price: number
  stock_quantity: number
  min_stock_level: number
  shelf_location?: string | null
  description?: string | null
  is_active: boolean
  created_at?: string
}

export function calculateStockStatus(quantity: number, minLevel: number): "in_stock" | "critical" | "out_of_stock" {
  if (quantity <= 0) return "out_of_stock"
  if (quantity <= minLevel) return "critical"
  return "in_stock"
}

