import { z } from "zod"
import { POSCustomerSelect } from "@/types/pos"
import { RepairPartItem, PaymentMethod } from "@/types/database"

/**
 * Arıza Kategorileri
 */
export const ISSUE_CATEGORIES = [
  "Ekran & Dokunmatik",
  "Batarya & Güç",
  "Sıvı Teması",
  "Şarj Soketi & Bord",
  "Kamera & Sensörler",
  "Kasa, Çerçeve & Arka Cam",
  "Anakart & Entegre Onarımı",
  "Ses, Hoparlör & Mikrofon",
  "Yazılım, Güncelleme & Reset",
  "Diğer / Genel Bakım",
] as const

export type IssueCategory = typeof ISSUE_CATEGORIES[number]

/**
 * Servis Öncelik Seviyeleri
 */
export const SERVICE_PRIORITIES = [
  { value: "normal", label: "Normal (Standart Sıra)", color: "text-slate-600 bg-slate-100" },
  { value: "high", label: "Yüksek Öncelik (Aynı Gün)", color: "text-amber-700 bg-amber-100" },
  { value: "critical", label: "Kritik / Acil (Ekspres 2 Saat)", color: "text-red-700 bg-red-100" },
] as const

export type ServicePriority = "normal" | "high" | "critical"

/**
 * Yeni Servis Kayıt Formu Validasyon Şeması (Zod)
 */
export const serviceTicketFormSchema = z.object({
  customerId: z.string().min(1, { message: "Lütfen cihazı teslim eden müşteriyi seçiniz." }),
  deviceBrand: z.string().min(1, { message: "Cihaz markası zorunludur." }).max(100),
  deviceModel: z.string().min(1, { message: "Cihaz modeli zorunludur." }).max(100),
  imei: z
    .string()
    .max(15, { message: "IMEI en fazla 15 hane olabilir." })
    .regex(/^$|^[0-9]{15}$/, { message: "IMEI 15 haneli rakam olmalıdır veya boş bırakılmalıdır." })
    .optional()
    .or(z.literal("")),
  serialNumber: z.string().max(100).optional().or(z.literal("")),
  hasPassword: z.boolean(),
  passwordType: z.enum(["pin", "text", "pattern", "none"]),
  devicePassword: z.string().max(100).optional().or(z.literal("")),
  patternNotes: z.string().max(200).optional().or(z.literal("")),
  issueCategory: z.enum(ISSUE_CATEGORIES),
  issueDescription: z
    .string()
    .min(5, { message: "Arıza şikayetini en az 5 karakter olarak açıklayınız." })
    .max(1000, { message: "Şikayet açıklaması en fazla 1000 karakter olabilir." }),
  physicalCondition: z
    .string()
    .min(3, { message: "Cihazın dış görünüm durumunu (çizik, kırık, darbe vb.) belirtiniz." })
    .max(1000),
  // Dış görünüm hızlı kontrol kutucukları
  condScreenScratched: z.boolean(),
  condScreenCracked: z.boolean(),
  condBackGlassCracked: z.boolean(),
  condCaseDented: z.boolean(),
  condLiquidDamage: z.boolean(),
  condCameraGlassCracked: z.boolean(),
  condScrewsMissing: z.boolean(),
  // Teslim alınan aksesuarlar
  accSimCard: z.boolean(),
  accMemoryCard: z.boolean(),
  accProtectiveCase: z.boolean(),
  accOriginalBox: z.boolean(),
  accCharger: z.boolean(),
  accOther: z.string().max(200).optional().or(z.literal("")),
  estimatedCost: z
    .number()
    .min(0, { message: "Tahmini tutar 0 veya üzeri olmalıdır." }),
  priority: z.enum(["normal", "high", "critical"]),
  technicianNotes: z.string().max(1000).optional().or(z.literal("")),
  assignedTechnician: z.string().optional().or(z.literal("")),
  backupConsent: z.boolean().refine((val) => val === true, {
    message: "Müşteri veri kaybı sorumluluğu ve servis koşullarını onaylamalıdır.",
  }),
})

export type ServiceTicketFormValues = z.infer<typeof serviceTicketFormSchema>

/**
 * Yazdırılabilir Servis Fişi / Kabul Belgesi Modeli
 */
