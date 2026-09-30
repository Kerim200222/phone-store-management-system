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
