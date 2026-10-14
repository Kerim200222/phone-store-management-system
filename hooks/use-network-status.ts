"use client"

import { useState, useEffect, useCallback } from "react"

export interface NetworkStatusState {
  isOnline: boolean
  wasOffline: boolean
  lastOnlineAt: Date | null
  lastOfflineAt: Date | null
}

/**
 * useNetworkStatus Hook'u
 * Tarayıcının ağ bağlantı durumunu (online/offline) reaktif olarak izler.
 * Çevrimdışı moda geçildiğinde ve tekrar çevrimiçi olunduğunda durum bayrakları sunar.
 */
export function useNetworkStatus(): NetworkStatusState {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      return navigator.onLine
    }
    return true
  })

  const [wasOffline, setWasOffline] = useState(false)
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null)
  const [lastOfflineAt, setLastOfflineAt] = useState<Date | null>(null)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    setLastOnlineAt(new Date())
  }, [])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
    setWasOffline(true)
    setLastOfflineAt(new Date())
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Sayfa ilk yüklendiğinde mevcut durumu al
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [handleOnline, handleOffline])

  return {
    isOnline,
    wasOffline,
    lastOnlineAt,
    lastOfflineAt,
  }
}
