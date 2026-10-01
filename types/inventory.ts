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
// ZOD VALIDATION SCHEMA FOR PRODUCTS (ÜRÜN / AKSESUAR / YEDEK PARÇA)
// ==========================================
export const productFormSchema = z.object({
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
  purchasePrice: z
    .number()
    .min(0, { message: "Alış fiyatı 0 veya daha büyük olmalıdır." }),
  salePrice: z
    .number()
    .min(0, { message: "Satış fiyatı 0 veya daha büyük olmalıdır." }),
  stockQuantity: z
    .number()
    .int({ message: "Stok adedi tam sayı olmalıdır." })
    .min(0, { message: "Stok adedi 0 veya daha büyük olmalıdır." }),
  minStockLevel: z
    .number()
    .int({ message: "Kritik stok seviyesi tam sayı olmalıdır." })
    .min(0, { message: "Kritik stok 0 veya daha büyük olmalıdır." }),
  imei: z
    .string()
    .refine((val) => !val || /^[0-9]{15}$/.test(val), {
      message: "IMEI numarası 15 haneli rakamlardan oluşmalıdır.",
    })
    .optional()
    .or(z.literal("")),
  shelfLocation: z.string().max(50).optional().or(z.literal("")),
  description: z.string().max(500, { message: "Açıklama 500 karakterden uzun olamaz." }).optional().or(z.literal("")),
  isActive: z.boolean(),
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
