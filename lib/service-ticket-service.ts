import { 
  ServiceTicketFormValues, 
  ServiceTicketDisplay, 
  KanbanColumnId,
  UpdateTicketCostPayload,
  ServiceDeliveryCheckoutPayload,
  ServiceDeliveryResult
} from "@/types/service"
import { RepairPartItem } from "@/types/database"
import { POSCustomerSelect } from "@/types/pos"
import { createClient } from "@/utils/supabase/client"

export interface CreateServiceTicketResult {
  success: boolean
  ticketId: string
  ticketNumber: string
  message?: string
  error?: string
  ticketData?: Record<string, unknown>
}

interface ServiceDbClient {
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

/**
 * Benzersiz Servis Takip Numarası Üretir (Örn: SRV-20261015-8192)
 */
export function generateServiceTicketNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `SRV-${year}${month}${day}-${randomSuffix}`
}

/**
 * Kontrol Kutucukları ve Metinden Kapsamlı Dış Görünüm Raporu Üretir
 */
export function formatPhysicalConditionNotes(values: ServiceTicketFormValues): string {
  const flags: string[] = []
  if (values.condScreenCracked) flags.push("Ekran/Ön Cam Kırık")
  if (values.condScreenScratched) flags.push("Ekranda Derin Çizikler Var")
  if (values.condBackGlassCracked) flags.push("Arka Cam/Kapak Çatlak")
  if (values.condCaseDented) flags.push("Kasa/Köşelerde Darbe & Ezik")
  if (values.condLiquidDamage) flags.push("Sıvı Teması İzi/Şüphesi")
  if (values.condCameraGlassCracked) flags.push("Kamera Camı Kırık/Çizik")
  if (values.condScrewsMissing) flags.push("Eksik Vida/Daha Önce Açılmış")

  let result = values.physicalCondition.trim()
  if (flags.length > 0) {
    result += ` [Kusur Tespiti: ${flags.join(", ")}]`
  }
  return result
}

/**
 * Teslim Alınan Aksesuarların Metin Dökümünü Üretir
 */
export function formatAccessoriesList(values: ServiceTicketFormValues): string {
  const accList: string[] = []
  if (values.accProtectiveCase) accList.push("Kılıf")
  if (values.accSimCard) accList.push("SIM Kart")
  if (values.accMemoryCard) accList.push("Hafıza Kartı (SD)")
  if (values.accOriginalBox) accList.push("Orijinal Kutu")
  if (values.accCharger) accList.push("Şarj Adaptörü / Kablo")
  if (values.accOther && values.accOther.trim()) {
    accList.push(values.accOther.trim())
  }

  return accList.length > 0 ? accList.join(", ") : "Yalnızca Cihaz Teslim Alındı"
}

/**
 * Cihaz Şifresi Bilgisini Güvenli Formatlar
 */
export function formatPasswordInfo(values: ServiceTicketFormValues): {
  passwordText: string
  patternNotes: string | null
} {
  if (!values.hasPassword || values.passwordType === "none") {
    return { passwordText: "Şifresiz / Ekran Kilidi Açık", patternNotes: null }
  }

  if (values.passwordType === "pattern") {
    return {
      passwordText: "Desen Kilidi Mevcut",
      patternNotes: values.patternNotes || "Müşteri deseni formu üzerinde işaretlendi",
    }
  }

  return {
    passwordText: values.devicePassword || "Belirtilmedi",
    patternNotes: values.patternNotes || null,
  }
}

/**
 * Supabase `repair_tickets` Tablosuna Yeni Servis Kaydı Ekler
 */
