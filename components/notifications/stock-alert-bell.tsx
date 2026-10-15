"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Package,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Info,
} from "lucide-react"
import {
  LowStockProduct,
  StockAlertSummary,
  StockAlertFilter,
} from "@/types/stock-alert"
import { fetchLowStockProducts } from "@/lib/stock-alert-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface StockAlertBellProps {
  /** Stok eşik değeri (Varsayılan: 5) */
  threshold?: number
  /** Bildirimlerin periyodik kontrol süresi (ms, varsayılan: 60 saniye, 0 = kapalı) */
  pollInterval?: number
}

export const StockAlertBell = React.memo(function StockAlertBell({
  threshold = 5,
  pollInterval = 60000,
}: StockAlertBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<StockAlertSummary | null>(null)
  const [activeFilter, setActiveFilter] = useState<StockAlertFilter>("all")
  const [isRead, setIsRead] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Veri yükleme
  const loadAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchLowStockProducts(threshold)
      if (res.success && res.data) {
        setSummary(res.data)
      }
    } catch (err) {
      console.error("Düşük stok uyarıları yüklenirken hata:", err)
    } finally {
      setLoading(false)
    }
  }, [threshold])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  // Periyodik kontrol
  useEffect(() => {
    if (pollInterval <= 0) return
    const timer = setInterval(() => {
      loadAlerts()
    }, pollInterval)
    return () => clearInterval(timer)
  }, [loadAlerts, pollInterval])

  // Dışarı tıklama ve ESC ile kapatma
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const totalCount = summary?.totalCount ?? 0
  const outOfStockCount = summary?.outOfStockCount ?? 0
  const criticalCount = summary?.criticalCount ?? 0
  const warningCount = summary?.warningCount ?? 0

  // Filtreleme (useMemo ile gereksiz hesaplamaları önleme)
  const filteredProducts: LowStockProduct[] = useMemo(() => {
    return (summary?.products || []).filter((product) => {
      if (activeFilter === "all") return true
      return product.severity === activeFilter
    })
  }, [summary?.products, activeFilter])

  // Para birimi formatlama
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const hasUnread = totalCount > 0 && !isRead

  const handleBellClick = () => {
    setIsOpen((prev) => !prev)
    setIsRead(true)
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bildirim Çanı Butonu */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBellClick}
        aria-label="Düşük Stok Bildirimleri"
        aria-expanded={isOpen}
        className={`relative p-2 h-9 w-9 rounded-lg transition-all duration-200 ${
          isOpen
            ? "bg-slate-800 text-amber-400 ring-2 ring-amber-500/30"
            : "text-slate-300 hover:text-white hover:bg-slate-800/80"
        } ${hasUnread ? "text-amber-300" : ""}`}
        title={
          hasUnread
            ? `${totalCount} adet ürünün stoku kritik seviyede (< ${threshold})`
            : totalCount > 0
            ? `${totalCount} adet stok bildirimi (okundu)`
            : "Tüm stoklar güvenli seviyede"
        }
      >
        <Bell
          className={`w-5 h-5 transition-transform duration-200 ${
            hasUnread ? "animate-[bell-swing_2s_ease-in-out_infinite]" : ""
          }`}
        />

        {/* Rozet (Badge) - Yalnızca okunmamış bildirim olduğunda gösterilir */}
        {hasUnread && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center">
            {outOfStockCount > 0 ? (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
            ) : (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-60" />
            )}
            <span
              className={`relative inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white shadow-md ${
                outOfStockCount > 0
                  ? "bg-gradient-to-r from-rose-600 to-red-600 border border-rose-400/40"
                  : "bg-gradient-to-r from-amber-600 to-orange-600 border border-amber-400/40"
              }`}
            >
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          </span>
        )}
      </Button>

      {/* Dropdown Menüsü */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-[380px] sm:w-[440px] max-w-[92vw] origin-top-right rounded-xl border border-slate-800 bg-slate-900/95 p-0 shadow-2xl backdrop-blur-xl ring-1 ring-black/40 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-950/60 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  Stok Uyarı Sistemi
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] font-mono px-1.5 py-0"
                  >
                    Stok &lt; {threshold}
                  </Badge>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Kritik ve tükenen ürünler
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isRead && totalCount > 0 && (
                <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  ✓ Okundu
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={loadAlerts}
                disabled={loading}
                className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                title="Yenile"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`}
                />
              </Button>
            </div>
          </div>

          {/* Filtre Butonları */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800/60 bg-slate-900/60 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-md transition-colors text-xs font-medium whitespace-nowrap ${
                activeFilter === "all"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              Tümü ({totalCount})
            </button>
            <button
              onClick={() => setActiveFilter("out_of_stock")}
              className={`px-2 py-1 rounded-md transition-colors text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === "out_of_stock"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/20"
              }`}
            >
              <AlertOctagon className="w-3 h-3 text-rose-400" />
              Tükendi ({outOfStockCount})
            </button>
            <button
              onClick={() => setActiveFilter("critical")}
              className={`px-2 py-1 rounded-md transition-colors text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === "critical"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/20"
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              Kritik ({criticalCount})
            </button>
            <button
              onClick={() => setActiveFilter("warning")}
              className={`px-2 py-1 rounded-md transition-colors text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === "warning"
                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                  : "text-yellow-400/80 hover:text-yellow-300 hover:bg-yellow-950/20"
              }`}
            >
              <TrendingDown className="w-3 h-3 text-yellow-400" />
              Azalan ({warningCount})
            </button>
          </div>

          {/* Ürün Listesi */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-800/60 overscroll-contain">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20">
                  <Package className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-slate-200">
                  {activeFilter === "all"
                    ? "Tüm stoklar güvenli seviyede!"
                    : "Bu filtreye ait ürün bulunamadı."}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                  {activeFilter === "all"
                    ? `Stok miktarı ${threshold}'in altında olan herhangi bir ürün tespit edilmedi.`
                    : "Farklı bir filtre seçebilir veya tüm envanteri kontrol edebilirsiniz."}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isZero = product.stockQuantity <= 0
                const isCrit = product.severity === "critical"

                return (
                  <div
                    key={product.id}
                    className="p-3 hover:bg-slate-800/50 transition-colors group flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                          {product.categoryName}
                        </span>
                        {product.brand && (
                          <span className="text-xs text-slate-400 truncate">
                            {product.brand}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {product.name}
                      </h4>

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        {product.barcode && (
                          <span className="font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                            Barkod: {product.barcode}
                          </span>
                        )}
                        <span className="text-slate-300 font-medium">
                          {formatCurrency(product.salePrice)}
                        </span>
                      </div>
                    </div>

                    {/* Sağ Taraf: Rozet & Kalan Adet */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${
                          isZero
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : isCrit
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                        }`}
                      >
                        {isZero ? (
                          <>
                            <AlertOctagon className="w-3 h-3 text-rose-400" />
                            0 Adet
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            {product.stockQuantity} Adet
                          </>
                        )}
                      </span>

                      <span className="text-[10px] text-slate-500">
                        Min: {product.minStockLevel}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-800/80 p-2.5 bg-slate-950/70 rounded-b-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pl-1">
              <Info className="w-3 h-3 text-slate-500" />
              <span>Kritik eşik: &lt; {threshold} adet</span>
            </div>

            <Link
              href="/dashboard/inventory"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
            >
              <span>Envantere Git</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
})
StockAlertBell.displayName = "StockAlertBell"
