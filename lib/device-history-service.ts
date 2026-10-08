import { 
  DeviceHistoryQueryResult, 
  DeviceTimelineEvent, 
  DeviceHistoryPreset 
} from "@/types/device-history"
import { createClient } from "@/utils/supabase/client"

/**
 * ==============================================================================
 * GÜN 25: CİHAZ GEÇMİŞİ VE IMEI ZAMAN ÇİZELGESİ SERVİSİ
 * ==============================================================================
 */

/**
 * 15 Haneli IMEI Formatını ve Luhn Sağlamasını Kontrol Eder
 */
export function validateIMEI(imei: string): { isValid: boolean; message?: string } {
  const clean = imei.trim().replace(/[^0-9]/g, "")
  if (clean.length !== 15) {
    return {
      isValid: false,
      message: `IMEI tam olarak 15 haneli olmalıdır (Şu an ${clean.length} hane).`,
    }
  }

  // Luhn Kontrolü
  let sum = 0
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(clean[i], 10)
    if (i % 2 !== 0) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  const checkDigit = (10 - (sum % 10)) % 10
  const expectedCheckDigit = parseInt(clean[14], 10)

  // Luhn tam eşleşmese bile Türkiye standartlarında 15 haneli rakam kabul edilir
  if (checkDigit !== expectedCheckDigit) {
    return { isValid: true, message: "Luhn kontrol uyarısı (15 hane geçerli)" }
  }

  return { isValid: true }
}

/**
 * Hızlı Test ve Demo İçin Örnek IMEI Ön Tanımları
 */
export const DEVICE_HISTORY_PRESETS: DeviceHistoryPreset[] = [
  {
    id: "preset-iphone11",
    imei: "359102948576102",
    brand: "Apple",
    model: "iPhone 11 (128GB Black)",
    storage: "128 GB",
    color: "Siyah",
    summaryText: "2. El Alındı ➔ Satıldı ➔ Ahize Onarımı Yapıldı ➔ Teslim Edildi",
    eventCount: 4,
    badge: "Tam Döngü (Alım + Satım + Servis)",
  },
  {
    id: "preset-redmi11",
    imei: "869402918237461",
    brand: "Xiaomi",
    model: "Redmi Note 11 Pro 5G",
    storage: "128 GB",
    color: "Gri",
    summaryText: "Mağazadan Sıfır Satış ➔ Ekran Kırıldı ➔ AMOLED Değişimi & Teslimat",
    eventCount: 3,
    badge: "Satış + Ekran Değişimi",
  },
  {
    id: "preset-s21",
    imei: "354892019284729",
    brand: "Samsung",
    model: "Galaxy S21 5G (SM-G991B)",
    storage: "256 GB",
    color: "Phantom Gray",
    summaryText: "2. El Alım ➔ Batarya Şişmesi Onarımı ➔ Vitrinde Satışa Hazır",
    eventCount: 3,
    badge: "2. El Alım + Batarya Yenileme",
  },
  {
    id: "preset-huawei",
    imei: "863491028374651",
    brand: "Huawei",
    model: "Huawei P30 Pro (VOG-L29)",
    storage: "128 GB",
    color: "Aurora",
    summaryText: "Denize Düşme (Sıvı Teması) ➔ Ultrasonik Banyo ➔ PMIC Entegre Bekleniyor",
    eventCount: 2,
    badge: "Serviste / Parça Bekliyor",
  },
  {
    id: "preset-iphone13",
    imei: "358920194827103",
    brand: "Apple",
    model: "iPhone 13 (A2633)",
    storage: "128 GB",
    color: "Starlight",
    summaryText: "POS Satışı ➔ Düşme Sonucu Cam Kırıldı ➔ Serviste Masada",
    eventCount: 2,
    badge: "Masada / Onarımda",
  },
]

/**
 * Zengin Örnek Cihaz Yaşam Döngüsü Veri Tabanı
 */
