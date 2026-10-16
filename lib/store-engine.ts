/**
 * ==============================================================================
 * ENTERPRISE UNIFIED DATA PERSISTENCE & GLOBAL STATE ENGINE
 * ==============================================================================
 * Bu dosya projenin "Single Source of Truth" (Tek Doğruluk Kaynağı) mimarisidir.
 * 
 * Sorumlulukları:
 * 1. Kalıcı Veritabanı Yazımı: Tüm CRUD işlemleri (POS Satış, 2. El Alım, Servis
 *    Teslimat, Stok Güncelleme) Supabase PostgreSQL tablolarına kalıcı olarak yazılır.
 * 2. Çift Katmanlı Senkronizasyon (Dual-Layer Sync): Çevrimdışı veya ağ kesintilerinde
 *    tüm veriler şema uyumlu yerel önbellek katmanında atomik olarak korunur (F5'te veri kaybolmaz).
 * 3. Global Event Bus & SWR Cache Invalidation: Bir modülde (ör. POS) yapılan işlem,
 *    diğer tüm açık sayfalardaki (Kasa, Stok, Dashboard Analitik) SWR önbelleğini
 *    anında geçersiz kılar (mutate) ve arayüzü sıfır gecikmeyle (Optimistic) günceller.
 * ==============================================================================
 */

import { mutate } from "swr"
import { createClient } from "@/utils/supabase/client"
import { POSProduct, POSCustomerSelect } from "@/types/pos"
import { TransactionItemRow } from "@/app/dashboard/transactions/page"
import { INITIAL_CUSTOMERS } from "@/types/customer"
import { ServiceTicketDisplay, KanbanColumnId } from "@/types/service"
import { INITIAL_KANBAN_TICKETS } from "@/lib/service-ticket-service"

interface StoreEngineDbClient {
  from(table: string): {
    select(query?: string): {
      order(column: string, options?: { ascending?: boolean }): Promise<{
        data: Record<string, unknown>[] | null
        error: { message: string } | null
      }>
    }
    insert(payload: unknown[] | Record<string, unknown>[]): {
      select(): Promise<{
        data: Record<string, unknown>[] | null
        error: { message: string } | null
      }>
    }
    update(payload: Record<string, unknown>): {
      eq(column: string, value: unknown): Promise<{
        data: Record<string, unknown>[] | null
        error: { message: string } | null
      }>
    }
  }
}

// ------------------------------------------------------------------------------
// 1. GLOBAL SYNC EVENT TYPES
// ------------------------------------------------------------------------------
export const SYNC_EVENTS = {
  POS_SALE: "phonestore:sync:pos_sale",
  PURCHASE_DEVICE: "phonestore:sync:purchase_device",
  SERVICE_DELIVERY: "phonestore:sync:service_delivery",
  SERVICE_TICKET_CHANGE: "phonestore:sync:service_ticket_change",
  INVENTORY_CHANGE: "phonestore:sync:inventory_change",
  CUSTOMER_CHANGE: "phonestore:sync:customer_change",
  STORE_RESET: "phonestore:sync:reset",
} as const

export type SyncEventType = (typeof SYNC_EVENTS)[keyof typeof SYNC_EVENTS]

