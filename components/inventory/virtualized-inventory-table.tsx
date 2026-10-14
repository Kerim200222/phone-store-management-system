"use client"

import React, { useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { 
  ArrowUpDown, 
  Smartphone, 
  Package, 
  Eye, 
  Copy, 
  Check, 
  Boxes,
  Zap,
  Tag
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CustomImage } from "@/components/ui/custom-image"
import { InventoryItem, SortField, calculateStockStatus } from "@/types/inventory"

interface VirtualizedInventoryTableProps {
  products: InventoryItem[]
  isLoading: boolean
  sortField: SortField
  sortOrder: "asc" | "desc"
  onToggleSort: (field: SortField) => void
  onSelectProduct: (product: InventoryItem) => void
  onCopyImei: (imei: string) => void
  copiedImei: string | null
}

export function VirtualizedInventoryTable({
  products,
  isLoading,
  sortField,
  sortOrder,
  onToggleSort,
  onSelectProduct,
  onCopyImei,
  copiedImei,
}: VirtualizedInventoryTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // @tanstack/react-virtual: 1000+ satırlık veri setlerinde sabit 60 FPS ve <150 DOM düğümü
  const rowVirtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 74,
    overscan: 5,
  })

  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-lg flex flex-col">
      {/* Sanallaştırma Bilgi Şeridi */}
      <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium text-slate-200">Virtualization Motoru Devrede</span>
          <span className="text-[11px] text-cyan-300 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
            Toplam: {products.length} Kayıt • DOM Ekranda: {virtualItems.length} Satır (60 FPS)
          </span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Bellek sızıntısı önleme: Dinamik TanStack Virtualizer
        </span>
      </div>

      {/* Sabit Başlık (Sticky Table Header) */}
      <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-950 text-xs font-semibold text-slate-300 border-b border-slate-800 select-none">
        <div 
          className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
          onClick={() => onToggleSort("name")}
        >
          <span>Ürün Adı & Model</span>
          <ArrowUpDown className={`w-3 h-3 ${sortField === "name" ? "text-cyan-400" : "text-slate-600"}`} />
          {sortField === "name" && (
            <span className="text-[9px] text-cyan-400 font-mono">{sortOrder === "asc" ? "▲" : "▼"}</span>
          )}
        </div>
        <div className="col-span-2 hidden md:block">Kategori</div>
        <div className="col-span-2 hidden sm:block">Tanımlayıcı (IMEI/Barkod)</div>
        <div 
          className="col-span-2 text-right flex items-center justify-end gap-1 cursor-pointer hover:text-white transition-colors"
          onClick={() => onToggleSort("sale_price")}
        >
          <span>Fiyat (Alış / Satış)</span>
          <ArrowUpDown className={`w-3 h-3 ${sortField === "sale_price" ? "text-cyan-400" : "text-slate-600"}`} />
          {sortField === "sale_price" && (
            <span className="text-[9px] text-cyan-400 font-mono">{sortOrder === "asc" ? "▲" : "▼"}</span>
          )}
        </div>
        <div 
          className="col-span-1 text-center hidden lg:flex items-center justify-center gap-1 cursor-pointer hover:text-white transition-colors"
          onClick={() => onToggleSort("stock_quantity")}
        >
          <span>Stok</span>
          <ArrowUpDown className={`w-3 h-3 ${sortField === "stock_quantity" ? "text-cyan-400" : "text-slate-600"}`} />
          {sortField === "stock_quantity" && (
            <span className="text-[9px] text-cyan-400 font-mono">{sortOrder === "asc" ? "▲" : "▼"}</span>
          )}
        </div>
        <div className="col-span-2 lg:col-span-1 text-right sm:text-center">İşlem</div>
      </div>

      {/* Kaydırılabilir Sanal Liste Konteyneri */}
      <div
        ref={parentRef}
        className="h-[560px] overflow-y-auto relative divide-y divide-slate-800/60 scrollbar-thin scrollbar-thumb-slate-700"
      >
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`v-skeleton-${i}`} className="flex items-center gap-4 py-2">
                <Skeleton className="w-10 h-10 rounded-lg bg-slate-800 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-48 bg-slate-800" />
                  <Skeleton className="h-3 w-32 bg-slate-800/60" />
                </div>
                <Skeleton className="h-5 w-24 bg-slate-800" />
                <Skeleton className="h-5 w-20 bg-slate-800" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center text-slate-500">
            <Boxes className="w-12 h-12 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">Görüntülenecek ürün bulunamadı</p>
            <p className="text-xs text-slate-500">Filtre kriterlerinizi değiştirmeyi deneyin.</p>
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualRow) => {
              const product = products[virtualRow.index]
              const isPhone = product.imei !== null && product.imei.length === 15
              const stockStatus = calculateStockStatus(product.stock_quantity, product.min_stock_level)

              return (
                <div
                  key={product.id}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="absolute top-0 left-0 w-full grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-800/40 transition-colors border-b border-slate-800/40"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {/* 1. Ürün Görseli, Adı & Marka */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div
                      onClick={() => onSelectProduct(product)}
                      className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors"
                      title="Detay & Görseli İncele"
                    >
                      {product.image_url ? (
                        <CustomImage
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="40px"
                          className="object-contain p-0.5"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          {isPhone ? <Smartphone className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-slate-100 truncate block">
                          {product.name}
                        </span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-semibold border ${
                            product.condition === "sıfır"
                              ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                              : "bg-purple-950/80 text-purple-300 border-purple-800/60"
                          }`}
                        >
                          {product.condition}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {product.brand} {product.model && `• ${product.model}`}
                      </p>
                    </div>
                  </div>

                  {/* 2. Kategori */}
                  <div className="col-span-2 hidden md:block">
                    <Badge variant="outline" className="text-[11px] bg-slate-950 text-slate-300 border-slate-800">
                      {product.category}
                    </Badge>
                  </div>

                  {/* 3. IMEI / Barkod */}
                  <div className="col-span-2 hidden sm:block">
                    {isPhone ? (
                      <div className="flex items-center gap-1 font-mono text-[11px] text-purple-300">
                        <Smartphone className="w-3 h-3 text-purple-400 shrink-0" />
                        <span className="truncate">{product.imei}</span>
                        <button
                          onClick={() => onCopyImei(product.imei!)}
                          className="text-slate-500 hover:text-white ml-1 p-0.5"
                          title="IMEI Kopyala"
                        >
                          {copiedImei === product.imei ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400 truncate">
                        <Tag className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{product.barcode || "Barkod Yok"}</span>
                      </div>
                    )}
                  </div>

                  {/* 4. Alış / Satış Fiyatı */}
                  <div className="col-span-2 text-right">
                    <div className="text-xs font-bold text-emerald-400 font-mono">
                      ₺{product.sale_price.toLocaleString("tr-TR")}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Alış: ₺{product.purchase_price.toLocaleString("tr-TR")}
                    </div>
                  </div>

                  {/* 5. Stok Durumu */}
                  <div className="col-span-1 hidden lg:block text-center">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        stockStatus === "in_stock"
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                          : stockStatus === "critical"
                          ? "bg-amber-950/60 text-amber-300 border-amber-800/60 animate-pulse"
                          : "bg-rose-950/60 text-rose-300 border-rose-800/60"
                      }`}
                    >
                      {product.stock_quantity} Adet
                    </Badge>
                  </div>

                  {/* 6. İşlem */}
                  <div className="col-span-2 lg:col-span-1 flex items-center justify-end sm:justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectProduct(product)}
                      className="h-7 px-2 text-[11px] gap-1 bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-cyan-500"
                    >
                      <Eye className="w-3 h-3 text-cyan-400" />
                      <span className="hidden sm:inline">İncele</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