export interface ServiceTicketReceiptData {
  ticketNumber: string
  date: string
  customer: POSCustomerSelect
  device: {
    brand: string
    model: string
    imei?: string | null
    serialNumber?: string | null
    passwordType: string
    devicePassword?: string | null
    patternNotes?: string | null
    physicalCondition: string
    cosmeticDefects: string[]
    accessories: string[]
  }
  service: {
    category: string
    issueDescription: string
    technicianNotes?: string | null
    estimatedCost: number
    priority: ServicePriority
    assignedTechnician?: string | null
  }
  store: {
    name: string
    branch: string
    address: string
    phone: string
    taxNumber: string
  }
}

/**
 * Hızlı Test ve Demo Şablonları (Servis Ön Tanımları)
 */
export interface ServicePreset {
  id: string
  title: string
  brand: string
  model: string
  issueCategory: IssueCategory
  issueDescription: string
  passwordType: "pin" | "text" | "pattern" | "none"
  devicePassword: string
  physicalCondition: string
  estimatedCost: number
  priority: ServicePriority
  condScreenCracked?: boolean
  condBackGlassCracked?: boolean
  condCaseDented?: boolean
  condLiquidDamage?: boolean
}

export const SERVICE_PRESETS: ServicePreset[] = [
  {
    id: "preset-iphone13-screen",
    title: "📱 iPhone 13 - Ekran Kırık & Dokunmatik Basmıyor",
    brand: "Apple",
    model: "iPhone 13 (A2633)",
    issueCategory: "Ekran & Dokunmatik",
    issueDescription: "Cihaz yere düştü, cam tamamen çatlak, alt kısımda mürekkep akması ve yeşil çizgi var. Dokunmatik tepki vermiyor.",
    passwordType: "pin",
    devicePassword: "1907",
    physicalCondition: "Ön cam tamamen kırık, sağ üst köşe kasada 2mm ezik mevcut. Arka cam sağlam.",
    estimatedCost: 3450,
    priority: "high",
    condScreenCracked: true,
    condCaseDented: true,
  },
  {
    id: "preset-s21-battery",
    title: "🔋 Galaxy S21 - Batarya Şişmesi & Aşırı Isınma",
    brand: "Samsung",
    model: "Galaxy S21 5G (SM-G991B)",
    issueCategory: "Batarya & Güç",
    issueDescription: "Cihaz şarjda çok ısınıyor, şarjı %30'dayken aniden kapanıyor. Arka kapak batarya şişmesinden ötürü hafif ayrılmış.",
    passwordType: "pin",
    devicePassword: "2468",
    physicalCondition: "Arka kapak yapışkanı sol taraftan atmış. Ekranda kılcal çizikler mevcut, kırık yok.",
    estimatedCost: 1650,
    priority: "normal",
    condScreenCracked: false,
    condBackGlassCracked: false,
  },
  {
    id: "preset-xiaomi-socket",
    title: "⚡ Xiaomi 12 - Şarj Soketi Temassızlık / Şarj Almıyor",
    brand: "Xiaomi",
    model: "Xiaomi 12 (2201123G)",
    issueCategory: "Şarj Soketi & Bord",
    issueDescription: "Type-C kablosu takıldığında şarj almıyor, kabloyu belirli bir açıyla bükünce bazen temas ediyor. Soket gevşemiş.",
    passwordType: "none",
    devicePassword: "",
    physicalCondition: "Kozmetik temiz, soket girişinde toz birikintisi ve pinlerde aşınma var.",
    estimatedCost: 850,
    priority: "normal",
  },
  {
    id: "preset-liquid-iphone14",
    title: "🌊 iPhone 14 Pro - Sıvı Teması / Cihaz Açılmıyor",
    brand: "Apple",
    model: "iPhone 14 Pro (A2890)",
    issueCategory: "Sıvı Teması",
    issueDescription: "Havuz suyuna düştü, hemen çıkarılıp pirince konmuş ancak cihaz artık hiç açılmıyor ve şarja tepki vermiyor. Isınma var.",
    passwordType: "pin",
    devicePassword: "1234",
    physicalCondition: "SIM tepsisi içerisindeki sıvı temas göstergesi kırmızıya dönmüş. Kasada çizik yok.",
    estimatedCost: 5500,
    priority: "critical",
    condLiquidDamage: true,
  },
]

/**
 * Teknik Servis Kanban Sütun Tanımları (Gün 22)
 */
