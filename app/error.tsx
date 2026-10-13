"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { 
  AlertTriangle, 
  RefreshCw, 
  LayoutDashboard, 
  ShieldAlert, 
  WifiOff, 
  Copy, 
  Check, 
  ChevronDown,
  Terminal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { parseAppError } from "@/lib/error-handler"
import { toast } from "sonner"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  const [copied, setCopied] = React.useState(false)
  const [showDetails, setShowDetails] = React.useState(false)

  const parsedError = parseAppError(error, "Uygulama Hatası Oluştu")

  useEffect(() => {
    // Hatayı konsola güvenli logla
    console.error("[Next.js App Error Boundary]:", error)
  }, [error])

  const copyErrorDetails = () => {
    const errorReport = `Telefon Mağazası Hata Raporu:
Zaman: ${new Date().toISOString()}
Başlık: ${parsedError.title}
Mesaj: ${parsedError.userMessage}
Hata Kodu: ${parsedError.code || "Bilinmiyor"}
Digest: ${error.digest || "Yok"}
Teknik Detay: ${error.message || "Yok"}
Stack: ${error.stack || "Yok"}`

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(errorReport)
      setCopied(true)
      toast.success("Hata Raporu Kopyalandı", {
        description: "Hata ayrıntıları panoya kopyalandı. Sistem yöneticisine iletebilirsiniz.",
      })
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Mini Header */}
      <header className="border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-sm">
            Telefon Mağazası <span className="text-rose-400">Hata Yakalama</span>
          </span>
        </div>

        <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs px-2.5 py-0.5">
          {parsedError.code || "ERR_RUNTIME"}
        </Badge>
      </header>

      {/* Ana Hata Kartı */}
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Arka plan glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-xl w-full text-center space-y-6 p-8 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-2xl shadow-rose-950/20">
          
          {/* İkon */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center shadow-inner">
              {parsedError.isNetwork ? (
                <WifiOff className="w-10 h-10 text-amber-400 animate-pulse" />
              ) : parsedError.isPermission ? (
                <ShieldAlert className="w-10 h-10 text-rose-400 animate-pulse" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-rose-400 animate-pulse" />
              )}
            </div>

            <Badge className="bg-rose-500/15 text-rose-300 border-rose-500/30 text-xs px-3 py-1">
              {parsedError.title}
            </Badge>
          </div>

          {/* Açıklama */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Bir Hata Meydana Geldi
            </h1>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {parsedError.userMessage}
            </p>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => reset()}
              className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-medium gap-2 shadow-lg shadow-rose-500/20 h-10 px-5 text-xs sm:text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Yeniden Dene
            </Button>

            <Link href="/dashboard">
              <Button variant="outline" className="border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-200 gap-2 h-10 px-4 text-xs sm:text-sm">
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                Dashboard&apos;a Dön
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={copyErrorDetails}
              className="border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-200 gap-1.5 h-10 px-3 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              {copied ? "Kopyalandı" : "Raporu Kopyala"}
            </Button>
          </div>

          {/* Teknik Ayrıntılar Butonu ve Akordeon */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Teknik Ayrıntılar ve Hata İmzası</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDetails ? "rotate-180" : ""}`} />
            </button>

            {showDetails && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-left font-mono text-[11px] text-slate-400 space-y-2 overflow-x-auto max-h-48 animate-in fade-in">
                {error.digest && (
                  <div>
                    <span className="text-slate-500">Digest: </span>
                    <span className="text-cyan-400">{error.digest}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Hata: </span>
                  <span className="text-rose-300">{error.message || "Tanımlanmamış Hata"}</span>
                </div>
                {error.stack && (
                  <div className="text-[10px] text-slate-400 whitespace-pre-wrap leading-tight pt-1 border-t border-slate-900">
                    {error.stack.substring(0, 300)}...
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Alt Bilgi */}
      <footer className="border-t border-slate-900/80 px-6 py-4 text-center text-xs text-slate-400">
        Telefon Mağazası Yönetim Sistemi &copy; {new Date().getFullYear()} • Güvenli Hata Yakalama (Edge Case Safeguard)
      </footer>

    </div>
  )
}
