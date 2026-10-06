import { ProductCondition } from "@/types/database"

/**
 * POS Ürün Modeli
 */
export interface POSProduct {
  id: string
  name: string
  brand: string
  model: string | null
  category: "Telefon" | "Aksesuar" | "Yedek Parça" | string
  barcode: string | null
  imei: string | null
  condition: ProductCondition
  sale_price: number
  purchase_price: number
  stock_quantity: number
  min_stock_level: number
  shelf_location?: string | null
  description?: string | null
  image_url?: string | null
  battery_health?: number | null
  storage?: string | null
  color?: string | null
  is_active: boolean
}

/**
 * Alışveriş Sepeti Öğesi (Cart Item)
 */
export interface CartItem {
  id: string // benzersiz sepet öğesi kimliği (product.id veya phone için imei bazlı)
  product: POSProduct
  quantity: number
  unit_price: number
  discount: number // Satır indirimi (TL)
  total_price: number // (unit_price * quantity) - discount
  selected_imei?: string | null
}

/**
 * Sepet Finansal Özeti
 */
export interface CartSummary {
  subtotal: number // KDV Hariç / Ara Toplam
  tax_rate: number // Varsayılan %20 KDV
  tax_amount: number // KDV Tutarı
  discount_total: number // Toplam İndirim
  grand_total: number // Ödenecek Genel Toplam
  total_items: number // Farklı ürün çeşidi
  total_quantity: number // Toplam adet
}

/**
 * Ödeme Yöntemleri
 */
export type POSPaymentMethod = "cash" | "credit_card" | "split" | "on_account"

export interface POSCustomerSelect {
  id: string
  full_name: string
  phone: string
  balance: number
  customer_type?: "bireysel" | "kurumsal"
}

/**
 * Satış Fişi / Makbuz Verisi
 */
export interface SaleReceipt {
  receipt_no: string
  transaction_id?: string
  date: string
  cashier_name: string
  customer?: POSCustomerSelect | null
  items: CartItem[]
  summary: CartSummary
  payment_method: POSPaymentMethod
  payment_details?: {
    cash_amount?: number
    card_amount?: number
  }
}

/**
 * Sepet Toplamlarını Hesaplama Yardımcısı
 */
export function calculateCartSummary(
  items: CartItem[], 
  globalDiscount: number = 0, 
  taxRatePercent: number = 20
): CartSummary {
  const lineSubtotal = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0)
  const lineDiscountTotal = items.reduce((acc, item) => acc + item.discount, 0)
  const totalDiscount = lineDiscountTotal + globalDiscount

  const discountedTotal = Math.max(0, lineSubtotal - totalDiscount)
  
  // Türkiye perakende standartlarında satış fiyatları KDV dahil gösterilir
  // KDV Matrahı: Toplam / (1 + KDV_ORANI)
  const taxFactor = 1 + (taxRatePercent / 100)
  const subtotalWithoutTax = discountedTotal / taxFactor
  const taxAmount = discountedTotal - subtotalWithoutTax

  const totalItems = items.length
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0)

  return {
    subtotal: subtotalWithoutTax,
    tax_rate: taxRatePercent,
    tax_amount: taxAmount,
    discount_total: totalDiscount,
    grand_total: discountedTotal,
    total_items: totalItems,
    total_quantity: totalQuantity,
  }
}

/**
 * Para Birimi Formatlayıcı (TRY)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Zengin Başlangıç POS Ürün Kataloğu (Yüksek Çözünürlüklü ve Farklı Kategoriler)
 */