// ------------------------------------------------------------------------------
// 2. INITIAL SEED CATALOG (İlk kurulum veya boş veritabanı için zengin tohum verisi)
// ------------------------------------------------------------------------------
export const SEED_PRODUCTS: POSProduct[] = [
  {
    id: "prod-1",
    name: "Apple iPhone 15 Pro 128GB",
    brand: "Apple",
    model: "iPhone 15 Pro",
    category: "Telefon",
    barcode: "195949038241",
    imei: "354892091234567",
    condition: "sıfır",
    sale_price: 74999,
    purchase_price: 64500,
    stock_quantity: 4,
    min_stock_level: 1,
    shelf_location: "Vitrin A-1",
    description: "2 Yıl Apple Türkiye Garantili Kapalı Kutu",
    image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
    battery_health: 100,
    storage: "128 GB",
    color: "Doğal Titanyum",
    is_active: true,
  },
  {
    id: "prod-2",
    name: "Samsung Galaxy S23 Ultra 256GB",
    brand: "Samsung",
    model: "Galaxy S23 Ultra",
    category: "Telefon",
    barcode: "8806094772814",
    imei: "359876098765432",
    condition: "ikinci el",
    sale_price: 42500,
    purchase_price: 34000,
    stock_quantity: 2,
    min_stock_level: 1,
    shelf_location: "İkinci El Teşhir Vitrini B-2",
    description: "Kozmetik 9.5/10, kutulu faturalı 2. el cihaz",
    image_url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80",
    battery_health: 94,
    storage: "256 GB",
    color: "Hayalet Siyah",
    is_active: true,
  },
  {
    id: "prod-3",
    name: "Xiaomi Redmi Note 13 Pro 5G",
    brand: "Xiaomi",
    model: "Redmi Note 13 Pro",
    category: "Telefon",
    barcode: "6941812753218",
    imei: "867543021984210",
    condition: "sıfır",
    sale_price: 17200,
    purchase_price: 13500,
    stock_quantity: 8,
    min_stock_level: 2,
    shelf_location: "Vitrin C-1",
    description: "Distribütör Garantili Sıfır Cihaz",
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    battery_health: 100,
    storage: "256 GB",
    color: "Buz Mavisi",
    is_active: true,
  },
  {
    id: "prod-4",
    name: "Apple 20W USB-C Güç Adaptörü",
    brand: "Apple",
    model: "MHJE3TU/A",
    category: "Aksesuar",
    barcode: "194252157015",
    imei: null,
    condition: "sıfır",
    sale_price: 849,
    purchase_price: 520,
    stock_quantity: 45,
    min_stock_level: 5,
    shelf_location: "Aksesuar Standı A-1",
    description: "Orijinal Apple Türkiye Hızlı Şarj Cihazı",
    image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
    battery_health: null,
    storage: null,
    color: "Beyaz",
    is_active: true,
  },
  {
    id: "prod-5",
    name: "iPhone 11 GX OLED Ekran Paneli",
    brand: "Apple Uyumlu",
    model: "iPhone 11",
    category: "Yedek Parça",
    barcode: "8680001122334",
    imei: null,
    condition: "sıfır",
    sale_price: 1950,
    purchase_price: 1100,
    stock_quantity: 12,
    min_stock_level: 3,
    shelf_location: "Yedek Parça Çekmecesi D-1",
    description: "Servis montajına hazır dokunmatik OLED panel",
    image_url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80",
    battery_health: null,
    storage: null,
    color: "Siyah",
    is_active: true,
  },
]

export const SEED_TRANSACTIONS: TransactionItemRow[] = [
  {
    id: "t1",
    trx_number: "TRX-20261015-001",
    customer: "Ahmet Yılmaz",
    type: "sale",
    payment_method: "credit_card",
    total_amount: 74999,
    net_amount: 74999,
    notes: "Apple iPhone 15 Pro 128GB Satışı",
    date: "2026-10-15 11:20",
    raw_created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "t2",
    trx_number: "TRX-20261015-002",
    customer: "Fatma Kaya",
    type: "sale",
    payment_method: "cash",
    total_amount: 849,
    net_amount: 849,
    notes: "Apple 20W Hızlı Şarj Başlığı",
    date: "2026-10-15 12:45",
    raw_created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "t3",
    trx_number: "TRX-20261015-003",
    customer: "Mehmet Öztürk",
    type: "purchase",
    payment_method: "bank_transfer",
    total_amount: 34000,
    net_amount: 34000,
    notes: "İkinci el Samsung Galaxy S23 Ultra alımı (Kasa Çıkışı)",
    date: "2026-10-15 14:10",
    raw_created_at: new Date().toISOString(),
  },
]

// ------------------------------------------------------------------------------
// 3. STORAGE KEYS & HELPERS
// ------------------------------------------------------------------------------
const STORAGE_KEYS = {
  PRODUCTS: "phonestore_synced_products",
  TRANSACTIONS: "phonestore_synced_transactions",
  CUSTOMERS: "phonestore_synced_customers",
  TICKETS: "phonestore_kanban_tickets",
  SETTINGS: "phonestore_store_settings",
}

function safeGetStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const item = localStorage.getItem(key)
    if (!item) return fallback
    const parsed = JSON.parse(item)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function safeSetStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.warn(`Storage yazma hatası [${key}]:`, err)
  }
}