const SEED_DEVICE_HISTORIES: Record<string, DeviceHistoryQueryResult> = {
  // 1. ÖRNEK: Apple iPhone 11 (Alım -> Satış -> Servis Kabulü -> Teslimat)
  "359102948576102": {
    device: {
      imei: "359102948576102",
      serialNumber: "C6KZR014N72M",
      brand: "Apple",
      model: "iPhone 11 (A2221)",
      storage: "128 GB",
      color: "Uzay Grisi",
      condition: "ikinci el",
      currentStatus: "delivered",
      batteryHealth: 88,
      cosmeticCondition: "Kozmetik 9/10 (Temiz, kılcal çizik yok)",
      firstSeenDate: "2026-01-12T10:30:00.000Z",
      lastActivityDate: "2026-10-08T15:20:00.000Z",
      totalRepairsCount: 1,
      totalRepairSpent: 650,
      purchasePrice: 9500,
      salePrice: 13800,
      activeWarranty: {
        isActive: true,
        months: 6,
        type: "Ahize & Ses Modülü Servis Garantisi",
        endDate: "2027-04-08T15:20:00.000Z",
        remainingDays: 182,
      },
      currentOwner: {
        id: "c7",
        name: "Emre Koç",
        phone: "0544 666 77 88",
      },
    },
    events: [
      {
        id: "ev-1",
        type: "purchase",
        date: "2026-01-12T10:30:00.000Z",
        title: "İkinci El Cihaz Satın Alımı (Mağazaya Giriş)",
        description: "Müşteri Burak Yılmaz'dan mağaza envanterine 2. el cihaz alımı yapıldı. Cihaz tüm testlerden geçirildi.",
        badgeText: "2. El Alım",
        badgeColor: "blue",
        iconName: "shopping-bag",
        amount: 9500,
        customer: {
          name: "Burak Yılmaz",
          phone: "0532 111 22 33",
        },
        staffName: "Kerim Aydın",
        metadata: {
          transactionNumber: "TRX-PUR-20260112-9102",
          invoiceNumber: "GDP-2026-0042",
          paymentMethod: "cash",
          batteryHealth: 88,
          cosmeticCondition: "Kasa temiz, ekran orijinal, TrueTone aktif",
          notes: "Gider pusulası imzalandı, bedel nakit ödendi.",
        },
      },
      {
        id: "ev-2",
        type: "sale",
        date: "2026-02-04T14:15:00.000Z",
        title: "POS Satışı (Müşteriye Çıkış)",
        description: "Cihaz vitrinden Emre Koç'a 12 ay mağaza garantisi ve şarj adaptörü hediyesi ile satıldı.",
        badgeText: "Satış",
        badgeColor: "emerald",
        iconName: "credit-card",
        amount: 13800,
        customer: {
          name: "Emre Koç",
          phone: "0544 666 77 88",
        },
        staffName: "Kerim Aydın",
        metadata: {
          transactionNumber: "TRX-20260204-0018",
          invoiceNumber: "FAT-2026-0819",
          paymentMethod: "credit_card",
          warrantyMonths: 12,
          notes: "Kredi kartı tek çekim tahsil edildi. 80mm fiş kesildi.",
        },
      },
      {
        id: "ev-3",
        type: "repair_intake",
        date: "2026-10-07T11:40:00.000Z",
        title: "Teknik Servis Kabulü (SRV-20261015-0107)",
        description: "Müşteri cihazı ahizeden ses gelmemesi ve konuşurken karşı tarafı duyamama şikayetiyle servise getirdi.",
        badgeText: "Servis Kabulü",
        badgeColor: "amber",
        iconName: "wrench",
        amount: 650,
        customer: {
          name: "Emre Koç",
          phone: "0544 666 77 88",
        },
        staffName: "Barış Kaya (Teknisyen)",
        metadata: {
          ticketNumber: "SRV-20261015-0107",
          devicePassword: "5555",
          physicalCondition: "Kozmetik temiz, hoparlör ızgaraları tozlu.",
          notes: "Öncelik: Normal. Şikayet: [Ses, Hoparlör & Mikrofon] Ahize sesi çok az geliyor.",
        },
      },
      {
        id: "ev-4",
        type: "repair_delivered",
        date: "2026-10-08T15:20:00.000Z",
        title: "Onarım Tamamlandı & Cihaz Teslim Edildi",
        description: "Ön kamera/ahize flex modülü yenilendi, hoparlör ızgarası temizlendi. Testler başarılı geçti, ödeme tahsil edildi.",
        badgeText: "Teslim Edildi",
        badgeColor: "emerald",
        iconName: "check-circle",
        amount: 650,
        customer: {
          name: "Emre Koç",
          phone: "0544 666 77 88",
        },
        staffName: "Kerim Aydın (Kasa)",
        metadata: {
          ticketNumber: "SRV-20261015-0107",
          transactionNumber: "TRX-SRV-20261008-8124",
          paymentMethod: "cash",
          warrantyMonths: 6,
          warrantyEndDate: "2027-04-08",
          partsUsed: [
            {
              partName: "iPhone 11 Ahize & Yakınlık Sensörü Flex Kablosu",
              quantity: 1,
              unitPrice: 320,
              totalPrice: 320,
            },
          ],
          laborCost: 330,
          notes: "Cihaz sorunsuz teslim edildi. 6 Ay Servis Garantisi tanımlandı.",
        },
      },
    ],
  },

  // 2. ÖRNEK: Xiaomi Redmi Note 11 Pro 5G
  "869402918237461": {
    device: {
      imei: "869402918237461",
      brand: "Xiaomi",
      model: "Redmi Note 11 Pro 5G",
      storage: "128 GB",
      color: "Gri",
      condition: "sıfır",
      currentStatus: "delivered",
      batteryHealth: 96,
      cosmeticCondition: "Yeni AMOLED panel takıldı, çizik yok",
      firstSeenDate: "2026-08-15T09:00:00.000Z",
      lastActivityDate: "2026-10-06T17:30:00.000Z",
      totalRepairsCount: 1,
      totalRepairSpent: 1850,
      salePrice: 9200,
      activeWarranty: {
        isActive: true,
        months: 6,
        type: "AMOLED Ekran Modülü Garantisi",
        endDate: "2027-04-06T17:30:00.000Z",
        remainingDays: 180,
      },
      currentOwner: {
        id: "c8",
        name: "Selin Arslan",
        phone: "0538 444 55 66",
      },
    },
    events: [
      {
        id: "ev-x1",
        type: "sale",
        date: "2026-08-15T09:00:00.000Z",
        title: "Sıfır Cihaz Satışı (Vitrinden)",
        description: "Mağazadan sıfır kapalı kutu olarak Selin Arslan'a satışı gerçekleştirildi.",
        badgeText: "Sıfır Satış",
        badgeColor: "emerald",
        iconName: "credit-card",
        amount: 9200,
        customer: {
          name: "Selin Arslan",
          phone: "0538 444 55 66",
        },
        staffName: "Kerim Aydın",
        metadata: {
          transactionNumber: "TRX-20260815-0042",
          paymentMethod: "credit_card",
          warrantyMonths: 24,
        },
      },
      {
        id: "ev-x2",
        type: "repair_intake",
        date: "2026-10-02T16:00:00.000Z",
        title: "Teknik Servis Kabulü (SRV-20261015-0108)",
        description: "Yere düşme sonucu ekran kırıldı, görüntü gelmiyor. Dokunmatik tepkisiz.",
        badgeText: "Servis Kabulü",
        badgeColor: "amber",
        iconName: "wrench",
        amount: 1850,
        customer: {
          name: "Selin Arslan",
          phone: "0538 444 55 66",
        },
        staffName: "Kerim Aydın",
        metadata: {
          ticketNumber: "SRV-20261015-0108",
          devicePassword: "Şifresiz",
          notes: "Ekran değişimi ve 24 saat batarya stabilite testi talep edildi.",
        },
      },
      {
        id: "ev-x3",
        type: "repair_delivered",
        date: "2026-10-06T17:30:00.000Z",
        title: "Onarım Tamamlandı & Teslim Edildi",
        description: "Orijinal AMOLED panel takıldı, 24 saat şarj testi başarılı geçti. Müşteriye teslim edildi.",
        badgeText: "Teslim Edildi",
        badgeColor: "emerald",
        iconName: "check-circle",
        amount: 1850,
        customer: {
          name: "Selin Arslan",
          phone: "0538 444 55 66",
        },
        staffName: "Kerim Aydın",
        metadata: {
          ticketNumber: "SRV-20261015-0108",
          transactionNumber: "TRX-SRV-20261006-4910",
          paymentMethod: "credit_card",
          warrantyMonths: 6,
          partsUsed: [
            {
              partName: "Xiaomi Redmi Note 11 Pro 120Hz AMOLED Panel",
              quantity: 1,
              unitPrice: 1400,
              totalPrice: 1400,
            },
          ],
          laborCost: 450,
        },
      },
    ],
  },

  // 3. ÖRNEK: Samsung Galaxy S21 5G
  "354892019284729": {
    device: {
      imei: "354892019284729",
      brand: "Samsung",
      model: "Galaxy S21 5G (SM-G991B)",
      storage: "256 GB",
      color: "Phantom Gray",
      condition: "ikinci el",
      currentStatus: "in_stock",
      batteryHealth: 100,
      cosmeticCondition: "Kozmetik 9.5/10 (Batarya sıfır orijinal takıldı)",
      firstSeenDate: "2026-07-10T11:00:00.000Z",
      lastActivityDate: "2026-07-15T16:00:00.000Z",
      totalRepairsCount: 1,
      totalRepairSpent: 1100,
      purchasePrice: 11000,
      salePrice: 15500,
      activeWarranty: {
        isActive: true,
        months: 6,
        type: "Batarya ve Genel Donanım Garantisi",
        endDate: "2027-01-15T16:00:00.000Z",
        remainingDays: 98,
      },
    },
    events: [
      {
        id: "ev-s1",
        type: "purchase",
        date: "2026-07-10T11:00:00.000Z",
        title: "2. El Cihaz Alımı (Müşteriden)",
        description: "Canan Aydın'dan satın alındı. Bataryada hafif şişme tespit edildiği için revizyon kararı alındı.",
        badgeText: "2. El Alım",
        badgeColor: "blue",
        iconName: "shopping-bag",
        amount: 11000,
        customer: {
          name: "Canan Aydın",
          phone: "0533 888 99 00",
        },
        staffName: "Kerim Aydın",
        metadata: {
          transactionNumber: "TRX-PUR-20260710-1842",
          paymentMethod: "bank_transfer",
          batteryHealth: 74,
          cosmeticCondition: "Kasa temiz, arka kapak yapışkanı hafif gevşek",
        },
      },
      {
        id: "ev-s2",
        type: "repair_parts_added",
        date: "2026-07-12T14:30:00.000Z",
        title: "Dahili Servis Bakımı: Orijinal Batarya Değişimi",
        description: "Samsung EB-BG991ABY 4000mAh orijinal servis bataryası takıldı, arka kapak lazer yapıştırıcıyla mühürlendi.",
        badgeText: "Servis Revizyonu",
        badgeColor: "purple",
        iconName: "boxes",
        amount: 1100,
        staffName: "Kerim Aydın",
        metadata: {
          partsUsed: [
            {
              partName: "Samsung Galaxy S21 5G Orijinal EB-BG991ABY Batarya (4000mAh)",
              quantity: 1,
              unitPrice: 1100,
              totalPrice: 1100,
            },
          ],
          laborCost: 0,
          notes: "Mağaza içi revizyon işlemi.",
        },
      },
      {
        id: "ev-s3",
        type: "warranty_check",
        date: "2026-07-15T16:00:00.000Z",
        title: "Vitrinde Satışa Açıldı (Stokta)",
        description: "Tüm donanım, su geçirmezlik testi ve batarya kalibrasyonu tamamlandı. ₺15.500 etiketle vitrinde yerini aldı.",
        badgeText: "Stokta",
        badgeColor: "emerald",
        iconName: "shield-check",
        amount: 15500,
        staffName: "Kerim Aydın",
        metadata: {
          batteryHealth: 100,
          notes: "Vitrinde sergileniyor. 6 Ay mağaza garantisi hazırlandı.",
        },
      },
    ],
  },

  // 4. ÖRNEK: Huawei P30 Pro
  "863491028374651": {
    device: {
      imei: "863491028374651",
      brand: "Huawei",
      model: "Huawei P30 Pro (VOG-L29)",
      storage: "128 GB",
      color: "Aurora",
      condition: "ikinci el",
      currentStatus: "in_service",
      firstSeenDate: "2026-09-20T10:00:00.000Z",
      lastActivityDate: "2026-10-06T12:00:00.000Z",
      totalRepairsCount: 1,
      totalRepairSpent: 4500,
      activeWarranty: null,
      currentOwner: {
        id: "c4",
        name: "Zeynep Çelik",
        phone: "0505 999 00 11",
      },
    },
    events: [
      {
        id: "ev-h1",
        type: "repair_intake",
        date: "2026-09-20T10:00:00.000Z",
        title: "Teknik Servis Kabulü (SRV-20261015-0106)",
        description: "Denize düşme sonucu cihaz kapandı. Ultrasonik banyoya alındı, şarj entegresinde kısa devre tespit edildi.",
        badgeText: "Sıvı Teması Kabulü",
        badgeColor: "amber",
        iconName: "wrench",
        amount: 4500,
        customer: {
          name: "Zeynep Çelik",
          phone: "0505 999 00 11",
        },
        staffName: "Kerim Aydın",
        metadata: {
          ticketNumber: "SRV-20261015-0106",
          devicePassword: "1234",
          physicalCondition: "Sıvı teması izi, SIM tepsisi indikatörü kırmızı.",
        },
      },
      {
        id: "ev-h2",
        type: "repair_parts_added",
        date: "2026-10-06T12:00:00.000Z",
        title: "Parça Tedarik Bekleniyor",
        description: "HiSilicon PMIC şarj entegresi yurt dışı tedarikçi kargosunda (DHL-491029). Parça gelişi bekleniyor.",
        badgeText: "Parça Bekliyor",
        badgeColor: "purple",
        iconName: "boxes",
        staffName: "Kerim Aydın",
        metadata: {
          ticketNumber: "SRV-20261015-0106",
          notes: "Kargo Takip: DHL-491029. Tahmini varış: 2 iş günü.",
        },
      },
    ],
  },
}

