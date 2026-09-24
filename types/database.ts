export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'Admin' | 'Personel'
export type ProductCondition = 'sıfır' | 'ikinci el'
export type CategoryName = 'Telefon' | 'Aksesuar' | 'Yedek Parça' | string

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: Role
        Insert: RoleInsert
        Update: RoleUpdate
      }
      profiles: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      categories: {
        Row: Category
        Insert: CategoryInsert
        Update: CategoryUpdate
      }
      products: {
        Row: Product
        Insert: ProductInsert
        Update: ProductUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      product_condition: ProductCondition
    }
  }
}

// ==========================================
// 1. ROLLER (ROLES) ARAYÜZLERİ
// ==========================================
export interface Role {
  id: string
  name: UserRole
  description: string | null
  created_at: string
}

export interface RoleInsert {
  id?: string
  name: UserRole
  description?: string | null
  created_at?: string
}

export interface RoleUpdate {
  id?: string
  name?: UserRole
  description?: string | null
  created_at?: string
}

// ==========================================
// 2. KULLANICILAR / PROFİLLER (USERS/PROFILES) ARAYÜZLERİ
// ==========================================
export interface Profile {
  id: string // auth.users id ile eşleşir
  email: string | null
  full_name: string
  phone: string | null
  role_id: string
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProfileInsert {
  id: string
  email?: string | null
  full_name: string
  phone?: string | null
  role_id: string
  role?: UserRole
  avatar_url?: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface ProfileUpdate {
  id?: string
  email?: string | null
  full_name?: string
  phone?: string | null
  role_id?: string
  role?: UserRole
  avatar_url?: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

// Geriye dönük uyumluluk ve okunabilirlik için User alias'ı
export type User = Profile
export type UserInsert = ProfileInsert
export type UserUpdate = ProfileUpdate

// ==========================================
// 3. KATEGORİLER (CATEGORIES) ARAYÜZLERİ
// ==========================================
export interface Category {
  id: string
  name: CategoryName
  slug: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface CategoryInsert {
  id?: string
  name: CategoryName
  slug: string
  description?: string | null
  created_at?: string
  updated_at?: string
}

export interface CategoryUpdate {
  id?: string
  name?: CategoryName
  slug?: string
  description?: string | null
  created_at?: string
  updated_at?: string
}

// ==========================================
// 4. ÜRÜNLER (PRODUCTS) ARAYÜZLERİ
// ==========================================
export interface Product {
  id: string
  category_id: string
  name: string
  brand: string
  model: string | null
  barcode: string | null
  imei: string | null // Telefonlar için 15 haneli benzersiz IMEI
  condition: ProductCondition // 'sıfır' | 'ikinci el'
  purchase_price: number // Alış Fiyatı (TL)
  sale_price: number // Satış Fiyatı (TL)
  stock_quantity: number // Stok Adedi
  min_stock_level: number // Kritik Stok Eşiği
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductInsert {
  id?: string
  category_id: string
  name: string
  brand: string
  model?: string | null
  barcode?: string | null
  imei?: string | null
  condition?: ProductCondition
  purchase_price: number
  sale_price: number
  stock_quantity?: number
  min_stock_level?: number
  description?: string | null
  image_url?: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface ProductUpdate {
  id?: string
  category_id?: string
  name?: string
  brand?: string
  model?: string | null
  barcode?: string | null
  imei?: string | null
  condition?: ProductCondition
  purchase_price?: number
  sale_price?: number
  stock_quantity?: number
  min_stock_level?: number
  description?: string | null
  image_url?: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

// İlişkili sorgular için genişletilmiş tip (Joined queries)
export interface ProductWithCategory extends Product {
  category: Category
}

export interface ProfileWithRole extends Profile {
  role_details?: Role
}
