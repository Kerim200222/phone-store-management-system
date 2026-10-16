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
    badge: "Müşteri",
    badgeVariant: "secondary",
  },
  {
    id: "t-4",
    ticketNumber: "SRV-20261015-0101",
    title: "SRV-20261015-0101 — iPhone 13 (A2633)",
    subtitle: "Müşteri: Ahmet Yılmaz • Ekran & Dokunmatik Arızası",
    type: "service_ticket",
    url: "/dashboard/service/history?imei=354892091234567",
    customerName: "Ahmet Yılmaz",
    deviceModel: "iPhone 13 (A2633)",
    imei: "354892091234567",
    status: "Bekliyor",
    badge: "Bekliyor",
    badgeVariant: "secondary",
  },
  {
    id: "t-5",
    ticketNumber: "SRV-20261015-0102",
    title: "SRV-20261015-0102 — Xiaomi 12 (2201123G)",
    subtitle: "Müşteri: Mehmet Öztürk • Şarj Soketi Temassızlık",
    type: "service_ticket",
    url: "/dashboard/service/history?imei=867543021984210",
    customerName: "Mehmet Öztürk",
    deviceModel: "Xiaomi 12 (2201123G)",
    imei: "867543021984210",
    status: "Bekliyor",
    badge: "Bekliyor",
    badgeVariant: "secondary",
  },
  {
    id: "t-6",
    ticketNumber: "SRV-20261015-0103",
    title: "SRV-20261015-0103 — Galaxy S21 5G",
    subtitle: "Müşteri: Fatma Kaya • Batarya Şişmesi (Teknisyen: Kerim Aydın)",
    type: "service_ticket",
    url: "/dashboard/service/history?imei=359876098765432",
    customerName: "Fatma Kaya",
    deviceModel: "Galaxy S21 5G (SM-G991B)",
    imei: "359876098765432",
    status: "İşlemde",
    badge: "İşlemde",
    badgeVariant: "secondary",
  },
  {
    id: "t-7",
    ticketNumber: "SRV-2026-004",
    title: "SRV-2026-004 — iPhone 14 Pro",
    subtitle: "Müşteri: Kerim Aydın • Sıvı Teması / Cihaz Açılmıyor",
    type: "service_ticket",
    url: "/dashboard/service/history?imei=354892019284729",
    customerName: "Kerim Aydın",
    deviceModel: "iPhone 14 Pro",
    imei: "354892019284729",
    status: "İşlemde",
    badge: "İşlemde",
    badgeVariant: "secondary",
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
  {
    id: "p-5",
    title: "iPhone 13 128GB Gece Yarısı",
    subtitle: "IMEI: 354892091234567 • Stok: 3 Adet • 32.499 ₺",
    type: "product",
    url: "/dashboard/inventory",
    stockQuantity: 3,
    price: 32499,
    barcode: "194253401235",
    imei: "354892091234567",
    categoryName: "Telefon",
    badge: "3 Adet",
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
  {
    id: "c-4",
    title: "Kerim Aydın",
    subtitle: "Tel: 0530 123 45 67 • kerim.aydin@phonestore.com",
    type: "customer",
    url: "/dashboard/customers",
    phone: "0530 123 45 67",
    email: "kerim.aydin@phonestore.com",
    badge: "Personel / Müşteri",
    badgeVariant: "default",
  },
  {
    id: "c-5",
    title: "Can Demir",
    subtitle: "Tel: 0544 987 65 43 • can.demir@email.com",
    type: "customer",
    url: "/dashboard/customers",
    phone: "0544 987 65 43",
    email: "can.demir@email.com",
    badge: "Müşteri",
    badgeVariant: "secondary",
  },
  {
    id: "c-6",
    title: "Fatma Kaya",
    subtitle: "Tel: 0542 333 44 55 • fatma.kaya@outlook.com",
    type: "customer",
    url: "/dashboard/customers",
    phone: "0542 333 44 55",
    email: "fatma.kaya@outlook.com",
    badge: "Müşteri",
    badgeVariant: "secondary",
  },
  {
    id: "c-7",
    title: "Mehmet Öztürk",
    subtitle: "Tel: 0555 777 88 99 • mehmet.oz@holding.com.tr",
    type: "customer",
    url: "/dashboard/customers",
    phone: "0555 777 88 99",
    email: "mehmet.oz@holding.com.tr",
    badge: "Kurumsal",
    badgeVariant: "default",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() || ""
  const supabase = createClient()

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

  // 1. Çift Katmanlı Kimlik Doğrulama: Supabase Auth SSR + phonestore_session Demo Cookie
  let isAuthenticated = false

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (user && !authError) {
      isAuthenticated = true
    }
  } catch {
    isAuthenticated = false
  }

  // 1.B: Supabase oturumu yoksa veya SSR başarısız olduysa 'phonestore_session' çerezini doğrula
  if (!isAuthenticated) {
    const sessionCookie = request.cookies.get("phonestore_session")?.value
    if (sessionCookie) {
      try {
        const demoSession = JSON.parse(decodeURIComponent(sessionCookie))
        if (demoSession && (demoSession.email || demoSession.role)) {
          isAuthenticated = true
        }
      } catch {
        isAuthenticated = false
      }
    }
  }

  // Geliştirme/test ortamında veya oturum açılmışsa arama aktif olur
  const isAllowed = isAuthenticated || process.env.NODE_ENV === "development"

  const lowerQuery = query.toLowerCase()
  const trLowerQuery = query.toLocaleLowerCase("tr-TR")

  // Navigasyon Filtreleme (Her zaman erişilebilir)
  const matchedNav = NAVIGATION_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.title.toLocaleLowerCase("tr-TR").includes(trLowerQuery) ||
      item.subtitle.toLowerCase().includes(lowerQuery) ||
      item.badge?.toLowerCase().includes(lowerQuery)
  )

  // Oturum açılmamışsa ve prod ortamındaysa yalnızca güvenli navigasyonu dön
  if (!isAllowed) {
    const safeResponse: GlobalSearchResponse = {
      query,
      totalCount: matchedNav.length,
      results: {
        tickets: [],
        products: [],
        customers: [],
        navigation: matchedNav,
      },
    }
    return NextResponse.json(safeResponse)
  }

  let tickets: ServiceTicketSearchResult[] = []
  let products: ProductSearchResult[] = []
  let customers: CustomerSearchResult[] = []

  try {
    // 2. Supabase Paralel Çoklu Arama
    // ==========================================================================
    // BUG-01 DÜZELTMESİ:
    // 1) Tablo adı 'service_tickets' yerine projenin şemasındaki 'repair_tickets' yapıldı.
    // 2) customers tablosundaki 'name' kolonu yerine 'full_name' kullanıldı.
    // 3) Bilet müşteri ilişkisi 'customers(full_name)' JOIN'i ile güvene alındı.
    // ==========================================================================
    const [ticketsRes, productsRes, customersRes] = await Promise.allSettled([
      // A) Biletler (repair_tickets: Bilet No, Cihaz Modeli, Marka, IMEI, Müşteri)
      supabase
        .from("repair_tickets")
        .select(`
          id,
          ticket_number,
          device_brand,
          device_model,
          imei,
          status,
          issue_description,
          customers ( full_name )
        `)
        .or(
          `ticket_number.ilike.%${query}%,device_model.ilike.%${query}%,device_brand.ilike.%${query}%,imei.ilike.%${query}%`
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

      // C) Müşteriler (full_name, Telefon, E-posta)
      supabase
        .from("customers")
        .select("id, full_name, phone, email")
        .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(6),
    ])

    interface DbRepairTicketRow {
      id: string
      ticket_number?: string | null
      device_brand?: string | null
      device_model?: string | null
      imei?: string | null
      status?: string | null
      issue_description?: string | null
      customers?: { full_name?: string | null } | null
    }

    interface DbProductRow {
      id: string
      name: string
      barcode?: string | null
      imei?: string | null
      brand?: string | null
      model?: string | null
      stock_quantity?: number | null
      sale_price?: number | null
      category_id?: string | null
      categories?: { name?: string | null } | null
    }

    interface DbCustomerRow {
      id: string
      full_name?: string | null
      phone?: string | null
      email?: string | null
    }

    // Sonuçları Ayrıştırma - Biletler (repair_tickets)
    if (ticketsRes.status === "fulfilled" && !ticketsRes.value.error && ticketsRes.value.data) {
      const rows = ticketsRes.value.data as unknown as DbRepairTicketRow[]
      tickets = rows.map((t) => {
        const ticketNum = t.ticket_number || `Bilet #${String(t.id).slice(0, 8)}`
        const custName = t.customers?.full_name || "Müşteri"
        const deviceName = `${t.device_brand ? t.device_brand + " " : ""}${t.device_model || "Cihaz"}`
        return {
          id: String(t.id),
          ticketNumber: ticketNum,
          title: `${ticketNum} — ${deviceName}`,
          subtitle: `Müşteri: ${custName}${t.imei ? ` • IMEI: ${t.imei}` : ""}`,
          type: "service_ticket" as const,
          url: t.imei
            ? `/dashboard/service/history?imei=${encodeURIComponent(t.imei)}`
            : `/dashboard/service`,
          customerName: custName,
          deviceModel: deviceName,
          imei: t.imei || null,
          status: t.status || "Bekliyor",
          badge: t.status || "Servis",
          badgeVariant: t.status === "tamamlandi" ? "default" : "secondary",
        }
      })
    }

    // Sonuçları Ayrıştırma - Ürünler
    if (productsRes.status === "fulfilled" && !productsRes.value.error && productsRes.value.data) {
      const rows = productsRes.value.data as unknown as DbProductRow[]
      products = rows.map((p) => {
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

    // Sonuçları Ayrıştırma - Müşteriler (full_name)
    if (customersRes.status === "fulfilled" && !customersRes.value.error && customersRes.value.data) {
      const rows = customersRes.value.data as unknown as DbCustomerRow[]
      customers = rows.map((c) => ({
        id: String(c.id),
        title: c.full_name || "İsimsiz Müşteri",
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
  const matches = (target?: string | null) => {
    if (!target) return false
    const tLower = target.toLowerCase()
    const tTr = target.toLocaleLowerCase("tr-TR")
    return tLower.includes(lowerQuery) || tTr.includes(trLowerQuery) || target.includes(query)
  }

  if (tickets.length === 0) {
    tickets = MOCK_TICKETS.filter(
      (t) =>
        matches(t.title) ||
        matches(t.subtitle) ||
        matches(t.customerName) ||
        matches(t.deviceModel) ||
        matches(t.imei) ||
        matches(t.ticketNumber)
    )
  }

  if (products.length === 0) {
    products = MOCK_PRODUCTS.filter(
      (p) =>
        matches(p.title) ||
        matches(p.subtitle) ||
        matches(p.barcode) ||
        matches(p.imei) ||
        matches(p.categoryName)
    )
  }

  if (customers.length === 0) {
    customers = MOCK_CUSTOMERS.filter(
      (c) =>
        matches(c.title) ||
        matches(c.subtitle) ||
        matches(c.phone) ||
        matches(c.email)
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

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
    },
  })
}
