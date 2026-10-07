"use client"

import React from "react"
import { 
  Package, 
  Trash2, 
  Plus, 
  Minus, 
  Boxes 
} from "lucide-react"
import { RepairPartItem } from "@/types/database"
import { Button } from "@/components/ui/button"

interface PartsTableProps {
  parts: RepairPartItem[]
  onUpdateQuantity: (index: number, newQty: number) => void
  onRemovePart: (index: number) => void
  onOpenSelectorModal: () => void
}

export function PartsTable({
  parts,
  onUpdateQuantity,
  onRemovePart,
  onOpenSelectorModal,
}: PartsTableProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const totalPartsCost = parts.reduce((sum, p) => sum + (Number(p.total_price) || 0), 0)

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
      {/* Başlık ve Ekle Butonu */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-800/40">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Kullanılan Yedek Parçalar
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/40">
                {parts.length} Kalem
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Envanterden düşülen parçalar ve montaj sarf malzemeleri
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={onOpenSelectorModal}
          className="h-8 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Parça Ekle
        </Button>
      </div>

      {/* Tablo veya Boş Durum */}
      {parts.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 space-y-2">
          <Package className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-300">Henüz yedek parça eklenmedi</p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Bu onarımda ekran, batarya, şarj soketi vb. kullanıldıysa envanterden seçerek ekleyebilirsiniz.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenSelectorModal}
            className="mt-2 h-7 border-slate-700 bg-slate-900 text-xs text-slate-300 hover:text-white"
          >
            <Plus className="w-3 h-3 mr-1" />
            İlk Parçayı Seç
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Parça Adı & Not</th>
                <th className="py-2.5 px-3 text-center">Adet</th>
                <th className="py-2.5 px-3 text-right">Birim Fiyat</th>
                <th className="py-2.5 px-3 text-right">Toplam</th>
                <th className="py-2.5 px-3 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {parts.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white text-xs">{item.part_name}</div>
                    {item.notes && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.notes}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                        className="text-slate-400 hover:text-white disabled:opacity-30"
                        title="Adet Azalt"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-white text-xs min-w-[16px]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="text-slate-400 hover:text-white"
                        title="Adet Artır"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    {formatCurrency(item.total_price)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onRemovePart(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                      title="Parçayı Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Alt Bilgi: Parça Ara Toplamı */}
      {parts.length > 0 && (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Toplam Parça Maliyeti:</span>
          <span className="font-mono font-black text-purple-400 text-sm">
            {formatCurrency(totalPartsCost)}
          </span>
        </div>
      )}
    </div>
  )
}