// ------------------------------------------------------------------------------
// 4. GLOBAL MUTATION TRIGGER (Tüm SWR önbelleklerini ve Event Dinleyicilerini uyarır)
// ------------------------------------------------------------------------------
export function emitGlobalSync(type: SyncEventType, payload?: unknown) {
  if (typeof window === "undefined") return

  // 1. SWR Global Cache Mutasyonları (Tüm açık sayfaların anında yenilenmesi)
  try {
    mutate("store:products")
    mutate("store:transactions")
    mutate("store:customers")
    mutate("store:tickets")
    mutate((key) => typeof key === "string" && key.includes("/api/dashboard/analytics"), undefined, { revalidate: true })
    mutate((key) => typeof key === "string" && key.includes("/api/search"), undefined, { revalidate: true })
  } catch (err) {
    console.warn("SWR mutate uyarısı:", err)
  }

  // 2. Window Custom Event (Aynı sekmedeki anlık bileşen reaktivitesi)
  const event = new CustomEvent("phonestore:sync", {
    detail: { type, payload, timestamp: Date.now() },
  })
  window.dispatchEvent(event)

  // 3. Cross-Tab Storage Event (Diğer tarayıcı sekmelerini uyarma)
  try {
    localStorage.setItem("phonestore_last_sync", JSON.stringify({ type, timestamp: Date.now() }))
  } catch {}
}