export type KanbanColumnId = "bekliyor" | "islemde" | "parca_bekliyor" | "tamamlandi"

export interface KanbanColumnConfig {
  id: KanbanColumnId
  title: string
  subtitle: string
  color: "amber" | "cyan" | "purple" | "emerald"
  badgeClass: string
  headerBg: string
  columnBorder: string
  accentColor: string
}

export const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    id: "bekliyor",
    title: "Bekliyor",
    subtitle: "Kabul Edildi / İnceleme Sırasında",
    color: "amber",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    headerBg: "bg-amber-950/30 border-amber-800/40",
    columnBorder: "border-amber-500/20",
    accentColor: "#f59e0b",
  },
  {
    id: "islemde",
    title: "İşlemde",
    subtitle: "Masada / Tamir Ediliyor",
    color: "cyan",
    badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    headerBg: "bg-cyan-950/30 border-cyan-800/40",
    columnBorder: "border-cyan-500/20",
    accentColor: "#06b6d4",
  },
  {
    id: "parca_bekliyor",
    title: "Parça Bekliyor",
    subtitle: "Tedarikçi / Yedek Parça Siparişi",
    color: "purple",
    badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    headerBg: "bg-purple-950/30 border-purple-800/40",
    columnBorder: "border-purple-500/20",
    accentColor: "#a855f7",
  },
  {
    id: "tamamlandi",
    title: "Tamamlandı",
    subtitle: "Test Edildi / Teslime Hazır",
    color: "emerald",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    headerBg: "bg-emerald-950/30 border-emerald-800/40",
    columnBorder: "border-emerald-500/20",
    accentColor: "#10b981",
  },
]

/**
 * Kanban Panosu ve Liste Görünümünde Gösterilen Servis Bileti Modeli
 */
export interface ServiceTicketDisplay {
  id: string
  ticket_number: string
  customer_id: string
  customer_name: string
  customer_phone: string
  customer_email?: string | null
  device_brand: string
  device_model: string
  imei: string | null
  serial_number?: string | null
  device_password: string | null
  pattern_code: string | null
  physical_condition: string | null
  has_accessories: string | null
  issue_description: string
  issue_category?: string
  technician_notes: string | null
  status: KanbanColumnId | "iade" | "teslim_edildi" | "iptal"
  priority: ServicePriority
  estimated_cost: number
  labor_cost?: number
  parts_total_cost?: number
  actual_cost: number
  parts_used?: RepairPartItem[]
  assigned_technician?: string | null
  completed_at?: string | null
  delivered_at?: string | null
  transaction_number?: string | null
  created_at: string
  updated_at: string
}

export interface ServiceFilterOptions {
  searchQuery: string
  priority: "all" | ServicePriority
  brand: "all" | string
  viewMode: "kanban" | "list"
}

/**
 * Gün 23: Yedek Parça ve İşçilik Ekleme Tipleri
 */
export interface LaborPreset {
  id: string
  title: string
  amount: number
  description: string
  category: string
}

export const COMMON_LABOR_PRESETS: LaborPreset[] = [
  {
    id: "labor-screen",
    title: "Ekran & Dokunmatik Montajı",
    amount: 450,
    description: "Ekran sökümü, TrueTone ve FaceID flex aktarımı, su geçirmezlik conta yenileme",
    category: "Ekran",
  },
  {
    id: "labor-battery",
    title: "Batarya Değişimi & Kalibrasyon",
    amount: 350,
    description: "Eski pilin kimyasal sökümü, orijinal yapışkan bantlama ve şarj-deşarj kalibrasyonu",
    category: "Batarya",
  },
  {
    id: "labor-socket",
    title: "Şarj Soketi / Alt Bord İşçiliği",
    amount: 350,
    description: "Alt bord flex montajı, mikrofon ve anten hatları temas kontrolü",
    category: "Şarj / Bord",
  },
  {
    id: "labor-micro-solder",
    title: "Mikro Lehim & Entegre Onarımı (BGA)",
    amount: 950,
    description: "Mikroskop altında kısa devre tespiti, entegre kalıplama (reballing) ve lehimleme",
    category: "Anakart",
  },
  {
    id: "labor-liquid",
    title: "Sıvı Teması Ultrasonik Banyo & Temizlik",
    amount: 600,
    description: "İzopropil alkol ile korozyon temizliği, kurutma ve empedans ölçümü",
    category: "Sıvı Teması",
  },
  {
    id: "labor-backglass",
    title: "Lazerle Arka Cam Temizliği & Presleme",
    amount: 550,
    description: "Fiber lazerle cam boyası kazıma, cam kırıntı temizliği ve presli yapıştırma",
    category: "Kasa / Cam",
  },
]

