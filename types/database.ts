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
export type TransactionType = 'sale' | 'purchase' | 'return' | 'repair_payment'
export type PaymentMethod = 'cash' | 'credit_card' | 'bank_transfer' | 'on_account' | 'split'
export type TransactionStatus = 'completed' | 'pending' | 'cancelled'

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
      customers: {
        Row: Customer
        Insert: CustomerInsert
        Update: CustomerUpdate
      }
      transactions: {
        Row: Transaction
        Insert: TransactionInsert
        Update: TransactionUpdate
      }
      transaction_items: {
        Row: TransactionItem
        Insert: TransactionItemInsert
        Update: TransactionItemUpdate
      }
    }
    Views: {
      v_transactions_summary: {
        Row: TransactionSummaryView
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      product_condition: ProductCondition
      transaction_type: TransactionType
      payment_method: PaymentMethod
      transaction_status: TransactionStatus
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

// ==========================================
// 5. MÜŞTERİLER (CUSTOMERS) ARAYÜZLERİ (Day 4)
// ==========================================
export interface Customer {
  id: string
  full_name: string
  phone: string
  email: string | null
  identity_number: string | null
  address: string | null
  notes: string | null
  balance: number // Cari bakiye (+ alacak, - borç)
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CustomerInsert {
  id?: string
  full_name: string
  phone: string
  email?: string | null
  identity_number?: string | null
  address?: string | null
  notes?: string | null
  balance?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface CustomerUpdate {
  id?: string
  full_name?: string
  phone?: string
  email?: string | null
  identity_number?: string | null
  address?: string | null
  notes?: string | null
  balance?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

// ==========================================
// 6. KASA VE İŞLEMLER (TRANSACTIONS) ARAYÜZLERİ (Day 4)
// ==========================================
export interface Transaction {
  id: string
  transaction_number: string
  customer_id: string | null
  type: TransactionType
  payment_method: PaymentMethod
  total_amount: number
  discount_amount: number
  net_amount: number
  paid_amount: number
  status: TransactionStatus
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface TransactionInsert {
  id?: string
  transaction_number: string
  customer_id?: string | null
  type: TransactionType
  payment_method: PaymentMethod
  total_amount: number
  discount_amount?: number
  net_amount: number
  paid_amount?: number
  status?: TransactionStatus
  notes?: string | null
  created_by?: string | null
  created_at?: string
  updated_at?: string
}

export interface TransactionUpdate {
  id?: string
  transaction_number?: string
  customer_id?: string | null
  type?: TransactionType
  payment_method?: PaymentMethod
  total_amount?: number
  discount_amount?: number
  net_amount?: number
  paid_amount?: number
  status?: TransactionStatus
  notes?: string | null
  created_by?: string | null
  created_at?: string
  updated_at?: string
}

// ==========================================
// 7. İŞLEM DETAYLARI (TRANSACTION_ITEMS) ARAYÜZLERİ (Day 4)
// ==========================================
export interface TransactionItem {
  id: string
  transaction_id: string
  product_id: string
  imei: string | null
  quantity: number
  unit_price: number
  total_price: number
  notes: string | null
  created_at: string
}

export interface TransactionItemInsert {
  id?: string
  transaction_id: string
  product_id: string
  imei?: string | null
  quantity?: number
  unit_price: number
  total_price: number
  notes?: string | null
  created_at?: string
}

export interface TransactionItemUpdate {
  id?: string
  transaction_id?: string
  product_id?: string
  imei?: string | null
  quantity?: number
  unit_price?: number
  total_price?: number
  notes?: string | null
  created_at?: string
}

// ==========================================
// 8. BİRLEŞİK GÖRÜNÜM VE İLİŞKİLİ MODELLER
// ==========================================
export interface TransactionSummaryView {
  id: string
  transaction_number: string
  type: TransactionType
  payment_method: PaymentMethod
  total_amount: number
  discount_amount: number
  net_amount: number
  paid_amount: number
  status: TransactionStatus
  customer_id: string | null
  customer_name: string | null
  customer_phone: string | null
  created_by: string | null
  staff_name: string | null
  created_at: string
  total_items: number
  total_quantity: number
}

export interface TransactionItemWithProduct extends TransactionItem {
  product?: Product
}

export interface TransactionWithDetails extends Transaction {
  customer?: Customer | null
  items: TransactionItemWithProduct[]
  staff?: Profile | null
}