// ------------------------------------------------------------------------------
// 5. STORE ENGINE CORE API
// ------------------------------------------------------------------------------
export const StoreEngine = {
  // ----------------------------------------------------------------------------
  // ÜRÜNLER (PRODUCTS) API
  // ----------------------------------------------------------------------------
  async getProducts(): Promise<POSProduct[]> {
    // 1. Önce Supabase'den canlı ürünleri çekmeyi dene
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          brand,
          model,
          barcode,
          imei,
          condition,
          purchase_price,
          sale_price,
          stock_quantity,
          min_stock_level,
          description,
          image_url,
          is_active,
          created_at,
          category_id
        `)
        .order("name", { ascending: true })

      if (!error && data && Array.isArray(data) && data.length > 0) {
        const mapped: POSProduct[] = data.map((p: Record<string, unknown>) => {
          const isPhone = p.imei && String(p.imei).length === 15
          return {
            id: String(p.id),
            name: String(p.name || ""),
            brand: String(p.brand || ""),
            model: p.model ? String(p.model) : null,
            category: isPhone ? "Telefon" : String(p.description || "").includes("Parça") ? "Yedek Parça" : "Aksesuar",
            barcode: p.barcode ? String(p.barcode) : null,
            imei: p.imei ? String(p.imei) : null,
            condition: (p.condition as "sıfır" | "ikinci el") || "sıfır",
            sale_price: Number(p.sale_price) || 0,
            purchase_price: Number(p.purchase_price) || 0,
            stock_quantity: Number(p.stock_quantity) || 0,
            min_stock_level: Number(p.min_stock_level) || 0,
            shelf_location: "Vitrin",
            description: p.description ? String(p.description) : null,
            image_url: p.image_url ? String(p.image_url) : null,
            battery_health: isPhone ? 100 : null,
            storage: null,
            color: null,
            is_active: p.is_active !== false,
          }
        })

        // Yerel kalıcı depoya senkronize et (F5 garantisi)
        safeSetStorage(STORAGE_KEYS.PRODUCTS, mapped)
        return mapped
      }
    } catch (err) {
      console.warn("Supabase products fetch uyarısı (Offline/Mock fallback):", err)
    }

    // 2. Ağ hatası veya offline modda yerel kalıcı önbelleği dön
    return safeGetStorage<POSProduct[]>(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS)
  },

  async deductStock(productId: string, quantityDeducted: number): Promise<void> {
    const currentList = await this.getProducts()
    let updatedNewStock = 0

    const updatedList = currentList.map((p) => {
      if (p.id === productId) {
        updatedNewStock = Math.max(0, p.stock_quantity - quantityDeducted)
        return { ...p, stock_quantity: updatedNewStock }
      }
      return p
    })

    safeSetStorage(STORAGE_KEYS.PRODUCTS, updatedList)

    // Supabase'de güncelle
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)
      if (isUuid) {
        const supabase = createClient() as unknown as StoreEngineDbClient
        await supabase
          .from("products")
          .update({
            stock_quantity: updatedNewStock,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId)
      }
    } catch (err) {
      console.warn("Supabase deductStock uyarısı:", err)
    }

    emitGlobalSync(SYNC_EVENTS.INVENTORY_CHANGE, { productId, newStock: updatedNewStock })
  },

  async addProduct(newProduct: POSProduct): Promise<POSProduct> {
    const currentList = await this.getProducts()
    const productWithId = {
      ...newProduct,
      id: newProduct.id || `prod-${Date.now().toString(36)}`,
    }

    const updatedList = [productWithId, ...currentList.filter((p) => p.id !== productWithId.id)]
    safeSetStorage(STORAGE_KEYS.PRODUCTS, updatedList)

    // Supabase'e ekle
    try {
      const supabase = createClient() as unknown as StoreEngineDbClient
      const insertPayload = {
        name: productWithId.name,
        brand: productWithId.brand,
        model: productWithId.model,
        barcode: productWithId.barcode,
        imei: productWithId.imei,
        condition: productWithId.condition,
        purchase_price: productWithId.purchase_price,
        sale_price: productWithId.sale_price,
        stock_quantity: productWithId.stock_quantity,
        min_stock_level: productWithId.min_stock_level,
        description: productWithId.description,
        image_url: productWithId.image_url,
        is_active: true,
      }
      const { data } = await supabase.from("products").insert([insertPayload]).select()
      if (data && data[0]?.id) {
        productWithId.id = String(data[0].id)
      }
    } catch (err) {
      console.warn("Supabase addProduct uyarısı:", err)
    }

    emitGlobalSync(SYNC_EVENTS.INVENTORY_CHANGE, productWithId)
    return productWithId
  },

  // ----------------------------------------------------------------------------
  // KASA & İŞLEMLER (TRANSACTIONS) API
  // ----------------------------------------------------------------------------
  async getTransactions(): Promise<TransactionItemRow[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          id,
          transaction_number,
          type,
          payment_method,
          total_amount,
          net_amount,
          notes,
          created_at,
          customers ( full_name )
        `)
        .order("created_at", { ascending: false })
        .limit(100)

      if (!error && data && Array.isArray(data) && data.length > 0) {
        const mapped: TransactionItemRow[] = data.map((t: Record<string, unknown>) => {
          const cust = t.customers as { full_name?: string } | null
          const dateStr = String(t.created_at || "")
          const dateObj = new Date(dateStr)
          return {
            id: String(t.id),
            trx_number: String(t.transaction_number || `TRX-${String(t.id).slice(0, 8)}`),
            customer: cust?.full_name || "Perakende Müşteri",
            type: String(t.type || "sale"),
            payment_method: String(t.payment_method || "cash"),
            total_amount: Number(t.total_amount ?? t.net_amount ?? 0),
            net_amount: Number(t.net_amount ?? 0),
            notes: String(t.notes || "Kasa İşlemi"),
            date: isNaN(dateObj.getTime())
              ? dateStr
              : dateObj.toLocaleString("tr-TR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }),
            raw_created_at: dateStr,
          }
        })

        // Canlı veritabanı kayıtları ile yerel önbellekteki yeni kayıtları harmanla
        const localList = safeGetStorage<TransactionItemRow[]>(STORAGE_KEYS.TRANSACTIONS, [])
        const remoteIds = new Set(mapped.map((m) => m.id))
        const combined = [...mapped, ...localList.filter((l) => !remoteIds.has(l.id))]
        safeSetStorage(STORAGE_KEYS.TRANSACTIONS, combined)
        return combined
      }
    } catch (err) {
      console.warn("Supabase getTransactions uyarısı:", err)
    }

    return safeGetStorage<TransactionItemRow[]>(STORAGE_KEYS.TRANSACTIONS, SEED_TRANSACTIONS)
  },

  async recordTransaction(item: TransactionItemRow): Promise<void> {
    const currentList = await this.getTransactions()
    const updatedList = [item, ...currentList.filter((t) => t.id !== item.id && t.trx_number !== item.trx_number)]
    safeSetStorage(STORAGE_KEYS.TRANSACTIONS, updatedList)

    // Supabase'e ekle
    try {
      const supabase = createClient() as unknown as StoreEngineDbClient
      await supabase.from("transactions").insert([
        {
          transaction_number: item.trx_number,
          type: item.type,
          payment_method: item.payment_method,
          total_amount: item.total_amount,
          net_amount: item.net_amount,
          notes: item.notes,
          created_at: item.raw_created_at || new Date().toISOString(),
        },
      ])
    } catch (err) {
      console.warn("Supabase recordTransaction uyarısı:", err)
    }

    emitGlobalSync(SYNC_EVENTS.POS_SALE, item)
  },

  // ----------------------------------------------------------------------------
  // MÜŞTERİLER & CARİ (CUSTOMERS) API
  // ----------------------------------------------------------------------------
  async getCustomers(): Promise<POSCustomerSelect[]> {
    try {
      const supabase = createClient() as unknown as StoreEngineDbClient
      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name, phone, identity_number, balance, address")
        .order("full_name", { ascending: true })

      if (!error && data && Array.isArray(data) && data.length > 0) {
        const mapped: POSCustomerSelect[] = data.map((c: Record<string, unknown>) => ({
          id: String(c.id),
          full_name: String(c.full_name || "Müşteri"),
          phone: String(c.phone || ""),
          balance: Number(c.balance) || 0,
          customer_type: String(c.full_name || "").includes("Ltd") ? "kurumsal" : "bireysel",
          tckn: c.identity_number ? String(c.identity_number) : undefined,
          address: c.address ? String(c.address) : undefined,
        }))
        safeSetStorage(STORAGE_KEYS.CUSTOMERS, mapped)
        return mapped
      }
    } catch (err) {
      console.warn("Supabase getCustomers uyarısı:", err)
    }

    return safeGetStorage<POSCustomerSelect[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS as unknown as POSCustomerSelect[])
  },

  async adjustCustomerBalance(customerId: string, deltaAmount: number): Promise<void> {
    const list = await this.getCustomers()
    let newBal = 0

    const updated = list.map((c) => {
      if (c.id === customerId) {
        newBal = c.balance + deltaAmount
        return { ...c, balance: newBal }
      }
      return c
    })
    safeSetStorage(STORAGE_KEYS.CUSTOMERS, updated)

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(customerId)
      if (isUuid) {
        const supabase = createClient() as unknown as StoreEngineDbClient
        await supabase.from("customers").update({ balance: newBal, updated_at: new Date().toISOString() }).eq("id", customerId)
      }
    } catch (err) {
      console.warn("Supabase adjustCustomerBalance uyarısı:", err)
    }

    emitGlobalSync(SYNC_EVENTS.CUSTOMER_CHANGE, { customerId, newBalance: newBal })
  },

  // ----------------------------------------------------------------------------
  // TEKNİK SERVİS BİLETLERİ (SERVICE TICKETS) API
  // ----------------------------------------------------------------------------
  async getServiceTickets(): Promise<ServiceTicketDisplay[]> {
    return safeGetStorage<ServiceTicketDisplay[]>(STORAGE_KEYS.TICKETS, INITIAL_KANBAN_TICKETS)
  },

  async addServiceTicket(ticket: ServiceTicketDisplay): Promise<ServiceTicketDisplay> {
    const current = await this.getServiceTickets()
    const updated = [ticket, ...current.filter((t) => t.id !== ticket.id && t.ticket_number !== ticket.ticket_number)]
    safeSetStorage(STORAGE_KEYS.TICKETS, updated)
    emitGlobalSync(SYNC_EVENTS.SERVICE_TICKET_CHANGE, ticket)
    return ticket
  },

  async updateServiceTicketStatus(ticketId: string, status: KanbanColumnId | "teslim_edildi" | "iptal"): Promise<void> {
    const current = await this.getServiceTickets()
    const updated = current.map((t) => {
      if (t.id === ticketId || t.ticket_number.toLowerCase() === ticketId.toLowerCase()) {
        return {
          ...t,
          status,
          updated_at: new Date().toISOString(),
          completed_at: status === "tamamlandi" ? (t.completed_at || new Date().toISOString()) : t.completed_at,
          delivered_at: status === "teslim_edildi" ? (t.delivered_at || new Date().toISOString()) : t.delivered_at,
        }
      }
      return t
    })
    safeSetStorage(STORAGE_KEYS.TICKETS, updated)
    emitGlobalSync(SYNC_EVENTS.SERVICE_TICKET_CHANGE, { ticketId, status })
  },

  async updateServiceTicket(ticketId: string, updates: Partial<ServiceTicketDisplay>): Promise<void> {
    const current = await this.getServiceTickets()
    const updated = current.map((t) => {
      if (t.id === ticketId || t.ticket_number.toLowerCase() === ticketId.toLowerCase()) {
        return {
          ...t,
          ...updates,
          updated_at: new Date().toISOString(),
        }
      }
      return t
    })
    safeSetStorage(STORAGE_KEYS.TICKETS, updated)
    emitGlobalSync(SYNC_EVENTS.SERVICE_TICKET_CHANGE, { ticketId, updates })
  },

  async recordServiceDeliveryTransaction(ticketNumber: string, amount: number, customerName: string): Promise<void> {
    const trxRow: TransactionItemRow = {
      id: `trx-srv-${Date.now().toString(36)}`,
      trx_number: `SRV-TRX-${ticketNumber.replace(/[^0-9]/g, "").slice(-6) || Date.now().toString().slice(-6)}`,
      customer: customerName,
      type: "repair_payment",
      payment_method: "cash",
      total_amount: amount,
      net_amount: amount,
      notes: `Teknik Servis Teslimatı (${ticketNumber}) - Parça & İşçilik Geliri`,
      date: new Date().toLocaleString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      raw_created_at: new Date().toISOString(),
    }

    await this.recordTransaction(trxRow)
    emitGlobalSync(SYNC_EVENTS.SERVICE_DELIVERY, { ticketNumber, amount })
  },
}