export interface SparePartOption {
  id: string
  name: string
  brand: string
  compatibleModel: string
  category: "Yedek Parça" | "Aksesuar"
  sku: string
  stock_quantity: number
  sale_price: number
  cost_price: number
  shelf_location: string
}

export const INITIAL_SPARE_PARTS: SparePartOption[] = [
  {
    id: "part-1",
    name: "GX iPhone 13 OLED Orijinal Kalite Ekran Paneli",
    brand: "Apple",
    compatibleModel: "iPhone 13 (A2633)",
    category: "Yedek Parça",
    sku: "PRT-IP13-OLED",
    stock_quantity: 8,
    sale_price: 2750,
    cost_price: 2100,
    shelf_location: "Raf A-1 (Ekranlar)",
  },
  {
    id: "part-2",
    name: "Deji iPhone 13 Mucize Batarya 3227mAh Yüksek Kapasite",
    brand: "Apple",
    compatibleModel: "iPhone 13 (A2633)",
    category: "Yedek Parça",
    sku: "PRT-IP13-BAT",
    stock_quantity: 14,
    sale_price: 950,
    cost_price: 520,
    shelf_location: "Çekmece B-2 (Piller)",
  },
  {
    id: "part-3",
    name: "Samsung Galaxy S21 5G Orijinal EB-BG991ABY Batarya (4000mAh)",
    brand: "Samsung",
    compatibleModel: "Galaxy S21 5G (SM-G991B)",
    category: "Yedek Parça",
    sku: "PRT-S21-BAT",
    stock_quantity: 6,
    sale_price: 1100,
    cost_price: 650,
    shelf_location: "Çekmece B-4",
  },
  {
    id: "part-4",
    name: "Samsung Galaxy S21 5G Dynamic AMOLED 2X Ekran Modülü",
    brand: "Samsung",
    compatibleModel: "Galaxy S21 5G (SM-G991B)",
    category: "Yedek Parça",
    sku: "PRT-S21-DISP",
    stock_quantity: 4,
    sale_price: 3900,
    cost_price: 2950,
    shelf_location: "Raf A-3",
  },
  {
    id: "part-5",
    name: "Xiaomi 12 Type-C Hızlı Şarj Soketi & Alt Bord Modülü",
    brand: "Xiaomi",
    compatibleModel: "Xiaomi 12 (2201123G)",
    category: "Yedek Parça",
    sku: "PRT-MI12-SUB",
    stock_quantity: 12,
    sale_price: 450,
    cost_price: 210,
    shelf_location: "Kutu C-1 (Bordlar)",
  },
  {
    id: "part-6",
    name: "iPhone 12 Pro Lazer Uyumlu Arka Cam Panel (Grafit)",
    brand: "Apple",
    compatibleModel: "iPhone 12 Pro (A2407)",
    category: "Yedek Parça",
    sku: "PRT-IP12P-BC",
    stock_quantity: 9,
    sale_price: 750,
    cost_price: 380,
    shelf_location: "Raf D-2",
  },
  {
    id: "part-7",
    name: "iPhone 12 Pro 12MP Geniş Açı Orijinal Kamera Lensi",
    brand: "Apple",
    compatibleModel: "iPhone 12 Pro (A2407)",
    category: "Yedek Parça",
    sku: "PRT-IP12P-CAM",
    stock_quantity: 5,
    sale_price: 1200,
    cost_price: 700,
    shelf_location: "Çekmece E-1",
  },
  {
    id: "part-8",
    name: "Galaxy Z Flip 4 Orijinal Katlanabilir AMOLED İç Ekran Modülü",
    brand: "Samsung",
    compatibleModel: "Galaxy Z Flip 4 (SM-F721B)",
    category: "Yedek Parça",
    sku: "PRT-ZF4-FOLD",
    stock_quantity: 2,
    sale_price: 4800,
    cost_price: 3600,
    shelf_location: "Kasa İçi Özel Raf",
  },
  {
    id: "part-9",
    name: "Huawei P30 Pro HiSilicon Şarj & PMIC Güç Entegresi",
    brand: "Huawei",
    compatibleModel: "Huawei P30 Pro (VOG-L29)",
    category: "Yedek Parça",
    sku: "PRT-P30P-PMIC",
    stock_quantity: 7,
    sale_price: 850,
    cost_price: 420,
    shelf_location: "Mikro Kutu 12",
  },
  {
    id: "part-10",
    name: "iPhone 11 Ahize & Yakınlık Sensörü Flex Kablosu",
    brand: "Apple",
    compatibleModel: "iPhone 11 (A2221)",
    category: "Yedek Parça",
    sku: "PRT-IP11-EAR",
    stock_quantity: 11,
    sale_price: 320,
    cost_price: 140,
    shelf_location: "Kutu C-4",
  },
]

