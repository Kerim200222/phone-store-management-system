import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import {
  GlobalSearchResponse,
  ServiceTicketSearchResult,
  ProductSearchResult,
  CustomerSearchResult,
  NavigationSearchResult,
} from "@/types/global-search"

// Hızlı Sayfa Gezinme Kısayolları
const NAVIGATION_ITEMS: NavigationSearchResult[] = [
  {
    id: "nav-pos",
    title: "POS Hızlı Satış",
    subtitle: "Barkodlu satış ve hızlı sepet işlemleri",
    type: "navigation",
    url: "/dashboard/pos",
    category: "Hızlı Eylem",
    badge: "Satış",
    badgeVariant: "default",
  },
  {
    id: "nav-inventory",
    title: "Ürün ve Stok Envanteri",
    subtitle: "Tüm cihazlar, yedek parçalar ve stok durumu",
    type: "navigation",
    url: "/dashboard/inventory",
    category: "Gezinme",
    badge: "Stok",
    badgeVariant: "secondary",
  },
  {
    id: "nav-inventory-new",
    title: "Yeni Ürün Ekle",
    subtitle: "Envantere yeni telefon, aksesuar veya parça kaydet",
    type: "navigation",
    url: "/dashboard/inventory/new",
    category: "Hızlı Eylem",
    badge: "Ekle",
    badgeVariant: "default",
  },
  {
    id: "nav-service",
    title: "Teknik Servis Yönetimi",
    subtitle: "Arızalı cihaz biletleri, tamir aşamaları ve teslimatlar",
    type: "navigation",
    url: "/dashboard/service",
    category: "Gezinme",
    badge: "Servis",
    badgeVariant: "secondary",
  },
  {
    id: "nav-service-new",
    title: "Yeni Servis Kaydı Aç",
    subtitle: "Müşteri cihazı için arıza fişi oluştur",
    type: "navigation",
    url: "/dashboard/service/new",
    category: "Hızlı Eylem",
    badge: "Kayıt",
    badgeVariant: "default",
  },
  {
    id: "nav-service-history",
    title: "Cihaz Geçmişi & IMEI Sorgulama",
    subtitle: "Bir cihazın tamir, alım ve satış geçmişini görüntüle",
    type: "navigation",
    url: "/dashboard/service/history",
    category: "Hızlı Eylem",
    badge: "IMEI",
    badgeVariant: "outline",
  },
  {
    id: "nav-transactions",
    title: "Kasa & Finansal Hareketler",
    subtitle: "Günlük gelir, gider ve nakit akışı raporu",
    type: "navigation",
    url: "/dashboard/transactions",
    category: "Gezinme",
    badge: "Kasa",
    badgeVariant: "secondary",
  },
  {
    id: "nav-purchases",
    title: "2. El Cihaz Alım",
    subtitle: "Müşteriden ikinci el cihaz satın alma sözleşmesi",
    type: "navigation",
    url: "/dashboard/purchases/new",
    category: "Hızlı Eylem",
    badge: "Alım",
    badgeVariant: "outline",
  },
  {
    id: "nav-customers",
    title: "Müşteri Rehberi",
    subtitle: "Kayıtlı müşteriler, telefon ve iletişim bilgileri",
    type: "navigation",
    url: "/dashboard/customers",
    category: "Gezinme",
    badge: "Müşteri",
    badgeVariant: "secondary",
  },
  {
    id: "nav-settings",
    title: "Sistem Ayarları",
    subtitle: "Mağaza parametreleri ve yetkilendirmeler",
    type: "navigation",
    url: "/dashboard/settings",
    category: "Gezinme",
    badge: "Ayar",
    badgeVariant: "outline",
  },
]