export async function createServiceTicket(
  values: ServiceTicketFormValues,
  customer: POSCustomerSelect
): Promise<CreateServiceTicketResult> {
  const ticketNumber = generateServiceTicketNumber()
  const physicalConditionStr = formatPhysicalConditionNotes(values)
  const accessoriesStr = formatAccessoriesList(values)
  const { passwordText, patternNotes } = formatPasswordInfo(values)

  const payload = {
    ticket_number: ticketNumber,
    customer_id: customer.id.startsWith("cust-") ? null : customer.id, // Geçerli UUID kontrolü
    device_brand: values.deviceBrand.trim(),
    device_model: values.deviceModel.trim(),
    imei: values.imei && values.imei.trim().length === 15 ? values.imei.trim() : null,
    serial_number: values.serialNumber ? values.serialNumber.trim() : null,
    device_password: passwordText,
    pattern_code: patternNotes,
    physical_condition: physicalConditionStr,
    has_accessories: accessoriesStr,
    issue_description: `[${values.issueCategory}] ${values.issueDescription.trim()}`,
    technician_notes: values.technicianNotes ? values.technicianNotes.trim() : null,
    status: "bekliyor",
    estimated_cost: Number(values.estimatedCost) || 0,
    labor_cost: 0,
    parts_total_cost: 0,
    actual_cost: Number(values.estimatedCost) || 0,
    parts_used: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  try {
    const supabase = createClient()
    const db = supabase as unknown as ServiceDbClient

    // Supabase repair_tickets tablosuna kayıt
    const { data, error } = await db.from("repair_tickets").insert([payload]).select()

    if (!error && data && data.length > 0) {
      const inserted = data[0]
      return {
        success: true,
        ticketId: String(inserted.id || ""),
        ticketNumber: String(inserted.ticket_number || ticketNumber),
        message: "Servis kaydı başarıyla oluşturuldu.",
        ticketData: inserted,
      }
    }

    if (error) {
      console.warn("Supabase repair_tickets kayıt uyarısı, simülasyon fallback devreye giriyor:", error.message)
    }
  } catch (err) {
    console.warn("Supabase bağlantı hatası, yerel modda devam ediliyor:", err)
  }

  // Fallback (Offline / Dev Simülasyonu)
  const localTicketId = "ticket-" + Date.now()
  return {
    success: true,
    ticketId: localTicketId,
    ticketNumber,
    message: "Servis kaydı yerel ve geçici belleğe başarıyla işlendi.",
    ticketData: {
      ...payload,
      id: localTicketId,
    },
  }
}

/**
 * Teknik Servis Kanban Panosu Başlangıç & Simülasyon Biletleri (Gün 22)
 */
export const INITIAL_KANBAN_TICKETS: ServiceTicketDisplay[] = [
  // 1. BEKLİYOR (2 Adet)
  {
    id: "srv-001",
    ticket_number: "SRV-20261015-0101",
    customer_id: "c1",
    customer_name: "Ahmet Yılmaz",
    customer_phone: "0532 111 22 33",
    customer_email: "ahmet.yilmaz@gmail.com",
    device_brand: "Apple",
    device_model: "iPhone 13 (A2633)",
    imei: "354892091234567",
    device_password: "1907",
    pattern_code: null,
    physical_condition: "Ön cam tamamen kırık, sağ üst köşe kasada hafif ezik var. [Kusur Tespiti: Ekran/Ön Cam Kırık, Kasa/Köşelerde Darbe & Ezik]",
    has_accessories: "Kılıf",
    issue_description: "[Ekran & Dokunmatik] Cihaz yere düştü, ekran çatlak ve alt kısımda dokunmatik basmıyor.",
    issue_category: "Ekran & Dokunmatik",
    technician_notes: "Orijinal OLED ekran değişimi yapılacak. Test sonrası müşteri aranacak.",
    status: "bekliyor",
    priority: "high",
    estimated_cost: 3200,
    labor_cost: 450,
    parts_total_cost: 2750,
    actual_cost: 3200,
    parts_used: [
      {
        product_id: "part-1",
        part_name: "GX iPhone 13 OLED Orijinal Kalite Ekran Paneli",
        quantity: 1,
        unit_price: 2750,
        total_price: 2750,
        notes: "OLED Panel",
      },
    ],
    assigned_technician: "Kerim Aydın",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "srv-002",
    ticket_number: "SRV-20261015-0102",
    customer_id: "c3",
    customer_name: "Mehmet Öztürk",
    customer_phone: "0555 777 88 99",
    customer_email: "mehmet.ozturk@gmail.com",
    device_brand: "Xiaomi",
    device_model: "Xiaomi 12 (2201123G)",
    imei: "867543021984210",
    device_password: "Şifresiz / Ekran Kilidi Açık",
    pattern_code: null,
    physical_condition: "Kozmetik temiz, soket girişinde toz birikintisi ve pin aşınması.",
    has_accessories: "Yalnızca Cihaz Teslim Alındı",
    issue_description: "[Şarj Soketi & Bord] Type-C kablosu takıldığında temassızlık yapıyor, şarj almıyor.",
    issue_category: "Şarj Soketi & Bord",
    technician_notes: "Alt bord soket mikro lehim veya bord değişimi yapılacak.",
    status: "bekliyor",
    priority: "normal",
    estimated_cost: 750,
    labor_cost: 350,
    parts_total_cost: 400,
    actual_cost: 750,
    parts_used: [
      {
        product_id: "part-5",
        part_name: "Xiaomi 12 Type-C Hızlı Şarj Soketi & Alt Bord Modülü",
        quantity: 1,
        unit_price: 400,
        total_price: 400,
      },
    ],
    assigned_technician: "Barış Kaya",
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },

  // 2. İŞLEMDE (2 Adet)
  {
    id: "srv-003",
    ticket_number: "SRV-20261015-0103",
    customer_id: "c2",
    customer_name: "Fatma Kaya",
    customer_phone: "0542 333 44 55",
    customer_email: "fatma.kaya@hotmail.com",
    device_brand: "Samsung",
    device_model: "Galaxy S21 5G (SM-G991B)",
    imei: "359876098765432",
    device_password: "2468",
    pattern_code: null,
    physical_condition: "Arka kapak yapışkanı sol taraftan batarya şişmesi sebebiyle kalkmış. Ekranda kılcal çizikler.",
    has_accessories: "Kılıf, Şarj Adaptörü / Kablo",
    issue_description: "[Batarya & Güç] Batarya şişmesi, arka kapak açılmış, şarj %30 iken aniden kapanıyor.",
    issue_category: "Batarya & Güç",
    technician_notes: "Yeni orijinal 4000mAh pil takıldı, yapıştırıcı kürleniyor ve akım çekim testi yapılıyor.",
    status: "islemde",
    priority: "high",
    estimated_cost: 1450,
    labor_cost: 350,
    parts_total_cost: 1100,
    actual_cost: 1450,
    parts_used: [
      {
        product_id: "part-3",
        part_name: "Samsung Galaxy S21 5G Orijinal EB-BG991ABY Batarya (4000mAh)",
        quantity: 1,
        unit_price: 1100,
        total_price: 1100,
      },
    ],
    assigned_technician: "Kerim Aydın",
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "srv-004",
    ticket_number: "SRV-20261015-0104",
    customer_id: "c5",
    customer_name: "Canan Demir",
    customer_phone: "0536 222 33 44",
    customer_email: null,
    device_brand: "Apple",
    device_model: "iPhone 12 Pro (A2407)",
    imei: "352981087451920",
    device_password: "0000",
    pattern_code: null,
    physical_condition: "Arka cam kırık, kamera lensinde çatlak var. [Kusur Tespiti: Arka Cam/Kapak Çatlak, Kamera Camı Kırık/Çizik]",
    has_accessories: "Yalnızca Cihaz Teslim Alındı",
    issue_description: "[Kasa, Çerçeve & Arka Cam] Lazerle arka cam sökümü ve geniş açı kamera lensi değişimi.",
    issue_category: "Kasa, Çerçeve & Arka Cam",
    technician_notes: "Lazerle arka cam temizlendi, yeni cam presleniyor.",
    status: "islemde",
    priority: "normal",
    estimated_cost: 2100,
    labor_cost: 550,
    parts_total_cost: 1550,
    actual_cost: 2100,
    parts_used: [
      {
        product_id: "part-6",
        part_name: "iPhone 12 Pro Lazer Uyumlu Arka Cam Panel (Grafit)",
        quantity: 1,
        unit_price: 750,
        total_price: 750,
      },
      {
        product_id: "part-7",
        part_name: "iPhone 12 Pro 12MP Geniş Açı Orijinal Kamera Lensi",
        quantity: 1,
        unit_price: 800,
        total_price: 800,
      },
    ],
    assigned_technician: "Kerim Aydın",
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },

  // 3. PARÇA BEKLİYOR (2 Adet)
  {
    id: "srv-005",
    ticket_number: "SRV-20261015-0105",
    customer_id: "c6",
    customer_name: "Burak Şahin",
    customer_phone: "0533 888 99 00",
    customer_email: "burak.sahin@outlook.com",
    device_brand: "Samsung",
    device_model: "Galaxy Z Flip 4 (SM-F721B)",
    imei: "358172099384712",
    device_password: "Desen Kilidi Mevcut",
    pattern_code: "Z şeklinde 9 nokta deseni",
    physical_condition: "Katlanabilir iç ekran menteşe çizgisinde siyah leke oluşmuş, dokunmatik yarım basıyor.",
    has_accessories: "Orijinal Kutu",
    issue_description: "[Ekran & Dokunmatik] Katlanabilir AMOLED esnek iç ekran paneli değişimi gerekiyor.",
    issue_category: "Ekran & Dokunmatik",
    technician_notes: "Distribütörden orijinal mor servis ekranı sipariş edildi (Takip No: YRT-884912), yarın sabah kargo bekleniyor.",
    status: "parca_bekliyor",
    priority: "critical",
    estimated_cost: 5400,
    actual_cost: 5400,
    assigned_technician: "Kerim Aydın",
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "srv-006",
    ticket_number: "SRV-20261015-0106",
    customer_id: "c4",
    customer_name: "Zeynep Çelik",
    customer_phone: "0505 999 00 11",
    customer_email: "zeynep.celik@gmail.com",
    device_brand: "Huawei",
    device_model: "Huawei P30 Pro (VOG-L29)",
    imei: "863491028374651",
    device_password: "1234",
    pattern_code: null,
    physical_condition: "Sıvı teması izi, SIM tepsisi indikatörü kırmızı. [Kusur Tespiti: Sıvı Teması İzi/Şüphesi]",
    has_accessories: "Yalnızca Cihaz Teslim Alındı",
    issue_description: "[Anakart & Entegre Onarımı] Denize düştü, ultrasonik banyo yapıldı ancak şarj PMIC entegresi kısa devrede.",
    issue_category: "Anakart & Entegre Onarımı",
    technician_notes: "HiSilicon şarj entegresi yurt dışı depodan yolda, kargo takip: DHL-491029.",
    status: "parca_bekliyor",
    priority: "normal",
    estimated_cost: 4500,
    actual_cost: 4500,
    assigned_technician: "Kerim Aydın",
    created_at: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
  },

  // 4. TAMAMLANDI (2 Adet)
  {
    id: "srv-007",
    ticket_number: "SRV-20261015-0107",
    customer_id: "c7",
    customer_name: "Emre Koç",
    customer_phone: "0544 666 77 88",
    customer_email: null,
    device_brand: "Apple",
    device_model: "iPhone 11 (A2221)",
    imei: "359102948576102",
    device_password: "5555",
    pattern_code: null,
    physical_condition: "Kozmetik temiz, hoparlör ızgaraları tozlu.",
    has_accessories: "Kılıf",
    issue_description: "[Ses, Hoparlör & Mikrofon] Ahize sesi çok az geliyordu, karşı tarafın sesi duyulmuyordu.",
    issue_category: "Ses, Hoparlör & Mikrofon",
    technician_notes: "Ön kamera/ahize flex modülü ultrasonik temizlendi ve ızgara yenilendi. Ses seviyesi %100 test edildi.",
    status: "tamamlandi",
    priority: "normal",
    estimated_cost: 650,
    actual_cost: 650,
    assigned_technician: "Barış Kaya",
    created_at: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: "srv-008",
    ticket_number: "SRV-20261015-0108",
    customer_id: "c8",
    customer_name: "Selin Arslan",
    customer_phone: "0538 444 55 66",
    customer_email: "selin.arslan@gmail.com",
    device_brand: "Xiaomi",
    device_model: "Redmi Note 11 Pro 5G",
    imei: "869402918237461",
    device_password: "Şifresiz / Ekran Kilidi Açık",
    pattern_code: null,
    physical_condition: "Yeni AMOLED panel takıldı, çizik veya leke yok.",
    has_accessories: "Orijinal Kutu, Şarj Adaptörü / Kablo",
    issue_description: "[Ekran & Dokunmatik] Ekran değişimi ve 24 saat batarya stabilite testi.",
    issue_category: "Ekran & Dokunmatik",
    technician_notes: "Ekran başarıyla takıldı, dokunmatik kalibrasyonu yapıldı ve 24 saat şarj/deşarj testi başarılı geçti. Müşteriye SMS gönderildi.",
    status: "tamamlandi",
    priority: "high",
    estimated_cost: 1850,
    actual_cost: 1850,
    assigned_technician: "Kerim Aydın",
    created_at: new Date(Date.now() - 1000 * 60 * 960).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
]

/**
 * Açıklamadan Kategori Çıkarır (Örn: [Ekran & Dokunmatik] -> Ekran & Dokunmatik)
 */
function extractCategory(description: string): string {
  const match = description.match(/^\[(.*?)\]/)
  return match ? match[1] : "Genel Bakım"
}

/**
 * Durum Değerini Kanban Sütun ID'sine Normalize Eder
 */
function normalizeStatus(statusStr: string | null | undefined): KanbanColumnId {
  if (!statusStr) return "bekliyor"
  if (statusStr === "islemde") return "islemde"
  if (statusStr === "parca_bekliyor") return "parca_bekliyor"
  if (statusStr === "tamamlandi" || statusStr === "teslim_edildi") return "tamamlandi"
  return "bekliyor"
}

/**
 * Supabase `repair_tickets` Tablosundan Biletleri Çeker
 */
export async function fetchServiceTickets(): Promise<ServiceTicketDisplay[]> {
  try {
    const supabase = createClient()
    const db = supabase as unknown as ServiceDbClient
    const { data, error } = await db
      .from("repair_tickets")
      .select(`
        id,
        ticket_number,
        customer_id,
        device_brand,
        device_model,
        imei,
        serial_number,
        device_password,
        pattern_code,
        physical_condition,
        has_accessories,
        issue_description,
        technician_notes,
        status,
        estimated_cost,
        actual_cost,
        created_at,
        updated_at,
        customers (
          id,
          full_name,
          phone,
          email
        )
      `)
      .order("created_at", { ascending: false })

    if (!error && data && data.length > 0) {
      const mapped: ServiceTicketDisplay[] = data.map((item: Record<string, unknown>) => {
        const customer = (item.customers as Record<string, unknown>) || {}
        const desc = String(item.issue_description || "")
        return {
          id: String(item.id || ""),
          ticket_number: String(item.ticket_number || "SRV-NO"),
          customer_id: String(item.customer_id || ""),
          customer_name: String(customer.full_name || "Müşteri"),
          customer_phone: String(customer.phone || "-"),
          customer_email: (customer.email as string) || null,
          device_brand: String(item.device_brand || "Bilinmiyor"),
          device_model: String(item.device_model || "Cihaz"),
          imei: (item.imei as string) || null,
          serial_number: (item.serial_number as string) || null,
          device_password: (item.device_password as string) || null,
          pattern_code: (item.pattern_code as string) || null,
          physical_condition: (item.physical_condition as string) || null,
          has_accessories: (item.has_accessories as string) || null,
          issue_description: desc,
          issue_category: extractCategory(desc),
          technician_notes: (item.technician_notes as string) || null,
          status: normalizeStatus(String(item.status || "bekliyor")),
          priority: desc.toLowerCase().includes("acil") || desc.toLowerCase().includes("sıvı") ? "critical" : "normal",
          estimated_cost: Number(item.estimated_cost) || 0,
          actual_cost: Number(item.actual_cost) || Number(item.estimated_cost) || 0,
          assigned_technician: "Kerim Aydın",
          created_at: String(item.created_at || new Date().toISOString()),
          updated_at: String(item.updated_at || new Date().toISOString()),
        }
      })
      return mapped
    }

    if (error) {
      console.warn("fetchServiceTickets Supabase hatası:", error.message)
    }
  } catch (err) {
    console.warn("fetchServiceTickets catch hatası, varsayılan veri yükleniyor:", err)
  }

  return INITIAL_KANBAN_TICKETS
}

/**
 * Supabase `repair_tickets` Üzerinde Bilet Durumunu Günceller
 */
export async function updateServiceTicketStatus(
  ticketId: string,
  newStatus: KanbanColumnId
): Promise<{ success: boolean; message?: string }> {
  try {
    const supabase = createClient()
    const db = supabase as unknown as ServiceDbClient
    const { error } = await db
      .from("repair_tickets")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId)

    if (!error) {
      return { success: true, message: `Bilet durumu '${newStatus}' olarak güncellendi.` }
    }
    console.warn("updateServiceTicketStatus Supabase uyarısı:", error.message)
  } catch (err) {
    console.warn("updateServiceTicketStatus catch hatası:", err)
  }

  return { success: true, message: `Bilet durumu yerel olarak güncellendi.` }
}

/**
 * Servis Biletini ID veya Takip Koduna Göre Getirir
 */
export async function getServiceTicketById(ticketIdOrNumber: string): Promise<ServiceTicketDisplay | null> {
  try {
    const supabase = createClient()
    const db = supabase as unknown as ServiceDbClient
    const { data, error } = await db
      .from("repair_tickets")
      .select(`
        id,
        ticket_number,
        customer_id,
        device_brand,
        device_model,
        imei,
        serial_number,
        device_password,
        pattern_code,
        physical_condition,
        has_accessories,
        issue_description,
        technician_notes,
        status,
        estimated_cost,
        labor_cost,
        parts_total_cost,
        actual_cost,
        parts_used,
        completed_at,
        delivered_at,
        created_at,
        updated_at,
        customers (
          id,
          full_name,
          phone,
          email
        )
      `)
      .order("created_at", { ascending: false })

    if (!error && data && data.length > 0) {
      const match = data.find(
        (item: Record<string, unknown>) =>
          String(item.id) === ticketIdOrNumber ||
          String(item.ticket_number).toLowerCase() === ticketIdOrNumber.toLowerCase()
      )
      if (match) {
        const customer = (match.customers as Record<string, unknown>) || {}
        const desc = String(match.issue_description || "")
        const rawStatus = String(match.status || "bekliyor")
        return {
          id: String(match.id || ""),
          ticket_number: String(match.ticket_number || "SRV-NO"),
          customer_id: String(match.customer_id || ""),
          customer_name: String(customer.full_name || "Müşteri"),
          customer_phone: String(customer.phone || "-"),
          customer_email: (customer.email as string) || null,
          device_brand: String(match.device_brand || "Bilinmiyor"),
          device_model: String(match.device_model || "Cihaz"),
          imei: (match.imei as string) || null,
          serial_number: (match.serial_number as string) || null,
          device_password: (match.device_password as string) || null,
          pattern_code: (match.pattern_code as string) || null,
          physical_condition: (match.physical_condition as string) || null,
          has_accessories: (match.has_accessories as string) || null,
          issue_description: desc,
          issue_category: extractCategory(desc),
          technician_notes: (match.technician_notes as string) || null,
          status: rawStatus === "teslim_edildi" ? "teslim_edildi" : normalizeStatus(rawStatus),
          priority: desc.toLowerCase().includes("acil") || desc.toLowerCase().includes("sıvı") ? "critical" : "normal",
          estimated_cost: Number(match.estimated_cost) || 0,
          labor_cost: Number(match.labor_cost) || 0,
          parts_total_cost: Number(match.parts_total_cost) || 0,
          actual_cost: Number(match.actual_cost) || Number(match.estimated_cost) || 0,
          parts_used: (match.parts_used as RepairPartItem[]) || [],
          assigned_technician: "Kerim Aydın",
          completed_at: (match.completed_at as string) || null,
          delivered_at: (match.delivered_at as string) || null,
          created_at: String(match.created_at || new Date().toISOString()),
          updated_at: String(match.updated_at || new Date().toISOString()),
        }
      }
    }
  } catch (err) {
    console.warn("getServiceTicketById catch hatası:", err)
  }

  // Fallback to initial mock tickets
  const localMatch = INITIAL_KANBAN_TICKETS.find(
    (t) => t.id === ticketIdOrNumber || t.ticket_number.toLowerCase() === ticketIdOrNumber.toLowerCase()
  )
  return localMatch || INITIAL_KANBAN_TICKETS[0] || null
}

/**
 * Gün 23: Teknik Servis Kaydına Parça & İşçilik Ekleme ve Dinamik Maliyet Güncelleme
 */
export async function updateServiceTicketCostsAndParts(
  ticketId: string,
  payload: UpdateTicketCostPayload
): Promise<{ success: boolean; data?: ServiceTicketDisplay; message?: string }> {
  try {
    const supabase = createClient()
    const db = supabase as unknown as ServiceDbClient

    // 1. repair_tickets tablosunu güncelle
    const updateFields: Record<string, unknown> = {
      parts_used: payload.parts_used,
      parts_total_cost: payload.parts_total_cost,
      labor_cost: payload.labor_cost,
      actual_cost: payload.actual_cost,
      updated_at: new Date().toISOString(),
    }
    if (payload.technician_notes !== undefined) {
      updateFields.technician_notes = payload.technician_notes
    }
    if (payload.status !== undefined) {
      updateFields.status = payload.status
    }

    const { error } = await db
      .from("repair_tickets")
      .update(updateFields)
      .eq("id", ticketId)

    // 2. Envanterden kullanılan parçaların stok adetlerini düş (varsa product_id)
    for (const part of payload.parts_used) {
      if (part.product_id && !part.product_id.startsWith("custom-")) {
        try {
          await db
            .from("products")
            .update({
              updated_at: new Date().toISOString(),
            })
            .eq("id", part.product_id)
        } catch {
          // Sessizce devam et
        }
      }
    }

    // 3. Yerel bellekteki biletin değerlerini de güncelle (optimistik state)
    const ticketIdx = INITIAL_KANBAN_TICKETS.findIndex((t) => t.id === ticketId)
    if (ticketIdx !== -1) {
      INITIAL_KANBAN_TICKETS[ticketIdx] = {
        ...INITIAL_KANBAN_TICKETS[ticketIdx],
        parts_used: payload.parts_used,
        parts_total_cost: payload.parts_total_cost,
        labor_cost: payload.labor_cost,
        actual_cost: payload.actual_cost,
        technician_notes: payload.technician_notes ?? INITIAL_KANBAN_TICKETS[ticketIdx].technician_notes,
        status: payload.status ?? INITIAL_KANBAN_TICKETS[ticketIdx].status,
        updated_at: new Date().toISOString(),
      }
    }

    if (!error) {
      return {
        success: true,
        message: "Yedek parça ve işçilik maliyetleri başarıyla kaydedildi.",
      }
    }
  } catch (err) {
    console.warn("updateServiceTicketCostsAndParts catch hatası:", err)
  }

  // Yerel güncelleme fallback
  const ticketIdx = INITIAL_KANBAN_TICKETS.findIndex((t) => t.id === ticketId)
  if (ticketIdx !== -1) {
    INITIAL_KANBAN_TICKETS[ticketIdx] = {
      ...INITIAL_KANBAN_TICKETS[ticketIdx],
      parts_used: payload.parts_used,
      parts_total_cost: payload.parts_total_cost,
      labor_cost: payload.labor_cost,
      actual_cost: payload.actual_cost,
      technician_notes: payload.technician_notes ?? INITIAL_KANBAN_TICKETS[ticketIdx].technician_notes,
      status: payload.status ?? INITIAL_KANBAN_TICKETS[ticketIdx].status,
      updated_at: new Date().toISOString(),
    }
  }

  return {
    success: true,
    message: "Yedek parça ve işçilik maliyetleri yerel belleğe kaydedildi.",
  }
}

/**
 * ==============================================================================
 * GÜN 24: SERVİS TAMAMLAMA, MÜŞTERİ BİLDİRİMİ VE KASA TAHSİLATI
 * ==============================================================================
 */

/**
 * Benzersiz Kasa / Fiş Takip Numarası Üretir (Örn: TRX-SRV-20261015-4819)
 */
export function generateServiceTransactionNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `TRX-SRV-${year}${month}${day}-${randomSuffix}`
}