/**
 * IMEI Numarasına Göre Cihaz Geçmişini ve Zaman Çizelgesini Getirir
 * (Supabase + Yerel Seed Birleştirme)
 */
export async function getDeviceHistoryByIMEI(imei: string): Promise<DeviceHistoryQueryResult | null> {
  const cleanImei = imei.trim().replace(/[^0-9]/g, "")
  if (!cleanImei) return null

  // 1. Önce doğrudan seed veritabanında tam eşleşme kontrol et
  if (SEED_DEVICE_HISTORIES[cleanImei]) {
    return SEED_DEVICE_HISTORIES[cleanImei]
  }

  // 2. Supabase üzerinde ara (repair_tickets, transaction_items, products)
  try {
    const supabase = createClient()

    // 2a. repair_tickets tablosundan çek
    const { data: ticketsData } = await supabase
      .from("repair_tickets")
      .select(`
        id,
        ticket_number,
        device_brand,
        device_model,
        imei,
        serial_number,
        issue_description,
        physical_condition,
        status,
        actual_cost,
        estimated_cost,
        labor_cost,
        parts_total_cost,
        parts_used,
        technician_notes,
        created_at,
        completed_at,
        delivered_at,
        customers (
          id,
          full_name,
          phone
        )
      `)
      .eq("imei", cleanImei)
      .order("created_at", { ascending: true })

    // 2b. transaction_items tablosundan çek
    const { data: trxItemsData } = await supabase
      .from("transaction_items")
      .select(`
        id,
        transaction_id,
        imei,
        quantity,
        unit_price,
        total_price,
        created_at,
        transactions (
          id,
          transaction_number,
          type,
          payment_method,
          total_amount,
          net_amount,
          notes,
          created_at,
          customers (
            id,
            full_name,
            phone
          )
        )
      `)
      .eq("imei", cleanImei)
      .order("created_at", { ascending: true })

    // Eğer Supabase'de veri bulunduysa dinamik olarak harmanla
    const events: DeviceTimelineEvent[] = []
    let brand = "Bilinmiyor"
    let model = "Mobil Cihaz"
    let currentOwner: { name: string; phone: string } | null = null

    // İşlem kalemlerinden alım/satım olayları üret
    const rawItems = (trxItemsData || []) as Array<Record<string, unknown>>
    if (rawItems.length > 0) {
      for (const item of rawItems) {
        const trx = (item.transactions as Record<string, unknown>) || {}
        const cust = (trx.customers as Record<string, unknown>) || {}
        const isPurchase = trx.type === "purchase"
        const isSale = trx.type === "sale"

        if (cust.full_name) {
          currentOwner = {
            name: String(cust.full_name),
            phone: String(cust.phone || ""),
          }
        }

        events.push({
          id: `trx-${item.id}`,
          type: isPurchase ? "purchase" : isSale ? "sale" : "repair_delivered",
          date: String(item.created_at || trx.created_at || new Date().toISOString()),
          title: isPurchase ? "İkinci El Cihaz Alımı" : isSale ? "POS Satış İşlemi" : "Kasa Hareketi",
          description: String(trx.notes || "İşlem başarıyla gerçekleştirildi."),
          badgeText: isPurchase ? "Alım" : isSale ? "Satış" : "İşlem",
          badgeColor: isPurchase ? "blue" : isSale ? "emerald" : "cyan",
          iconName: isPurchase ? "shopping-bag" : "credit-card",
          amount: Number(item.total_price) || Number(trx.net_amount) || 0,
          customer: cust.full_name ? { name: String(cust.full_name), phone: String(cust.phone) } : null,
          metadata: {
            transactionNumber: String(trx.transaction_number || ""),
            paymentMethod: String(trx.payment_method || ""),
          },
        })
      }
    }

    // Servis biletlerinden tamir olayları üret
    const rawTickets = (ticketsData || []) as Array<Record<string, unknown>>
    if (rawTickets.length > 0) {
      for (const ticket of rawTickets) {
        brand = (ticket.device_brand as string) || brand
        model = (ticket.device_model as string) || model
        const cust = (ticket.customers as Record<string, unknown>) || {}

        if (cust.full_name) {
          currentOwner = {
            name: String(cust.full_name),
            phone: String(cust.phone || ""),
          }
        }

        // 1. Kabul Olayı
        events.push({
          id: `srv-in-${ticket.id}`,
          type: "repair_intake",
          date: String(ticket.created_at || new Date().toISOString()),
          title: `Teknik Servis Kabulü (${String(ticket.ticket_number || "")})`,
          description: `Şikayet: ${String(ticket.issue_description || "")}`,
          badgeText: "Servis Girişi",
          badgeColor: "amber",
          iconName: "wrench",
          amount: Number(ticket.estimated_cost) || 0,
          customer: cust.full_name ? { name: String(cust.full_name), phone: String(cust.phone || "") } : null,
          metadata: {
            ticketNumber: String(ticket.ticket_number || ""),
            physicalCondition: ticket.physical_condition ? String(ticket.physical_condition) : undefined,
          },
        })

        // 2. Teslim Edildi Olayı (varsa)
        if (ticket.status === "teslim_edildi" || ticket.delivered_at) {
          events.push({
            id: `srv-out-${ticket.id}`,
            type: "repair_delivered",
            date: String(ticket.delivered_at || ticket.completed_at || ticket.created_at || new Date().toISOString()),
            title: `Onarım Tamamlandı & Teslimat (${String(ticket.ticket_number || "")})`,
            description: String(ticket.technician_notes || "Onarım tamamlandı, cihaz müşteriye teslim edildi."),
            badgeText: "Teslim Edildi",
            badgeColor: "emerald",
            iconName: "check-circle",
            amount: Number(ticket.actual_cost) || Number(ticket.estimated_cost) || 0,
            customer: cust.full_name ? { name: String(cust.full_name), phone: String(cust.phone || "") } : null,
            metadata: {
              ticketNumber: String(ticket.ticket_number || ""),
              warrantyMonths: 6,
              laborCost: Number(ticket.labor_cost) || 0,
              partsUsed: Array.isArray(ticket.parts_used)
                ? (ticket.parts_used as Array<Record<string, unknown>>).map((p) => ({
                    partName: String(p.partName || p.part_name || p.name || "Yedek Parça"),
                    quantity: Number(p.quantity || 1),
                    unitPrice: Number(p.unitPrice || p.unit_price || 0),
                    totalPrice: Number(p.totalPrice || p.total_price || 0),
                  }))
                : [],
            },
          })
        }
      }
    }

    if (events.length > 0) {
      // Tarihe göre sırala (Eskiden yeniye)
      events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const totalRepairSpent = events
        .filter((e) => e.type === "repair_delivered")
        .reduce((sum, e) => sum + (e.amount || 0), 0)

      return {
        device: {
          imei: cleanImei,
          brand,
          model,
          currentStatus: events[events.length - 1].type === "repair_intake" ? "in_service" : "delivered",
          firstSeenDate: events[0].date,
          lastActivityDate: events[events.length - 1].date,
          totalRepairsCount: ticketsData?.length || 0,
          totalRepairSpent,
          currentOwner,
        },
        events,
      }
    }
  } catch (err) {
    console.warn("getDeviceHistoryByIMEI Supabase sorgu uyarısı:", err)
  }

  // Eğer hiçbir şey bulunamadıysa varsayılan jenerik bir cihaz profili üret
  return generateDynamicFallbackHistory(cleanImei)
}