// Mock Fallback Verileri (Veritabanı offline / geliştirme ortamı testi için)
const MOCK_TICKETS: ServiceTicketSearchResult[] = [
  {
    id: "t-1",
    ticketNumber: "SRV-2026-001",
    title: "SRV-2026-001 — iPhone 13 Pro",
    subtitle: "Müşteri: Ahmet Yılmaz • Ekran Kırık",
    type: "service_ticket",
    url: "/dashboard/service/history?imei=358941098765432",
    customerName: "Ahmet Yılmaz",
    deviceModel: "iPhone 13 Pro",
    imei: "358941098765432",
    status: "Tamamlandı",
    badge: "Tamamlandı",
    badgeVariant: "default",
  },
  {
    id: "t-2",
    ticketNumber: "SRV-2026-002",
    title: "SRV-2026-002 — Samsung Galaxy S23",
    subtitle: "Müşteri: Ayşe Demir • Batarya Şişmesi",
    type: "service_ticket",
    url: "/dashboard/service/history?imei=359102948576102",
    customerName: "Ayşe Demir",
    deviceModel: "Samsung Galaxy S23",
    imei: "359102948576102",
    status: "Onarımda",
    badge: "Onarımda",
    badgeVariant: "secondary",
  },
  {
    id: "t-3",
    ticketNumber: "SRV-2026-003",
    title: "SRV-2026-003 — Xiaomi Redmi Note 12",
    subtitle: "Müşteri: Mehmet Kaya • Şarj Soketi Arızası",
    type: "service_ticket",
    url: "/dashboard/service/history?imei=867543029182736",
    customerName: "Mehmet Kaya",
    deviceModel: "Xiaomi Redmi Note 12",
    imei: "867543029182736",
    status: "Beklemede",
    badge: "Beklemede",
    badgeVariant: "outline",
  },
]

const MOCK_PRODUCTS: ProductSearchResult[] = [
  {
    id: "p-1",
    title: "iPhone 14 Pro 128GB Uzay Siyahı",
    subtitle: "IMEI: 354892019283741 • Stok: 4 Adet • 44.999 ₺",
    type: "product",
    url: "/dashboard/inventory",
    stockQuantity: 4,
    price: 44999,
    barcode: "194253401234",
    imei: "354892019283741",
    categoryName: "Telefon",
    badge: "4 Adet",
    badgeVariant: "outline",
  },
  {
    id: "p-2",
    title: "iPhone 12 Deji Mucize Batarya (2815mAh)",
    subtitle: "Barkod: 8681234567890 • Stok: 0 Adet (Tükendi) • 1.250 ₺",
    type: "product",
    url: "/dashboard/inventory",
    stockQuantity: 0,
    price: 1250,
    barcode: "8681234567890",
    imei: null,
    categoryName: "Yedek Parça",
    badge: "Tükendi",
    badgeVariant: "destructive",
  },
  {
    id: "p-3",
    title: "Apple 20W USB-C Orijinal Güç Adaptörü",
    subtitle: "Barkod: 194252157007 • Stok: 1 Adet • 700 ₺",
    type: "product",
    url: "/dashboard/inventory",
    stockQuantity: 1,
    price: 700,
    barcode: "194252157007",
    imei: null,
    categoryName: "Aksesuar",
    badge: "Kritik Stok (1)",
    badgeVariant: "destructive",
  },
  {
    id: "p-4",
    title: "Samsung Galaxy S23 5G 128GB",
    subtitle: "IMEI: 359102948576102 • Stok: 2 Adet • 29.999 ₺",
    type: "product",
    url: "/dashboard/inventory",
    stockQuantity: 2,
    price: 29999,
    barcode: "8806094770001",
    imei: "359102948576102",
    categoryName: "Telefon",
    badge: "2 Adet",
    badgeVariant: "outline",
  },
]

