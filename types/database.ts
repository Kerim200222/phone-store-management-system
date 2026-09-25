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
export type RepairStatus = 'bekliyor' | 'islemde' | 'tamamlandi' | 'iade' | 'teslim_edildi' | 'iptal'

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
      repair_tickets: {
        Row: RepairTicket
        Insert: RepairTicketInsert
        Update: RepairTicketUpdate
      }
      repair_ticket_parts: {
        Row: RepairTicketPart
        Insert: RepairTicketPartInsert
        Update: RepairTicketPartUpdate
      }
    }
    Views: {
      v_transactions_summary: {
        Row: TransactionSummaryView
      }
      v_repair_tickets_summary: {
        Row: RepairTicketSummaryView
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
      repair_status: RepairStatus
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

// ==========================================
// 9. TEKNİK SERVİS (REPAIR_TICKETS) ARAYÜZLERİ (Day 5)
// ==========================================
export interface RepairPartItem {
  product_id?: string
  part_name: string
  quantity: number
  unit_price: number
  total_price: number
  notes?: string
}

export interface RepairTicket {
  id: string
  ticket_number: string
  customer_id: string
  device_brand: string
  device_model: string
  imei: string | null
  serial_number: string | null
  device_password: string | null // Müşteri ekran kilidi / PIN
  pattern_code: string | null
  physical_condition: string | null
  has_accessories: string | null
  issue_description: string // Müşteri arıza şikayeti
  technician_notes: string | null
  status: RepairStatus // 'bekliyor' | 'islemde' | 'tamamlandi' | 'iade' | 'teslim_edildi' | 'iptal'
  estimated_cost: number
  labor_cost: number
  parts_total_cost: number
  actual_cost: number
  parts_used: RepairPartItem[] // JSONB formatında kullanılan yedek parçalar
  assigned_to: string | null
  completed_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
}

export interface RepairTicketInsert {
  id?: string
  ticket_number: string
  customer_id: string
  device_brand: string
  device_model: string
  imei?: string | null
  serial_number?: string | null
  device_password?: string | null
  pattern_code?: string | null
  physical_condition?: string | null
  has_accessories?: string | null
  issue_description: string
  technician_notes?: string | null
  status?: RepairStatus
  estimated_cost?: number
  labor_cost?: number
  parts_total_cost?: number
  actual_cost?: number
  parts_used?: RepairPartItem[]
  assigned_to?: string | null
  completed_at?: string | null
  delivered_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface RepairTicketUpdate {
  id?: string
  ticket_number?: string
  customer_id?: string
  device_brand?: string
  device_model?: string
  imei?: string | null
  serial_number?: string | null
  device_password?: string | null
  pattern_code?: string | null
  physical_condition?: string | null
  has_accessories?: string | null
  issue_description?: string
  technician_notes?: string | null
  status?: RepairStatus
  estimated_cost?: number
  labor_cost?: number
  parts_total_cost?: number
  actual_cost?: number
  parts_used?: RepairPartItem[]
  assigned_to?: string | null
  completed_at?: string | null
  delivered_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface RepairTicketPart {
  id: string
  repair_ticket_id: string
  product_id: string | null
  part_name: string
  quantity: number
  unit_price: number
  total_price: number
  notes: string | null
  created_at: string
}

export interface RepairTicketPartInsert {
  id?: string
  repair_ticket_id: string
  product_id?: string | null
  part_name: string
  quantity?: number
  unit_price: number
  total_price: number
  notes?: string | null
  created_at?: string
}

export interface RepairTicketPartUpdate {
  id?: string
  repair_ticket_id?: string
  product_id?: string | null
  part_name?: string
  quantity?: number
  unit_price?: number
  total_price?: number
  notes?: string | null
  created_at?: string
}

export interface RepairTicketSummaryView {
  id: string
  ticket_number: string
  customer_id: string
  customer_name: string | null
  customer_phone: string | null
  device_brand: string
  device_model: string
  imei: string | null
  device_password: string | null
  issue_description: string
  technician_notes: string | null
  status: RepairStatus
  estimated_cost: number
  labor_cost: number
  parts_total_cost: number
  actual_cost: number
  parts_used: RepairPartItem[]
  assigned_to: string | null
  technician_name: string | null
  completed_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
}

export interface RepairTicketWithDetails extends RepairTicket {
  customer?: Customer
  technician?: Profile | null
  parts_relational?: RepairTicketPart[]
}
