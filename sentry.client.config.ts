import * as Sentry from "@sentry/nextjs"

/**
 * ==============================================================================
 * SENTRY CLIENT-SIDE CONFIGURATION & TELEMETRY
 * ==============================================================================
 * Tarayıcı ortamında oluşan istisnaları, ağ hatalarını ve performans metriklerini toplar.
 * PII (Kişisel Verilerin Korunması) kapsamında çerezler ve hassas veriler filtrelenir.
 * ==============================================================================
 */

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN || "",
  enabled: Boolean(SENTRY_DSN),
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  debug: false,
  beforeSend(event) {
    // Zero-Trust & PII Masking: Hassas çerez veya yetkilendirme başlıklarını ayıkla
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    return event
  },
})