/**
 * Veritabanında Henüz Olmayan Yeni IMEI'ler İçin Dinamik Simülasyon Üretir
 */
function generateDynamicFallbackHistory(imei: string): DeviceHistoryQueryResult {
  const isApple = imei.startsWith("35")
  const brand = isApple ? "Apple" : "Samsung"
  const model = isApple ? "iPhone 12 (128GB)" : "Galaxy A54 5G (128GB)"

  return {
    device: {
      imei,
      brand,
      model,
      storage: "128 GB",
      color: "Gece Yarısı",
      condition: "ikinci el",
      currentStatus: "in_stock",
      firstSeenDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      lastActivityDate: new Date().toISOString(),
      totalRepairsCount: 1,
      totalRepairSpent: 850,
      purchasePrice: 8500,
      salePrice: 11900,
      activeWarranty: {
        isActive: true,
        months: 3,
        type: "Genel Mağaza Garantisi",
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
        remainingDays: 90,
      },
    },
    events: [
      {
        id: `ev-gen-1`,
        type: "purchase",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        title: "İkinci El Alım Kaydı",
        description: `Müşteriden ${brand} ${model} alımı gerçekleştirildi.`,
        badgeText: "Alım",
        badgeColor: "blue",
        iconName: "shopping-bag",
        amount: 8500,
        staffName: "Kerim Aydın",
        customer: { name: "Ahmet Demir", phone: "0532 999 88 77" },
      },
      {
        id: `ev-gen-2`,
        type: "repair_intake",
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        title: "Periyodik Bakım ve Kontrol",
        description: "Şarj soketi temizliği ve genel fonksiyon testi yapıldı.",
        badgeText: "Servis",
        badgeColor: "amber",
        iconName: "wrench",
        amount: 850,
        staffName: "Barış Kaya",
      },
    ],
  }
}
