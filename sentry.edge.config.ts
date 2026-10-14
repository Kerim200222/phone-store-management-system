import * as Sentry from "@sentry/nextjs"

/**
 * ==============================================================================
 * SENTRY EDGE RUNTIME CONFIGURATION
 * ==============================================================================
 * Middleware ve Edge Route'larında oluşan hataların telemetrisini sağlar.
 * ==============================================================================
 */

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN || "",
  enabled: Boolean(SENTRY_DSN),
  tracesSampleRate: 1.0,
  debug: false,
})
