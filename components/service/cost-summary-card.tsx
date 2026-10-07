"use client"

import React from "react"
import { 
  DollarSign, 
  Boxes, 
  Wrench, 
  Save, 
  Printer, 
  TrendingDown, 
  TrendingUp, 
  Minus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { KanbanColumnId } from "@/types/service"

interface CostSummaryCardProps {
  partsTotalCost: number
  laborCost: number
  actualCost: number
  estimatedCost: number
  status: KanbanColumnId
  onChangeStatus: (status: KanbanColumnId) => void
  onSave: () => void
  onPrint: () => void
  isSaving: boolean
  isSavedSuccess: boolean
}

export function CostSummaryCard({
  partsTotalCost,
  laborCost,
  actualCost,
  estimatedCost,
  status,
  onChangeStatus,
  onSave,
  onPrint,
  isSaving,
  isSavedSuccess,
}: CostSummaryCardProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Tahmin ile gerçekleşen farkı
  const diff = actualCost - estimatedCost
  const isExact = diff === 0
  const isOver = diff > 0
  const isUnder = diff < 0

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden space-y-0 sticky top-6">
      {/* Üst Gradyan Başlık */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-4 sm:p-5 text-white">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-100">
            Dinamik Maliyet Hesabı
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px]">
            {status.toUpperCase()}
          </span>
        </div>
        <div className="mt-2">
          <span className="text-xs text-cyan-100 block">Genel Toplam Tutar (Müşteriye Yansıyacak):</span>
          <div className="text-3xl font-black font-mono tracking-tight text-white mt-0.5">
            {formatCurrency(actualCost)}
          </div>
        </div>
      </div>

      {/* Döküm Listesi */}
      <div className="p-4 sm:p-5 space-y-3.5 text-xs">
        {/* Parça Toplamı */}
        <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-300">
            <Boxes className="w-4 h-4 text-purple-400" />
            <span>Yedek Parça Toplamı:</span>
          </div>
          <span className="font-mono font-bold text-purple-300 text-sm">
            {formatCurrency(partsTotalCost)}
          </span>
        </div>

        {/* İşçilik Tutarı */}
        <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-300">
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span>Elden İşçilik Ücreti:</span>
          </div>
          <span className="font-mono font-bold text-cyan-300 text-sm">
            {formatCurrency(laborCost)}
          </span>
        </div>

        {/* Başlangıçtaki Tahmini Bedel */}
        <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-400">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <span>İlk Tahmini Teklif:</span>
          </div>
          <span className="font-mono font-semibold text-slate-400 text-xs">
            {formatCurrency(estimatedCost)}
          </span>
        </div>

        {/* Fark / Karşılaştırma Analizi */}
        <div className={`p-3 rounded-xl border flex items-center justify-between ${
          isExact 
            ? "bg-slate-950/80 border-slate-800 text-slate-300" 
            : isUnder 
            ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-300" 
            : "bg-amber-950/30 border-amber-800/60 text-amber-300"
        }`}>
          <div className="flex items-center gap-2 text-[11px]">
            {isExact && <Minus className="w-4 h-4 text-slate-400" />}
            {isUnder && <TrendingDown className="w-4 h-4 text-emerald-400" />}
            {isOver && <TrendingUp className="w-4 h-4 text-amber-400" />}
            <span>
              {isExact && "Tahmin ile birebir uyumlu"}
              {isUnder && `Tahminden ${formatCurrency(Math.abs(diff))} daha uygun`}
              {isOver && `Tahminden ${formatCurrency(diff)} fazla`}
            </span>
          </div>
          <span className="font-mono font-bold text-xs">
            {diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
          </span>
        </div>

        {/* Durum Değiştirici */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
            Servis Aşaması:
          </label>
          <select
            value={status}
            onChange={(e) => onChangeStatus(e.target.value as KanbanColumnId)}
            className="w-full h-10 px-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs font-bold focus:ring-2 focus:ring-cyan-500"
          >
            <option value="bekliyor">🕒 Bekliyor (Kabul Sırasında)</option>
            <option value="islemde">⚙️ İşlemde (Masada / Onarımda)</option>
            <option value="parca_bekliyor">📦 Parça Bekliyor (Tedarikçi Kargo)</option>
            <option value="tamamlandi">✅ Tamamlandı (Teslime Hazır)</option>
          </select>
        </div>

        {/* Aksiyon Butonları */}
        <div className="pt-2 space-y-2">
          {/* Kaydet Butonu */}
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="w-full h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs gap-2 shadow-lg shadow-cyan-600/20"
          >
            <Save className={`w-4 h-4 ${isSaving ? "animate-spin" : ""}`} />
            <span>{isSaving ? "Supabase'e Kaydediliyor..." : isSavedSuccess ? "Başarıyla Kaydedildi!" : "Maliyetleri Supabase'e Kaydet"}</span>
          </Button>

          {/* Servis Fişi Yazdır */}
          <Button
            variant="outline"
            onClick={onPrint}
            className="w-full h-10 border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs gap-2"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            Servis Fişi / Kabul Belgesi Yazdır
          </Button>
        </div>
      </div>
    </div>
  )
}
