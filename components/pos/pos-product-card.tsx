"use client"

import React from "react"
import { 
  Plus, 
  Check, 
  Smartphone, 
  Package, 
  Wrench, 
  BatteryMedium, 
  AlertCircle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomImage } from "@/components/ui/custom-image"
import { POSProduct, formatCurrency } from "@/types/pos"

interface POSProductCardProps {
  product: POSProduct
  inCartQuantity: number
  onAddToCart: (product: POSProduct) => void
}

export function POSProductCard({
  product,
  inCartQuantity,
  onAddToCart,
}: POSProductCardProps) {
  const isOutOfStock = product.stock_quantity <= 0
  const isCriticalStock = product.stock_quantity > 0 && product.stock_quantity <= product.min_stock_level
  const isMaxInCart = inCartQuantity >= product.stock_quantity

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Telefon":
        return <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
      case "Yedek Parça":
        return <Wrench className="w-3.5 h-3.5 text-amber-400" />
      default:
        return <Package className="w-3.5 h-3.5 text-emerald-400" />
    }
  }

  return (
    <div 
      className={`group relative flex flex-col justify-between rounded-xl border bg-slate-900/70 p-3 transition-all duration-200 hover:border-cyan-500/50 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-cyan-950/30 ${
        isOutOfStock 
          ? "border-slate-800/60 opacity-60 grayscale-[40%]" 
          : inCartQuantity > 0 
            ? "border-cyan-500/40 bg-cyan-950/10 shadow-sm" 
            : "border-slate-800/80"
      }`}
    >
      <div>
        {/* Üst Rozetler ve Görsel Konteyneri */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-950/80 border border-slate-800/60">
          {product.image_url ? (
            <CustomImage
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-600">
              {getCategoryIcon(product.category)}
            </div>
          )}

          {/* Kondisyon Rozeti */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-md shadow-sm ${
              product.condition === "sıfır"
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
                : "bg-amber-950/80 text-amber-300 border-amber-700/60"
            }`}>
              {product.condition === "sıfır" ? "Sıfır" : "2. El"}
            </span>

            {product.category === "Telefon" && product.battery_health && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-medium bg-slate-950/80 text-slate-300 border border-slate-700/60 flex items-center gap-1 backdrop-blur-md">
                <BatteryMedium className="w-2.5 h-2.5 text-emerald-400" />
                %{product.battery_health}
              </span>
            )}
          </div>

          {/* Sepetteki Adet Rozeti */}
          {inCartQuantity > 0 && (
            <div className="absolute top-2 right-2 z-10">
              <span className="flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-cyan-500 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/40 animate-in zoom-in-75 duration-150">
                {inCartQuantity}
              </span>
            </div>
          )}
        </div>

        {/* Ürün Bilgileri */}
        <div className="mt-2.5 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1 truncate text-slate-400">
              {getCategoryIcon(product.category)}
              {product.brand}
            </span>
            {product.storage && (
              <span className="text-[10px] font-mono text-cyan-400 font-medium">
                {product.storage}
              </span>
            )}
          </div>

          <h3 
            className="text-xs font-semibold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Barkod / IMEI Bilgisi */}
          <div className="flex items-center gap-2 pt-0.5 text-[10px] text-slate-500 font-mono">
            {product.imei ? (
              <span className="truncate" title={`IMEI: ${product.imei}`}>
                IMEI: ...{product.imei.slice(-6)}
              </span>
            ) : product.barcode ? (
              <span className="truncate" title={`Barkod: ${product.barcode}`}>
                BAR: ...{product.barcode.slice(-6)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Alt Fiyat & Ekleme Butonu */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-emerald-400 font-mono">
            {formatCurrency(product.sale_price)}
          </div>
          <div className="text-[10px] flex items-center gap-1 font-medium">
            {isOutOfStock ? (
              <span className="text-rose-400 flex items-center gap-0.5">
                <AlertCircle className="w-2.5 h-2.5" /> Tükendi
              </span>
            ) : isCriticalStock ? (
              <span className="text-amber-400">
                Son {product.stock_quantity} Adet
              </span>
            ) : (
              <span className="text-slate-400">
                Stok: {product.stock_quantity}
              </span>
            )}
          </div>
        </div>

        <Button
          size="sm"
          type="button"
          disabled={isOutOfStock || isMaxInCart}
          onClick={() => onAddToCart(product)}
          className={`h-8 px-2.5 text-xs font-semibold transition-all gap-1 ${
            isOutOfStock
              ? "bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed"
              : isMaxInCart
                ? "bg-cyan-950 text-cyan-400 border border-cyan-800/60 hover:bg-cyan-900"
                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm shadow-cyan-600/30"
          }`}
        >
          {isMaxInCart ? (
            <>
              <Check className="w-3.5 h-3.5 text-cyan-400" />
              Maksimum
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Ekle
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
