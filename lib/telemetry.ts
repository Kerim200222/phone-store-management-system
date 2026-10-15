import * as Sentry from "@sentry/nextjs"

/**
 * ==============================================================================
 * CENTRALIZED OBSERVABILITY & TELEMETRY SERVICE
 * ==============================================================================
 * Uygulama genelindeki kritik hataları Sentry platformuna iletir,
 * kullanıcı rolünü ilişkilendirir ve kişisel verileri (PII) maskeler.
 * ==============================================================================
 */

/**
 * E-posta adresini KVKK / GDPR standartlarına uygun maskeler (örn: a***@domain.com)
 */
function maskEmail(email?: string): string {
  if (!email || !email.includes("@")) return "anonymous@domain.local"
  const [localPart, domain] = email.split("@")
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`
  }
  return `${localPart[0]}${"*".repeat(localPart.length - 2)}${localPart.slice(-1)}@${domain}`
}

/**
 * Sentry scope'una güvenli (PII maskelenmiş) kullanıcı bağlamı ekler.
 */
export function setTelemetryUser(user: { id: string; role?: string; email?: string }) {
  try {
    Sentry.setUser({
      id: user.id,
      username: user.role || "Personel",
      email: maskEmail(user.email),
    })
    Sentry.setTag("user_role", user.role || "unassigned")
  } catch (err) {
    console.warn("[Telemetry] Kullanıcı bağlamı ayarlanamadı:", err)
  }
}

/**
 * Kullanıcı oturumu kapandığında telemetri bağlamını sıfırlar.
 */
export function clearTelemetryUser() {
  try {
    Sentry.setUser(null)
  } catch (err) {
    console.warn("[Telemetry] Kullanıcı bağlamı temizlenemedi:", err)
  }
}

/**
 * Merkezi Hata Yakalama ve Sentry Telemetri Çağrısı
 * @param error Yakalanan hata nesnesi veya mesaj
 * @param context İlave teknik bağlam (bileşen adı, parametreler vb.)
 */
export function captureTelemetryError(
  error: unknown,
  context?: Record<string, unknown>
): string {
  try {
    // Konsol çıktısı
    console.error("[Telemetry Captured Error]:", error, context || {})

    // Sentry Exception Gönderimi
    if (error instanceof Error) {
      return Sentry.captureException(error, {
        extra: context,
      })
    } else {
      return Sentry.captureMessage(String(error), {
        level: "error",
        extra: context,
      })
    }
  } catch (err) {
    console.warn("[Telemetry] Hata telemetriye iletilemedi:", err)
    return "telemetry-fallback-id"
  }
}
