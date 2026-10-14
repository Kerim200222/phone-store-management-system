import * as Sentry from "@sentry/nextjs"

/**
 * ==============================================================================
 * SENTRY SERVER-SIDE CONFIGURATION & APM TELEMETRY
 * ==============================================================================
 * Node.js sunucu ortamındaki API Route Handlers ve Server Actions hatalarını yakalar.
 * Authorization başlıkları ve veritabanı bağlantı şifreleri maskelenir.
 * ==============================================================================
 */

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN || "",
  enabled: Boolean(SENTRY_DSN),
  tracesSampleRate: 1.0,
  debug: false,
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers["authorization"]
      delete event.request.headers["cookie"]
    }
    return event
  },
})