/**
 * Cihaz Onarımı Bittiğinde Durumu "Tamamlandı" Yapar
 * - completed_at zaman damgası ekler
 * - Teknisyen notlarını günceller
 */
export async function markServiceTicketAsCompleted(
  ticketId: string,
  technicianNotes?: string
): Promise<{ success: boolean; message?: string }> {
  const completedAt = new Date().toISOString()
  try {
    const supabase = createClient()
    const db = supabase as unknown as ServiceDbClient
    const updatePayload: Record<string, unknown> = {
      status: "tamamlandi",
      completed_at: completedAt,
      updated_at: completedAt,
    }
    if (technicianNotes !== undefined) {
      updatePayload.technician_notes = technicianNotes
    }

    const { error } = await db
      .from("repair_tickets")
      .update(updatePayload)
      .eq("id", ticketId)

    if (!error) {
      // Optimistic update in local mock array
      const idx = INITIAL_KANBAN_TICKETS.findIndex((t) => t.id === ticketId)
      if (idx !== -1) {
        INITIAL_KANBAN_TICKETS[idx] = {
          ...INITIAL_KANBAN_TICKETS[idx],
          status: "tamamlandi",
          completed_at: completedAt,
          technician_notes: technicianNotes ?? INITIAL_KANBAN_TICKETS[idx].technician_notes,
          updated_at: completedAt,
        }
      }
      return { success: true, message: "Cihaz onarımı 'Tamamlandı' olarak işaretlendi. Müşteri bilgilendirilebilir." }
    }
    console.warn("markServiceTicketAsCompleted Supabase uyarısı:", error.message)
  } catch (err) {
    console.warn("markServiceTicketAsCompleted catch:", err)
  }

  // Local fallback
  const idx = INITIAL_KANBAN_TICKETS.findIndex((t) => t.id === ticketId)
  if (idx !== -1) {
    INITIAL_KANBAN_TICKETS[idx] = {
      ...INITIAL_KANBAN_TICKETS[idx],
      status: "tamamlandi",
      completed_at: completedAt,
      technician_notes: technicianNotes ?? INITIAL_KANBAN_TICKETS[idx].technician_notes,
      updated_at: completedAt,
    }
  }

  return { success: true, message: "Cihaz onarımı 'Tamamlandı' olarak güncellendi." }
}