export const INITIAL_POS_PRODUCTS: POSProduct[] = [
  {
    id: "pos-1",
    name: "Apple iPhone 15 Pro 256GB Naturel Titanyum",
    brand: "Apple",
    model: "iPhone 15 Pro (A3102)",
    category: "Telefon",
    barcode: "195949038241",
    imei: "356891048201942",
    condition: "sıfır",
    sale_price: 64999,
    purchase_price: 54000,
    stock_quantity: 3,
    min_stock_level: 2,
    shelf_location: "Vitrin Kasa Arkası A-1",
    description: "Kutulu, faturalı, Apple Türkiye Garantili Sıfır Cihaz",
    image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
    battery_health: 100,
    storage: "256 GB",
    color: "Naturel Titanyum",
    is_active: true,
  },
  {
    id: "pos-2",
    name: "Samsung Galaxy S24 Ultra 512GB Titanyum Gri",
    brand: "Samsung",
    model: "Galaxy S24 Ultra (SM-S928B)",
    category: "Telefon",
    barcode: "8806095392011",
    imei: "354910293847192",
    condition: "sıfır",
    sale_price: 68499,
    purchase_price: 56500,
    stock_quantity: 2,
    min_stock_level: 2,
    shelf_location: "Vitrin Kasa Arkası A-2",
    description: "Samsung Türkiye Garantili, S-Pen ve AI özellikli",
    image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
    battery_health: 100,
    storage: "512 GB",
    color: "Titanyum Gri",
    is_active: true,
  },
  {
    id: "pos-3",
    name: "Apple iPhone 13 128GB Gece Yarısı",
    brand: "Apple",
    model: "iPhone 13 (A2633)",
    category: "Telefon",
    barcode: "194252707241",
    imei: "358742084920193",
    condition: "ikinci el",
    sale_price: 28900,
    purchase_price: 22500,
    stock_quantity: 1,
    min_stock_level: 1,
    shelf_location: "İkinci El Vitrin A-3",
    description: "Kutulu, faturalı, TrueTone ve FaceID sorunsuz",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    battery_health: 86,
    storage: "128 GB",
    color: "Gece Yarısı",
    is_active: true,
  },
  {
    id: "pos-4",
    name: "Xiaomi Redmi Note 13 Pro 5G 256GB",
    brand: "Xiaomi",
    model: "Redmi Note 13 Pro",
    category: "Telefon",
    barcode: "6941812753218",
    imei: "867543021984210",
    condition: "sıfır",
    sale_price: 17200,
    purchase_price: 13500,
    stock_quantity: 4,
    min_stock_level: 2,
    shelf_location: "Giriş Seviye Cihaz Standı",
    description: "Genpa Garantili, 67W Turbo Şarj Adaptörü Kutuda",
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    battery_health: 100,
    storage: "256 GB",
    color: "Buz Mavisi",
    is_active: true,
  },
  {
    id: "pos-5",
    name: "Apple 20W USB-C Hızlı Güç Adaptörü",
    brand: "Apple",
    model: "MHJE3TU/A",
    category: "Aksesuar",
    barcode: "194252157015",
    imei: null,
    condition: "sıfır",
    sale_price: 849,
    purchase_price: 520,
    stock_quantity: 38,
    min_stock_level: 8,
    shelf_location: "Kasa Arkası Çekmece 1",
    description: "Orijinal Apple Türkiye Distribütör bandrollü kutu",
    image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
    is_active: true,
  },
  {
    id: "pos-6",
    name: "Spigen iPhone 15 Pro MagSafe Ultra Hybrid Kılıf",
    brand: "Spigen",
    model: "ACS06712",
    category: "Aksesuar",
    barcode: "8809897103284",
    imei: null,
    condition: "sıfır",
    sale_price: 749,
    purchase_price: 340,
    stock_quantity: 22,
    min_stock_level: 5,
    shelf_location: "Kılıf Standı Askı 4",
    description: "Air Cushion Teknolojili Darbe Emici Şeffaf Kılıf",
    image_url: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=600&q=80",
    is_active: true,
  },
  {
    id: "pos-7",
    name: "Baseus Tungsten Gold 100W Type-C Hızlı Şarj Kablosu",
    brand: "Baseus",
    model: "CAWJK-01",
    category: "Aksesuar",
    barcode: "6953156201842",
    imei: null,
    condition: "sıfır",
    sale_price: 390,
    purchase_price: 180,
    stock_quantity: 15,
    min_stock_level: 5,
    shelf_location: "Kablo Standı B-1",
    description: "Örgülü yıpranmaz kablo, 5A E-Marker çip destekli",
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    is_active: true,
  },
  {
    id: "pos-8",
    name: "Deji iPhone 11 Mucize Batarya 3510mAh Yüksek Kapasite",
    brand: "Deji",
    model: "DJ-IPH11-MAX",
    category: "Yedek Parça",
    barcode: "8681928374019",
    imei: null,
    condition: "sıfır",
    sale_price: 950,
    purchase_price: 490,
    stock_quantity: 18,
    min_stock_level: 6,
    shelf_location: "Teknik Servis Parça Dolabı C-2",
    description: "Orijinalinden %13 daha fazla kapasite, 1 yıl garantili",
    image_url: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80",
    is_active: true,
  },
  {
    id: "pos-9",
    name: "GX iPhone 13 Pro OLED Orijinal Kalite Ekran Paneli",
    brand: "GX",
    model: "GX-OLED-13P",
    category: "Yedek Parça",
    barcode: "8699102938475",
    imei: null,
    condition: "sıfır",
    sale_price: 4600,
    purchase_price: 3100,
    stock_quantity: 5,
    min_stock_level: 2,
    shelf_location: "Teknik Servis Ekran Rafı 3",
    description: "120Hz ProMotion uyumlu, TrueTone aktarımı destekli",
    image_url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80",
    is_active: true,
  },
  {
    id: "pos-10",
    name: "Apple AirPods Pro 2. Nesil (USB-C)",
    brand: "Apple",
    model: "MTJV3TU/A",
    category: "Aksesuar",
    barcode: "195949052520",
    imei: null,
    condition: "sıfır",
    sale_price: 8999,
    purchase_price: 7600,
    stock_quantity: 6,
    min_stock_level: 2,
    shelf_location: "Vitrin Kasa Arkası B-1",
    description: "Aktif Gürültü Engelleme, Adaptif Ses ve MagSafe kutu",
    image_url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
    is_active: true,
  },
  {
    id: "pos-11",
    name: "Anker 313 45W GaN Hızlı Şarj Cihazı",
    brand: "Anker",
    model: "A2677",
    category: "Aksesuar",
    barcode: "194644132484",
    imei: null,
    condition: "sıfır",
    sale_price: 1199,
    purchase_price: 750,
    stock_quantity: 12,
    min_stock_level: 4,
    shelf_location: "Şarj Standı A-3",
    description: "Samsung 45W Süper Hızlı Şarj 2.0 destekli kompakt başlık",
    image_url: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80",
    is_active: true,
  },
  {
    id: "pos-12",
    name: "Spigen Glas.tR EZ Fit Ekran Koruyucu (2'li Paket)",
    brand: "Spigen",
    model: "AGL06894",
    category: "Aksesuar",
    barcode: "8809897105028",
    imei: null,
    condition: "sıfır",
    sale_price: 599,
    purchase_price: 260,
    stock_quantity: 25,
    min_stock_level: 6,
    shelf_location: "Kırılmaz Cam Standı",
    description: "Otomatik hizalama tepsisi ile kolay ve kabarcıksız uygulama",
    image_url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
    is_active: true,
  },
]