export interface UpdateTicketCostPayload {
  parts_used: RepairPartItem[]
  parts_total_cost: number
  labor_cost: number
  actual_cost: number
  technician_notes?: string
  status?: KanbanColumnId
}

/**
 * ==============================================================================
 * GÜN 24: SERVİS TAMAMLAMA, MÜŞTERİ BİLDİRİMİ VE KASA TAHSİLATI MODELLERİ
 * ==============================================================================
 */

export interface ServiceDeliveryCheckoutPayload {
  ticketId: string
  ticketNumber: string
  customerId?: string | null
  customerName: string
  customerPhone: string
  deviceBrand: string
  deviceModel: string
  imei?: string | null
  paymentMethod: PaymentMethod // 'cash' | 'credit_card' | 'bank_transfer' | 'on_account' | 'split'
  totalAmount: number // Actual cost (parts + labor)
  discountAmount: number
  netAmount: number
  paidAmount: number
  warrantyPeriodMonths: number // 0, 1, 3, 6, 12
  warrantyNotes?: string
  deliveredTo: string // Cihazı teslim alan kişi
  technicianNotes?: string
  internalNotes?: string
  sendNotification?: boolean
  notificationChannel?: "whatsapp" | "sms" | "none"
}

export interface ServiceDeliveryResult {
  success: boolean
  transactionId?: string
  transactionNumber?: string
  ticketNumber?: string
  deliveredAt?: string
  message?: string
  error?: string
}

export interface CustomerNotificationTemplate {
  customerName: string
  customerPhone: string
  ticketNumber: string
  deviceBrand: string
  deviceModel: string
  totalAmount: number
  warrantyPeriod?: string
  storeName?: string
  storePhone?: string
  storeAddress?: string
}

/**
 * Onarım Tamamlandığında Müşteriye Gönderilecek Hazır Bildirim Metni (WhatsApp / SMS)
 */
export function generateCompletionNotificationText(data: CustomerNotificationTemplate): string {
  const store = data.storeName || "Phone Store Teknik Servis"
  const phone = data.storePhone || "0212 555 00 24"
  const formattedAmount = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(data.totalAmount)

  return `Sayın ${data.customerName}, ${data.deviceBrand} ${data.deviceModel} cihazınızın teknik servis bakım ve onarımı başarıyla tamamlanmıştır.

Toplam Tutar: ${formattedAmount}
Servis Takip No: ${data.ticketNumber}

Cihazınızı mağazamızdan teslim alabilirsiniz. Bizi tercih ettiğiniz için teşekkür ederiz.
${store} - Tel: ${phone}`
}

/**
 * Cihaz Teslim Edildiğinde ve Tahsilat Alındığında Bilgilendirme Metni
 */
export function generateDeliveryNotificationText(data: CustomerNotificationTemplate): string {
  const store = data.storeName || "Phone Store Teknik Servis"
  const formattedAmount = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(data.totalAmount)

  const warrantyText = data.warrantyPeriod && data.warrantyPeriod !== "Garantisiz"
    ? `\nCihazınız ${data.warrantyPeriod} boyunca servis garantimiz altındadır.`
    : ""

  return `Sayın ${data.customerName}, ${data.deviceBrand} ${data.deviceModel} cihazınız tarafınıza teslim edilmiş ve ${formattedAmount} tutarındaki servis ödemesi tahsil edilmiştir.${warrantyText}

Servis Fişi / Kasa No: ${data.ticketNumber}
Hayırlı günlerde kullanmanızı dileriz.
${store}`
}



