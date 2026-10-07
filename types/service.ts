import { z } from "zod"
import { POSCustomerSelect } from "@/types/pos"

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
