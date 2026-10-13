"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { 
  AlertTriangle, 
  RefreshCw, 
  LayoutDashboard, 
  Copy, 
  Check, 
  ChevronDown, 
  Terminal,
  WifiOff,
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { parseAppError } from "@/lib/error-handler"
import { toast } from "sonner"

interface DashboardErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  const [copied, setCopied] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const parsed = parseAppError(error, "Modül Yüklenirken Hata Oluştu")

  useEffect(() => {
    console.error("[Dashboard Error Boundary Caught]:", error)
  }, [error])

  const copyDetails = () => {
    const report = `Dashboard Hata Özeti:
Tarih: ${new Date().toLocaleString("tr-TR")}
Başlık: ${parsed.title}
Mesaj: ${parsed.userMessage}
Hata Kodu: ${parsed.code || "ERR_DASHBOARD"}
Digest: ${error.digest || "Yok"}
Teknik Hata: ${error.message || "Yok"}`

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(report)
      setCopied(true)
      toast.success("Hata Raporu Kopyalandı", {
        description: "Teknik hata bilgileri panoya kopyalandı.",
      })
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto flex items-center justify-center min-h-[70vh]">
      <div className="w-full p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl shadow-rose-950/20 text-center space-y-6">
        
        {/* Hata İkonu */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            {parsed.isNetwork ? (
              <WifiOff className="w-8 h-8 animate-pulse text-amber-400" />
            ) : parsed.isPermission ? (
              <ShieldAlert className="w-8 h-8 animate-pulse text-rose-400" />
            ) : (
              <AlertTriangle className="w-8 h-8 animate-pulse text-rose-400" />
            )}
          </div>
          <Badge className="bg-rose-500/15 text-rose-300 border-rose-500/30 text-xs px-2.5 py-0.5">
            {parsed.title}
          </Badge>
        </div>

        {/* Metinler */}
        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Bu Sayfa Yüklenirken Bir Sorun Oluştu
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {parsed.userMessage}
          </p>
        </div>

        {/* Butonlar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-medium gap-2 shadow-md shadow-rose-500/20 h-9 px-4 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tekrar Dene
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-200 gap-1.5 h-9 px-3 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Sayfayı Yenile
          </Button>

          <Link href="/dashboard">
            <Button
              variant="outline"
              className="border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-200 gap-1.5 h-9 px-3 text-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
              Ana Sayfa
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={copyDetails}
            className="border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-300 gap-1.5 h-9 px-3 text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            {copied ? "Kopyalandı" : "Raporu Kopyala"}
          </Button>
        </div>

        {/* Hata Kodu & Akordeon */}
        <div className="pt-3 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hata Kodu & Tanı İmzası</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`} />
          </button>

          {showDetails && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-left font-mono text-[11px] text-slate-400 space-y-1.5 overflow-x-auto max-h-40 animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Kod:</span>
                <span className="text-cyan-400">{parsed.code || "ERR_DASHBOARD"}</span>
              </div>
              {error.digest && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Digest:</span>
                  <span className="text-amber-400">{error.digest}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500">Açıklama:</span>
                <span className="text-rose-300 ml-1">{error.message || "Tanımlanmamış Hata"}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