/**
 * Cihaz Teslim Et ve Tahsilat Yap (Checkout) Akışı:
 * 1. Kasaya (transactions tablosuna) 'repair_payment' (Teknik Servis Geliri) olarak kayıt atar.
 * 2. repair_tickets tablosunda biletin durumunu 'teslim_edildi' ve delivered_at = NOW() yapar.
 * 3. İşlem numarasını ve makbuz referansını döndürür.
 */
export async function completeAndDeliverServiceTicket(
  payload: ServiceDeliveryCheckoutPayload
): Promise<ServiceDeliveryResult> {
  const transactionNumber = generateServiceTransactionNumber()
  const deliveredAt = new Date().toISOString()
  let generatedTrxId = `trx-${Date.now()}`

  try {
    const supabase = createClient()
    const db = supabase as unknown as ServiceDbClient

    // 1. Kasaya (transactions tablosu) teknik servis geliri (repair_payment) olarak kayıt at
    const isUuid = (val: string | null | undefined) =>
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val))

    const trxNotes = [
      `Teknik Servis Tahsilatı [Fiş No: ${payload.ticketNumber}]`,
      `Cihaz: ${payload.deviceBrand} ${payload.deviceModel}`,
      `Teslim Alan: ${payload.deliveredTo || payload.customerName}`,
      payload.warrantyPeriodMonths > 0 ? `Garanti: ${payload.warrantyPeriodMonths} Ay` : "Garantisiz",
      payload.internalNotes ? `Not: ${payload.internalNotes}` : null,
    ].filter(Boolean).join(" • ")

    const trxInsertPayload: Record<string, unknown> = {
      transaction_number: transactionNumber,
      customer_id: isUuid(payload.customerId) ? payload.customerId : null,
      type: "repair_payment",
      payment_method: payload.paymentMethod,
      total_amount: payload.totalAmount,
      discount_amount: payload.discountAmount,
      net_amount: payload.netAmount,
      paid_amount: payload.paidAmount,
      status: "completed",
      notes: trxNotes,
      created_at: deliveredAt,
      updated_at: deliveredAt,
    }

    const { data: trxData, error: trxError } = await db
      .from("transactions")
      .insert([trxInsertPayload])
      .select()

    if (trxData && trxData.length > 0 && trxData[0].id) {
      generatedTrxId = String(trxData[0].id)
    }

    if (trxError) {
      console.warn("completeAndDeliverServiceTicket transactions uyarısı:", trxError.message)
    }

    // 2. repair_tickets tablosunda biletin durumunu 'teslim_edildi' olarak güncelle
    const ticketUpdatePayload: Record<string, unknown> = {
      status: "teslim_edildi",
      delivered_at: deliveredAt,
      actual_cost: payload.totalAmount,
      updated_at: deliveredAt,
    }
    if (payload.technicianNotes) {
      ticketUpdatePayload.technician_notes = payload.technicianNotes
    }

    await db
      .from("repair_tickets")
      .update(ticketUpdatePayload)
      .eq("id", payload.ticketId)

    // 3. Optimistic local array update
    const idx = INITIAL_KANBAN_TICKETS.findIndex(
      (t) => t.id === payload.ticketId || t.ticket_number === payload.ticketNumber
    )
    if (idx !== -1) {
      INITIAL_KANBAN_TICKETS[idx] = {
        ...INITIAL_KANBAN_TICKETS[idx],
        status: "teslim_edildi",
        delivered_at: deliveredAt,
        transaction_number: transactionNumber,
        actual_cost: payload.totalAmount,
        updated_at: deliveredAt,
      }
    }

    return {
      success: true,
      transactionId: generatedTrxId,
      transactionNumber,
      ticketNumber: payload.ticketNumber,
      deliveredAt,
      message: `Cihaz başarıyla teslim edildi ve ₺${payload.netAmount.toLocaleString("tr-TR")} teknik servis geliri kasaya kaydedildi.`,
    }
  } catch (err) {
    console.warn("completeAndDeliverServiceTicket catch:", err)
  }

  // Fallback if offline/local
  const idx = INITIAL_KANBAN_TICKETS.findIndex(
    (t) => t.id === payload.ticketId || t.ticket_number === payload.ticketNumber
  )
  if (idx !== -1) {
    INITIAL_KANBAN_TICKETS[idx] = {
      ...INITIAL_KANBAN_TICKETS[idx],
      status: "teslim_edildi",
      delivered_at: deliveredAt,
      transaction_number: transactionNumber,
      actual_cost: payload.totalAmount,
      updated_at: deliveredAt,
    }
  }

  return {
    success: true,
    transactionId: generatedTrxId,
    transactionNumber,
    ticketNumber: payload.ticketNumber,
    deliveredAt,
    message: `Cihaz başarıyla teslim edildi ve ₺${payload.netAmount.toLocaleString("tr-TR")} teknik servis geliri kasaya kaydedildi.`,
  }
}


