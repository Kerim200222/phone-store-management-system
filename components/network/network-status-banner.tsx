"use client"

import React, { useEffect, useState } from "react"
import { WifiOff, Wifi, RefreshCw, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export function NetworkStatusBanner() {
  const [isOffline, setIsOffline] = useState<boolean>(false)
  const [showReconnected, setShowReconnected] = useState<boolean>(false)

  useEffect(() => {
    // İlk bağlantı kontrolü
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setShowReconnected(false)
      toast.error("İnternet Bağlantısı Kesildi", {
        description: "Çevrimdışı moddasınız. İşlem yapmadan önce bağlantınızı kontrol edin.",
        duration: 5000,
      })
    }

    const handleOnline = () => {
      setIsOffline(false)
      setShowReconnected(true)
      toast.success("Bağlantı Yeniden Kuruldu", {
        description: "İnternet erişimi sağlandı. Verileriniz sunucuyla senkronize ediliyor.",
        duration: 4000,
      })

      const timer = setTimeout(() => {
        setShowReconnected(false)
      }, 5000)

      return () => clearTimeout(timer)
    }

    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  if (!isOffline && !showReconnected) {
    return null
  }

  return (
    <div className="w-full z-50 transition-all duration-300">
      {isOffline ? (
        <div className="bg-gradient-to-r from-amber-950/90 via-rose-950/90 to-amber-950/90 border-b border-rose-500/30 text-rose-200 px-4 py-2.5 text-xs flex items-center justify-between backdrop-blur-md shadow-lg shadow-rose-950/30 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 max-w-4xl mx-auto w-full">
            <span className="p-1 rounded-md bg-rose-500/20 text-rose-400 shrink-0">
              <WifiOff className="w-4 h-4 animate-pulse" />
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1">
              <span className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                İnternet Bağlantısı Koptu (Çevrimdışı Mod)
              </span>
              <span className="text-slate-300 text-[11px]">
                Supabase ve harici servislere ulaşılamıyor. Form verileriniz korunmaktadır, lütfen bağlantınızı kontrol edin.
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Yeniden Bağlan
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-emerald-950/90 border-b border-emerald-500/30 text-emerald-200 px-4 py-2 text-xs flex items-center justify-between backdrop-blur-md shadow-lg shadow-emerald-950/30 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 max-w-4xl mx-auto w-full">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 shrink-0">
              <Wifi className="w-4 h-4" />
            </span>
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold text-emerald-300">
                Bağlantı Yeniden Kuruldu!
              </span>
              <span className="text-slate-300 text-[11px]">
                Veritabanı ve bulut servisleri tekrar aktif durumda.
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">ÇEVRİMİÇİ</span>
          </div>
        </div>
      )}
    </div>
  )
}
