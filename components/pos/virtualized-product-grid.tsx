"use client"

import React, { useRef, useMemo } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { POSProduct } from "@/types/pos"
import { POSProductCard } from "@/components/pos/pos-product-card"
import { Package, RotateCcw, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VirtualizedProductGridProps {
  products: POSProduct[]
  inCartCounts: Record<string, number>
  onAddToCart: (product: POSProduct) => void
  onClearFilters: () => void
  columnsCount?: number
}

export function VirtualizedProductGrid({
  products,
  inCartCounts,
  onAddToCart,
  onClearFilters,
  columnsCount = 3,
}: VirtualizedProductGridProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Ürünleri sanal satırlara böl (Grid Virtualization: satır başı columnsCount ürün)
  const rows = useMemo(() => {
    const chunked: POSProduct[][] = []
    for (let i = 0; i < products.length; i += columnsCount) {
      chunked.push(products.slice(i, i + columnsCount))
    }
    return chunked
  }, [products, columnsCount])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220, // Ortalama ürün kartı yüksekliği
    overscan: 2,
  })

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/80 p-8 space-y-3">
        <Package className="w-10 h-10 text-slate-600" />
        <div>
          <h3 className="text-sm font-semibold text-slate-300">Ürün Bulunamadı</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Seçtiğiniz filtreler veya arama sorgusuna uygun ürün envanterde yer almıyor.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onClearFilters}
          className="text-xs h-8 gap-1.5 border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Filtreleri Temizle
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Sanallaştırma İndikatörü */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>POS Grid Virtualization:</span>
          <strong className="text-slate-200">{products.length} ürün</strong>
          <span className="text-slate-500">• Sabit 60 FPS</span>
        </div>
        <span className="text-slate-500 hidden sm:inline">
          Yalnızca ekrandaki kartlar render ediliyor
        </span>
      </div>

      {/* Kaydırılabilir Sanal Konteyner */}
      <div
        ref={parentRef}
        className="h-[620px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const rowProducts = rows[virtualRow.index]
            return (
              <div
                key={virtualRow.index}
                data-index={virtualRow.index}
                ref={rowVirtualizer.measureElement}
                className="absolute top-0 left-0 w-full grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-3.5"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {rowProducts.map((product) => (
                  <POSProductCard
                    key={product.id}
                    product={product}
                    inCartQuantity={inCartCounts[product.id] || 0}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
