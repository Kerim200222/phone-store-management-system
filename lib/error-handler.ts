/**
 * Telefon Mağazası Yönetim Sistemi - Merkezi Hata Yönetimi & Edge Case Çözümleri
 * Hafta 7: Güvenlik, Test ve Canlıya Alma - Gün 32
 */

export interface AppErrorDetails {
  title: string
  userMessage: string
  code?: string | number
  isNetwork: boolean
  isAuth: boolean
  isPermission: boolean
  isTimeout: boolean
  technicalDetails?: string
}

/**
 * Tarayıcının çevrimdışı olup olmadığını güvenli kontrol eder (SSR dostu)
 */
export function isOffline(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false
  }
  return !navigator.onLine
}

/**
 * Her türlü hatayı analiz edip kullanıcı dostu Türkçe hata ayrıntılarına dönüştürür.
 */
export function parseAppError(error: unknown, fallbackTitle = "İşlem Başarısız"): AppErrorDetails {
  // 1. Ağ / Çevrimdışı (Offline) Kontrolü
  if (isOffline()) {
    return {
      title: "İnternet Bağlantısı Yok",
      userMessage: "Cihazınızın internet bağlantısı kesildi. Lütfen ağ bağlantınızı kontrol edip tekrar deneyin. Verileriniz yerel olarak korunmaktadır.",
      isNetwork: true,
      isAuth: false,
      isPermission: false,
      isTimeout: false,
      code: "NETWORK_OFFLINE"
    }
  }

  // 2. Error nesnesi çözümlemesi
  const err = error as Record<string, unknown> | null | undefined
  const rawMessage = typeof error === "string" 
    ? error 
    : (err?.message as string) || (err?.error_description as string) || (err?.details as string) || ""
  
  const rawCode = (err?.code as string | number) || (err?.status as string | number) || ""
  const messageLower = rawMessage.toLowerCase()

  // 3. Ağ & Fetch Hataları
  if (
    messageLower.includes("failed to fetch") ||
    messageLower.includes("networkerror") ||
    messageLower.includes("network error") ||
    messageLower.includes("err_connection_refused") ||
    messageLower.includes("load failed") ||
    messageLower.includes("fetch failed")
  ) {
    return {
      title: "Bağlantı Hatası",
      userMessage: "Sunucuya ulaşılamıyor veya internet bağlantınızda kopma yaşandı. Lütfen birkaç saniye sonra tekrar deneyin.",
      isNetwork: true,
      isAuth: false,
      isPermission: false,
      isTimeout: false,
      code: "NETWORK_FETCH_FAILED",
      technicalDetails: rawMessage
    }
  }

  // 4. Zaman Aşımı (Timeout) Hataları
  if (
    messageLower.includes("timeout") ||
    messageLower.includes("abort") ||
    rawCode === 504 ||
    rawCode === "57014"
  ) {
    return {
      title: "İstek Zaman Aşımına Uğradı",
      userMessage: "Veritabanı veya sunucu belirlenen sürede yanıt vermedi. Sunucu yoğun olabilir, lütfen sayfayı yenileyip tekrar deneyin.",
      isNetwork: false,
      isAuth: false,
      isPermission: false,
      isTimeout: true,
      code: "REQUEST_TIMEOUT",
      technicalDetails: rawMessage
    }
  }

  // 5. Supabase RLS ve PostgreSQL Hata Kodları
  if (rawCode === "42501" || messageLower.includes("permission denied") || messageLower.includes("policy")) {
    return {
      title: "Yetki Hatası (RLS)",
      userMessage: "Bu veriyi görme veya üzerinde işlem yapma yetkiniz bulunmamaktadır. İşlem için Yönetici (Admin) rolü gerekebilir.",
      isNetwork: false,
      isAuth: false,
      isPermission: true,
      isTimeout: false,
      code: "42501",
      technicalDetails: rawMessage
    }
  }

  if (rawCode === "23505" || messageLower.includes("duplicate key") || messageLower.includes("unique")) {
    return {
      title: "Mükerrer Kayıt Hatası",
      userMessage: "Girdiğiniz barkod, seri numarası veya IMEI numarası sistemde zaten kayıtlı. Lütfen benzersiz bir değer girin.",
      isNetwork: false,
      isAuth: false,
      isPermission: false,
      isTimeout: false,
      code: "23505",
      technicalDetails: rawMessage
    }
  }

  if (rawCode === "23503" || messageLower.includes("foreign key")) {
    return {
      title: "İlişkili Veri Hatası",
      userMessage: "İşlem yapılmak istenen müşteri, kategori veya ürün ilişkisi bulunamadı veya silinmiş olabilir.",
      isNetwork: false,
      isAuth: false,
      isPermission: false,
      isTimeout: false,
      code: "23503",
      technicalDetails: rawMessage
    }
  }

  // 6. Kimlik Doğrulama (Auth) Hataları
  if (
    messageLower.includes("jwt expired") ||
    messageLower.includes("invalid claim") ||
    messageLower.includes("session expired") ||
    rawCode === 401 ||
    rawCode === "PGRST301"
  ) {
    return {
      title: "Oturum Süresi Doldu",
      userMessage: "Güvenlik gereği kullanıcı oturumunuz sonlanmıştır. Lütfen yeniden giriş yapınız.",
      isNetwork: false,
      isAuth: true,
      isPermission: false,
      isTimeout: false,
      code: "AUTH_EXPIRED",
      technicalDetails: rawMessage
    }
  }

  if (messageLower.includes("invalid login") || messageLower.includes("invalid credentials")) {
    return {
      title: "Giriş Başarısız",
      userMessage: "E-posta adresi veya şifre hatalı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.",
      isNetwork: false,
      isAuth: true,
      isPermission: false,
      isTimeout: false,
      code: "AUTH_INVALID_CREDENTIALS",
      technicalDetails: rawMessage
    }
  }

  // 7. Genel / Beklenmeyen Hatalar
  return {
    title: fallbackTitle,
    userMessage: rawMessage && rawMessage.length < 150 
      ? rawMessage 
      : "İşlem sırasında beklenmeyen bir hata meydana geldi. Sistem verilerinizi korumak için işlemi durdurdu.",
    isNetwork: false,
    isAuth: false,
    isPermission: false,
    isTimeout: false,
    code: String(rawCode || "UNKNOWN_ERROR"),
    technicalDetails: rawMessage
  }
}

/**
 * Hata mesajını tek satırlık anlaşılır kullanıcı mesajı olarak döner
 */
export function getErrorMessage(error: unknown, fallback = "Beklenmeyen bir hata oluştu."): string {
  const parsed = parseAppError(error)
  return parsed.userMessage || fallback
}
