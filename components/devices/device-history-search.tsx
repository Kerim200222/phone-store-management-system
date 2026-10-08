"use client"

import React, { useState } from "react"
import { 
  Search, 
  Smartphone, 
  Barcode, 
  X, 
  Sparkles, 
  AlertCircle,
  ScanLine
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DEVICE_HISTORY_PRESETS, validateIMEI } from "@/lib/device-history-service"

interface DeviceHistorySearchProps {
  currentImei: string
  onSearch: (imei: string) => void
  isLoading: boolean
}

export function DeviceHistorySearch({
  currentImei,
  onSearch,
  isLoading,
}: DeviceHistorySearchProps) {
  const [imeiInput, setImeiInput] = useState(currentImei || "")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 15)
    setImeiInput(val)
    if (errorMsg) setErrorMsg(null)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!imeiInput.trim()) {
      setErrorMsg("Lütfen sorgulamak istediğiniz 15 haneli IMEI numarasını giriniz.")
      return
    }

    const valResult = validateIMEI(imeiInput)
    if (!valResult.isValid) {
      setErrorMsg(valResult.message || "Geçersiz IMEI formatı.")
      return
    }

    onSearch(imeiInput.trim())
  }

  const handleSelectPreset = (presetImei: string) => {
    setImeiInput(presetImei)
    setErrorMsg(null)
    onSearch(presetImei)
  }

  const handleClear = () => {
    setImeiInput("")
    setErrorMsg(null)
  }

  const isComplete = imeiInput.length === 15

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <span>Cihaz / IMEI Geçmiş Sorgulama</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            15 haneli IMEI numarasını girerek cihazın dükkandaki alım, satım, servis ve garanti geçmişini görüntüleyin.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Barcode className="w-4 h-4 text-cyan-400" />
          <span>Barkod / Optik Tarayıcı Uyumlu</span>
        </div>
      </div>

      {/* Arama Formu */}
      <form onSubmit={handleFormSubmit} className="space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <ScanLine className="w-5 h-5 text-cyan-400" />
            </div>

            <input
              type="text"
              inputMode="numeric"
              value={imeiInput}
              onChange={handleInputChange}
              placeholder="15 Haneli Cihaz IMEI Numarasını Giriniz (Örn: 359102948576102)"
              maxLength={15}
              className={`w-full h-12 pl-11 pr-24 rounded-xl border bg-slate-950 font-mono text-sm sm:text-base tracking-wider font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all ${
                isComplete 
                  ? "border-emerald-500/70 focus:ring-emerald-500/40" 
                  : "border-slate-800 focus:ring-cyan-500/40 focus:border-cyan-500"
              }`}
            />

            {/* Karakter Sayaç ve Temizle Butonu */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
              {imeiInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Temizle"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                isComplete 
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800/60" 
                  : "bg-slate-900 text-slate-400"
              }`}>
                {imeiInput.length}/15
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || imeiInput.length === 0}
            className="h-12 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm gap-2 shadow-lg shadow-cyan-600/25 shrink-0"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sorgulanıyor...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Geçmişi Getir</span>
              </>
            )}
          </Button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-rose-400 pt-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </form>

      {/* Hızlı Demo Seçenekleri (Presets) */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-300">Örnek Demo Cihazlar:</span>
          <span className="text-[11px] text-slate-500">(Tek tıkla zengin yaşam döngüsünü inceleyin)</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {DEVICE_HISTORY_PRESETS.map((preset) => {
            const isSelected = currentImei === preset.imei
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.imei)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border text-left transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-cyan-950/70 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500 shadow-md shadow-cyan-950/40"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs">{preset.brand} {preset.model}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                      {preset.eventCount} İşlem
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    IMEI: {preset.imei}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
