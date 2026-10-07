"use client"

import React, { useState, useMemo } from "react"
import { 
  X, 
  Search, 
  Plus, 
  Package, 
  Check, 
  Boxes, 
  Sparkles, 
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RepairPartItem } from "@/types/database"
import { SparePartOption, INITIAL_SPARE_PARTS } from "@/types/service"

interface PartsSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onAddPart: (part: RepairPartItem) => void
  deviceBrand?: string
  deviceModel?: string
}

export function PartsSelectorModal({
  isOpen,
  onClose,
  onAddPart,
  deviceBrand = "",
  deviceModel = "",
}: PartsSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<"inventory" | "custom">("inventory")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPart, setSelectedPart] = useState<SparePartOption | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [customPrice, setCustomPrice] = useState<string>("")

  // Özel parça formu
  const [customName, setCustomName] = useState("")
  const [customUnitCost, setCustomUnitCost] = useState("")
  const [customQty, setCustomQty] = useState(1)
  const [customNotes, setCustomNotes] = useState("")

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Envanter parçalarını arama & cihaza göre önceliklendirme
  const filteredParts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return INITIAL_SPARE_PARTS.filter((part) => {
      const matchesSearch =
        !q ||
        part.name.toLowerCase().includes(q) ||
        part.compatibleModel.toLowerCase().includes(q) ||
        part.sku.toLowerCase().includes(q) ||
        part.brand.toLowerCase().includes(q)
      return matchesSearch
    })
  }, [searchQuery])

  if (!isOpen) return null

  // Envanterden parça seçip ekleme
  const handleConfirmInventoryPart = () => {
    if (!selectedPart) return
    const price = customPrice ? Number(customPrice) : selectedPart.sale_price
    const item: RepairPartItem = {
      product_id: selectedPart.id,
      part_name: selectedPart.name,
      quantity: Math.max(1, quantity),
      unit_price: price,
      total_price: price * Math.max(1, quantity),
      notes: `${selectedPart.shelf_location} • SKU: ${selectedPart.sku}`,
    }
    onAddPart(item)
    // Sıfırla ve kapat
    setSelectedPart(null)
    setQuantity(1)
    setCustomPrice("")
    onClose()
  }

  // Dışarıdan temin edilen özel parça ekleme
  const handleConfirmCustomPart = () => {
    if (!customName.trim() || !customUnitCost) return
    const price = Number(customUnitCost) || 0
    const item: RepairPartItem = {
      product_id: `custom-${Date.now()}`,
      part_name: customName.trim(),
      quantity: Math.max(1, customQty),
      unit_price: price,
      total_price: price * Math.max(1, customQty),
      notes: customNotes.trim() || "Harici / Özel Tedarik Parça",
    }
    onAddPart(item)
    setCustomName("")
    setCustomUnitCost("")
    setCustomQty(1)
    setCustomNotes("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Başlık */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/40 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Servis Kaydına Yedek Parça Ekle
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cihaz: <span className="text-cyan-300 font-semibold">{deviceBrand} {deviceModel}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sekmeler */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-2">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "inventory"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Envanterden Parça Seç
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "custom"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Özel / Dış Tedarik Parça
          </button>
        </div>

        {/* Gövde */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === "inventory" ? (
            <div className="space-y-4">
              {/* Arama */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Yedek parça adı, uyumlu model veya SKU kodu ara..."
                  className="pl-9 h-9 bg-slate-950 border-slate-700 text-xs text-white"
                />
              </div>

              {/* Parça Listesi */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {filteredParts.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    Aranan kriterlere uygun yedek parça bulunamadı.
                  </div>
                ) : (
                  filteredParts.map((part) => {
                    const isSelected = selectedPart?.id === part.id
                    return (
                      <div
                        key={part.id}
                        onClick={() => {
                          setSelectedPart(part)
                          setCustomPrice(String(part.sale_price))
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500/50"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs truncate">
                              {part.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                              {part.sku}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>Uyumlu: {part.compatibleModel}</span>
                            <span>•</span>
                            <span className="text-slate-500">{part.shelf_location}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-emerald-400 text-sm">
                            {formatCurrency(part.sale_price)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Stok: <span className="font-bold text-white">{part.stock_quantity} ad</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Seçili Parça Miktar & Fiyat Ayarı */}
              {selectedPart && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">
                      Seçilen: {selectedPart.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Stoktan düşülecek: <strong>{quantity} adet</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Kullanılacak Adet:
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max={selectedPart.stock_quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                        className="h-8 bg-slate-900 border-slate-700 text-xs font-mono font-bold text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Birim Satış Bedeli (TL):
                      </label>
                      <Input
                        type="number"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="h-8 bg-slate-900 border-slate-700 text-xs font-mono font-bold text-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400 text-xs">Satır Toplamı:</span>
                    <span className="font-mono font-black text-emerald-400 text-base">
                      {formatCurrency((Number(customPrice) || selectedPart.sale_price) * quantity)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Özel Parça Formu */
            <div className="space-y-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  Parça Tanımı / Adı <span className="text-red-400">*</span>
                </label>
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Örn: iPhone 13 Pro Max Çıkma Orijinal Ahize Flex"
                  className="h-9 bg-slate-900 border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Birim Fiyat (TL) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="number"
                    value={customUnitCost}
                    onChange={(e) => setCustomUnitCost(e.target.value)}
                    placeholder="1250"
                    className="h-9 bg-slate-900 border-slate-700 text-xs font-mono font-bold text-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Adet</label>
                  <Input
                    type="number"
                    min="1"
                    value={customQty}
                    onChange={(e) => setCustomQty(Number(e.target.value) || 1)}
                    className="h-9 bg-slate-900 border-slate-700 text-xs font-mono font-bold text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Tedarikçi / Parça Notu</label>
                <Input
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Örn: Tahtakale Tedarikçi Ahmet Bey'den elden alındı"
                  className="h-9 bg-slate-900 border-slate-700 text-xs text-white"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Bu parça envanter dışı kaydedilecek, stok takibini etkilemeyecektir.</span>
              </div>
            </div>
          )}
        </div>

        {/* Alt Butonlar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            İptal
          </Button>

          {activeTab === "inventory" ? (
            <Button
              onClick={handleConfirmInventoryPart}
              disabled={!selectedPart}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 gap-1.5"
            >
              <Check className="w-4 h-4" />
              Parçayı Servise Ekle
            </Button>
          ) : (
            <Button
              onClick={handleConfirmCustomPart}
              disabled={!customName.trim() || !customUnitCost}
              className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-4 gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Özel Parçayı Kaydet
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
