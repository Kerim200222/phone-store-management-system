"use client"

import React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function GlobalLayoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white">Sistem Hatası (Kritik)</h1>
            <p className="text-xs text-slate-300">
              Kök sayfa şablonu yüklenirken beklenmedik bir sistem hatası meydana geldi. Lütfen uygulamayı yeniden başlatın.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-950/40"
            >
              <RefreshCw className="w-4 h-4" />
              Sistemi Yeniden Başlat
            </button>
          </div>

          {error.digest && (
            <p className="text-[10px] font-mono text-slate-500">
              Hata Kimliği: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
