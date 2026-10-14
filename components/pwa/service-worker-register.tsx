"use client"

import { useEffect } from "react"

/**
 * Service Worker Kayıt Bileşeni
 * Tarayıcıda Service Worker desteği varsa /sw.js dosyasını arka planda kaydeder.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker başarıyla kaydedildi:", reg.scope)
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker kayıt hatası:", err)
        })
    }
  }, [])

  return null
}