const MOCK_CUSTOMERS: CustomerSearchResult[] = [
  {
    id: "c-1",
    title: "Ahmet Yılmaz",
    subtitle: "Tel: 0532 555 44 33 • ahmet.yilmaz@gmail.com",
    type: "customer",
    url: "/dashboard/customers",
    phone: "0532 555 44 33",
    email: "ahmet.yilmaz@gmail.com",
    badge: "Müşteri",
    badgeVariant: "secondary",
  },
  {
    id: "c-2",
    title: "Ayşe Demir",
    subtitle: "Tel: 0544 222 11 00 • ayse.demir@hotmail.com",
    type: "customer",
    url: "/dashboard/customers",
    phone: "0544 222 11 00",
    email: "ayse.demir@hotmail.com",
    badge: "Müşteri",
    badgeVariant: "secondary",
  },
  {
    id: "c-3",
    title: "Mehmet Kaya",
    subtitle: "Tel: 0505 999 88 77 • mehmet.kaya@outlook.com",
    type: "customer",
    url: "/dashboard/customers",
    phone: "0505 999 88 77",
    email: "mehmet.kaya@outlook.com",
    badge: "Müşteri",
    badgeVariant: "secondary",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() || ""

  // Boş veya çok kısa sorgularda sadece hızlı navigasyon kısayollarını dön
  if (query.length < 2) {
    const response: GlobalSearchResponse = {
      query,
      totalCount: NAVIGATION_ITEMS.length,
      results: {
        tickets: [],
        products: [],
        customers: [],
        navigation: NAVIGATION_ITEMS.slice(0, 6),
      },
    }
    return NextResponse.json(response)
  }

  const supabase = createClient()
  const lowerQuery = query.toLowerCase()

  // 1. Navigasyon Filtreleme
  const matchedNav = NAVIGATION_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.subtitle.toLowerCase().includes(lowerQuery) ||
      item.badge?.toLowerCase().includes(lowerQuery)
  )

  let tickets: ServiceTicketSearchResult[] = []
  let products: ProductSearchResult[] = []
  let customers: CustomerSearchResult[] = []

  try {
    // 2. Supabase Paralel Çoklu Arama
    const [ticketsRes, productsRes, customersRes] = await Promise.allSettled([
      // A) Biletler (Bilet No, Müşteri Adı, Cihaz Modeli, IMEI)
      supabase
        .from("service_tickets")
        .select("id, ticket_number, customer_name, device_model, imei, status, fault_description")
        .or(
          `ticket_number.ilike.%${query}%,customer_name.ilike.%${query}%,device_model.ilike.%${query}%,imei.ilike.%${query}%`
        )
        .limit(6),

      // B) Ürünler (İsim, Barkod, IMEI, Marka, Model)
      supabase
        .from("products")
        .select("id, name, barcode, imei, brand, model, stock_quantity, sale_price, category_id, categories(name)")
        .or(
          `name.ilike.%${query}%,barcode.ilike.%${query}%,imei.ilike.%${query}%,brand.ilike.%${query}%,model.ilike.%${query}%`
        )
        .limit(6),

      // C) Müşteriler (İsim, Telefon, E-posta)
      supabase
        .from("customers")
        .select("id, name, phone, email")
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(6),
    ])

    // Sonuçları Ayrıştırma - Biletler
    if (ticketsRes.status === "fulfilled" && !ticketsRes.value.error && ticketsRes.value.data) {
      tickets = ticketsRes.value.data.map((t: any) => {
        const ticketNum = t.ticket_number || `Bilet #${t.id.slice(0, 8)}`
        return {
          id: String(t.id),
          ticketNumber: ticketNum,
          title: `${ticketNum} — ${t.device_model || "Cihaz"}`,
          subtitle: `Müşteri: ${t.customer_name || "Bilinmiyor"}${t.imei ? ` • IMEI: ${t.imei}` : ""}`,
          type: "service_ticket" as const,
          url: t.imei
            ? `/dashboard/service/history?imei=${encodeURIComponent(t.imei)}`
            : `/dashboard/service`,
          customerName: t.customer_name || "",
          deviceModel: t.device_model || "",
          imei: t.imei || null,
          status: t.status || "Beklemede",
          badge: t.status || "Servis",
          badgeVariant: t.status === "Tamamlandı" ? "default" : "secondary",
        }
      })
    }

    // Sonuçları Ayrıştırma - Ürünler
    if (productsRes.status === "fulfilled" && !productsRes.value.error && productsRes.value.data) {
      products = productsRes.value.data.map((p: any) => {
        const qty = Number(p.stock_quantity ?? 0)
        const categoryName = p.categories?.name || "Ürün"
        const isOutOfStock = qty <= 0
        const isLow = qty < 5

        return {
          id: String(p.id),
          title: `${p.name} ${p.brand ? `(${p.brand})` : ""}`.trim(),
          subtitle: `${categoryName} • ${p.imei ? `IMEI: ${p.imei} • ` : p.barcode ? `Barkod: ${p.barcode} • ` : ""}Fiyat: ₺${Number(p.sale_price || 0).toLocaleString("tr-TR")}`,
          type: "product" as const,
          url: p.imei
            ? `/dashboard/service/history?imei=${encodeURIComponent(p.imei)}`
            : "/dashboard/inventory",
          stockQuantity: qty,
          price: Number(p.sale_price || 0),
          barcode: p.barcode || null,
          imei: p.imei || null,
          categoryName,
          badge: isOutOfStock
            ? "Tükendi"
            : isLow
            ? `Kritik (${qty})`
            : `Stok: ${qty}`,
          badgeVariant: isOutOfStock ? "destructive" : isLow ? "destructive" : "outline",
        }
      })
    }

    // Sonuçları Ayrıştırma - Müşteriler
    if (customersRes.status === "fulfilled" && !customersRes.value.error && customersRes.value.data) {
      customers = customersRes.value.data.map((c: any) => ({
        id: String(c.id),
        title: c.name || "İsimsiz Müşteri",
        subtitle: `Tel: ${c.phone || "—"}${c.email ? ` • ${c.email}` : ""}`,
        type: "customer" as const,
        url: "/dashboard/customers",
        phone: c.phone || undefined,
        email: c.email || undefined,
        badge: "Müşteri",
        badgeVariant: "secondary",
      }))
    }
  } catch (err) {
    console.warn("Global Search Supabase sorgusunda hata:", err)
  }

  // 3. Fallback / Mock Eşleme (Canlı veritabanında sonuç yoksa veya mock testinde)
  if (tickets.length === 0) {
    tickets = MOCK_TICKETS.filter(
      (t) =>
        t.title.toLowerCase().includes(lowerQuery) ||
        t.subtitle.toLowerCase().includes(lowerQuery) ||
        t.customerName.toLowerCase().includes(lowerQuery) ||
        t.deviceModel.toLowerCase().includes(lowerQuery) ||
        (t.imei && t.imei.includes(query)) ||
        t.ticketNumber.toLowerCase().includes(lowerQuery)
    )
  }

  if (products.length === 0) {
    products = MOCK_PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.subtitle.toLowerCase().includes(lowerQuery) ||
        (p.barcode && p.barcode.includes(query)) ||
        (p.imei && p.imei.includes(query)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(lowerQuery))
    )
  }

  if (customers.length === 0) {
    customers = MOCK_CUSTOMERS.filter(
      (c) =>
        c.title.toLowerCase().includes(lowerQuery) ||
        c.subtitle.toLowerCase().includes(lowerQuery) ||
        (c.phone && c.phone.includes(query)) ||
        (c.email && c.email.toLowerCase().includes(lowerQuery))
    )
  }

  const totalCount =
    tickets.length + products.length + customers.length + matchedNav.length

  const response: GlobalSearchResponse = {
    query,
    totalCount,
    results: {
      tickets,
      products,
      customers,
      navigation: matchedNav,
    },
  }

  return NextResponse.json(response)
}
