"use client"

import React from "react"
import { 
  Wrench, 
  Sparkles, 
  DollarSign, 
  FileText, 
  Info 
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { COMMON_LABOR_PRESETS, LaborPreset } from "@/types/service"

interface LaborCostManagerProps {
  laborCost: number
  onChangeLaborCost: (cost: number) => void
  technicianNotes: string
  onChangeTechnicianNotes: (notes: string) => void
}

export function LaborCostManager({
  laborCost,
  onChangeLaborCost,
  technicianNotes,
  onChangeTechnicianNotes,
}: LaborCostManagerProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleApplyPreset = (preset: LaborPreset) => {
    onChangeLaborCost(preset.amount)
    const appendNote = `[İşçilik: ${preset.title}] ${preset.description}`
    if (!technicianNotes.includes(preset.title)) {
      onChangeTechnicianNotes(
        technicianNotes.trim() ? `${technicianNotes.trim()}\n${appendNote}` : appendNote
      )
    }
  }

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Başlık */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800/40">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Elden İşçilik Ücreti & Müdahale Notları
            </h3>
            <p className="text-[11px] text-slate-400">
              Teknisyen el emeği, söküm-montaj, lehimleme ve kalibrasyon bedeli
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">İşçilik Tutarı</span>
          <span className="font-mono font-bold text-cyan-400 text-sm">
            {formatCurrency(laborCost)}
          </span>
        </div>
      </div>

      {/* Hızlı İşçilik Şablonları */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Hızlı Hazır İşçilik Paketleri:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COMMON_LABOR_PRESETS.map((preset) => {
            const isApplied = laborCost === preset.amount
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`p-2 rounded-xl text-left border transition-all text-xs ${
                  isApplied
                    ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/40"
                    : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <div className="font-semibold truncate text-[11px]">{preset.title}</div>
                <div className="font-mono font-bold text-emerald-400 text-xs mt-0.5">
                  {formatCurrency(preset.amount)}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* İşçilik Tutarı Giriş Alanı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="laborCostInput" className="text-xs font-bold text-slate-300">
            Elden İşçilik Ücreti (TL)
          </Label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              id="laborCostInput"
              type="number"
              step="50"
              min="0"
              value={laborCost || ""}
              onChange={(e) => onChangeLaborCost(Number(e.target.value) || 0)}
              placeholder="450"
              className="pl-9 h-10 bg-slate-950 border-slate-700 font-mono font-bold text-cyan-400 text-sm"
            />
          </div>
          <p className="text-[10px] text-slate-500">
            İşçilik ücreti doğrudan servis fişine ve genel toplama yansır.
          </p>
        </div>

        {/* Bilgilendirme Kutusu */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-200">Garanti & Sorumluluk:</strong> Yapılan işçilikler 
            ve parça montajları mağazamız tarafından 6 ay işçilik garantisi altındadır.
          </div>
        </div>
      </div>

      {/* Teknisyen Müdahale & Teşhis Notları */}
      <div className="space-y-1.5">
        <Label htmlFor="technicianNotesInput" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          Teknisyen Müdahale & İşlem Notları
        </Label>
        <textarea
          id="technicianNotesInput"
          rows={3}
          value={technicianNotes}
          onChange={(e) => onChangeTechnicianNotes(e.target.value)}
          placeholder="Örn: Orijinal OLED panel takıldı, FaceID flex aktarımı yapıldı, pil sağlığı %100 kalibre edildi..."
          className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
        />
      </div>
    </div>
  )
}
