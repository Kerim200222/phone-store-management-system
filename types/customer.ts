import { z } from "zod"
import { Customer } from "@/types/database"

/**
 * Müşteri Form Validasyon Şeması (Zod)
 * Telefon mağazası müşteri kayıt ve düzenleme formu gereksinimleri
 * Alanlar: Ad, Soyad, Telefon, Notlar ve cari hesap alanları
 */
export const customerFormSchema = z.object({
  first_name: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır.")
    .max(50, "Ad en fazla 50 karakter olabilir.")
    .trim(),
  last_name: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır.")
    .max(50, "Soyad en fazla 50 karakter olabilir.")
    .trim(),
  phone: z
    .string()
    .min(10, "Telefon numarası en az 10 karakter olmalıdır (Örn: 0532 123 45 67).")
    .max(20, "Telefon numarası 20 karakteri geçemez.")
    .regex(
      /^(\+90|0)?[1-9][0-9]{9}$|^(\+90|0)?\s?[1-9][0-9]{2}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}$/,
      "Geçerli bir telefon numarası giriniz (Örn: 0532 123 45 67)."
    )
    .trim(),
  email: z
    .string()
    .email("Geçerli bir e-posta adresi giriniz.")
    .optional()
    .or(z.literal("")),
  identity_number: z
    .string()
    .regex(/^[0-9]{10,11}$/, "T.C. Kimlik (11 hane) veya Vergi Kimlik No (10 hane) rakamlardan oluşmalıdır.")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(300, "Adres en fazla 300 karakter olabilir.")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(1000, "Notlar en fazla 1000 karakter olabilir.")
    .optional()
    .or(z.literal("")),
  balance: z.number(),
  customer_type: z.enum(["bireysel", "kurumsal"]),
  is_active: z.boolean(),
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>

/**
 * Genişletilmiş Müşteri Veri Yapısı (UI ve DB Entegrasyonu)
 */
export interface CustomerItem extends Customer {
  customer_type?: "bireysel" | "kurumsal"
  total_transactions?: number
  first_name?: string
  last_name?: string
}

/**
 * İsim ve Soyisimi Ayırma Yardımcısı
 */
export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: "", lastName: "" }
  const parts = fullName.trim().split(" ")
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" }
  }
  const lastName = parts.pop() || ""
  const firstName = parts.join(" ")
  return { firstName, lastName }
}

/**
 * Telefon Numarasını Standart Formata Çevirme (05XX XXX XX XX)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ""
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) {
    // 5321234567 -> 0532 123 45 67
    return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`
  } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
    // 05321234567 -> 0532 123 45 67
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)}`
  } else if (cleaned.length === 12 && cleaned.startsWith("90")) {
    // 905321234567 -> +90 532 123 45 67
    return `+90 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`
  }
  return phone
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
 * İlk / Fallback Müşteri Veri Kümesi (Telefon Mağazası Örnekleri)
 */
export const INITIAL_CUSTOMERS: CustomerItem[] = [
  {
    id: "cust-001",
    full_name: "Ahmet Yılmaz",
    first_name: "Ahmet",
    last_name: "Yılmaz",
    phone: "0532 111 22 33",
    email: "ahmet.yilmaz@email.com",
    identity_number: "12345678901",
    address: "Kadıköy / İstanbul (Bağdat Caddesi No:42)",
    notes: "iPhone 14 Pro Max ekran değişimi yapıldı (Orijinal GX Panel). 6 ay ekran garantisi tanımlandı. VIP Müşteri.",
    balance: -3200, // Mağazaya borcu (Veresiye)
    customer_type: "bireysel",
    total_transactions: 5,
    is_active: true,
    created_at: "2026-09-15T10:30:00Z",
    updated_at: "2026-10-01T14:20:00Z",
  },
  {
    id: "cust-002",
    full_name: "Fatma Kaya",
    first_name: "Fatma",
    last_name: "Kaya",
    phone: "0542 333 44 55",
    email: "fatma.kaya@outlook.com",
    identity_number: "23456789012",
    address: "Çankaya / Ankara (Tunalı Hilmi Cad.)",
    notes: "Samsung S23 Ultra batarya değişimi ve arka kapak onarımı. Yedek parça teslimi bekleniyor.",
    balance: 0,
    customer_type: "bireysel",
    total_transactions: 3,
    is_active: true,
    created_at: "2026-09-20T11:15:00Z",
    updated_at: "2026-09-28T09:00:00Z",
  },
  {
    id: "cust-003",
    full_name: "Mehmet Öztürk",
    first_name: "Mehmet",
    last_name: "Öztürk",
    phone: "0555 777 88 99",
    email: "mehmet.oz@holding.com.tr",
    identity_number: "34567890123",
    address: "Konak / İzmir (Alsancak Mah.)",
    notes: "Kurumsal filo telefonları bakımı: 4 adet iPhone 13 batarya ve kasa yenileme. Avans ödemesi alındı.",
    balance: 1500, // Mağazada alacağı / peşin avansı var
    customer_type: "kurumsal",
    total_transactions: 8,
    is_active: true,
    created_at: "2026-09-22T14:45:00Z",
    updated_at: "2026-10-02T16:10:00Z",
  },
  {
    id: "cust-004",
    full_name: "Zeynep Çelik",
    first_name: "Zeynep",
    last_name: "Çelik",
    phone: "0505 999 00 11",
    email: "zeynep.celik@gmail.com",
    identity_number: "45678901234",
    address: "Nilüfer / Bursa (FSM Bulvarı)",
    notes: "Sıfır iPhone 15 alımı yaptı. Yanında 20W adaptör ve Spigen kılıf hediye edildi. Memnun müşteri.",
    balance: 0,
    customer_type: "bireysel",
    total_transactions: 2,
    is_active: true,
    created_at: "2026-09-25T16:00:00Z",
    updated_at: "2026-09-25T16:40:00Z",
  },
  {
    id: "cust-005",
    full_name: "TeknoServis Ltd. Şti.",
    first_name: "TeknoServis",
    last_name: "Ltd. Şti.",
    phone: "0212 555 12 34",
    email: "muhasebe@teknoservis.com",
    identity_number: "8765432109",
    address: "Şişli / İstanbul (Mecidiyeköy Mah. No:18)",
    notes: "Toptan yedek parça ve ekran paneli cari hesabı. Aylık periyodik fatura kesiliyor. Güvenilir bayi.",
    balance: -8450, // Açık cari borç
    customer_type: "kurumsal",
    total_transactions: 14,
    is_active: true,
    created_at: "2026-09-10T09:00:00Z",
    updated_at: "2026-10-03T11:20:00Z",
  },
  {
    id: "cust-006",
    full_name: "Can Demir",
    first_name: "Can",
    last_name: "Demir",
    phone: "0533 444 55 66",
    email: "can.demir@icloud.com",
    identity_number: "56789012345",
    address: "Muratpaşa / Antalya (Lara Cad.)",
    notes: "İkinci el Xiaomi 13 Pro satışı yapıldı. IMEI kaydı ve fatura teslim edildi. 1 yıl dükkan garantili.",
    balance: 750, // Fazla ödeme avansı
    customer_type: "bireysel",
    total_transactions: 1,
    is_active: true,
    created_at: "2026-09-28T13:20:00Z",
    updated_at: "2026-09-28T13:55:00Z",
  },
]
