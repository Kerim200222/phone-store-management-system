"use client"

import React from "react"
import Link from "next/link"
import { Trophy, TrendingUp, Package, ArrowRight, Layers } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TopSellingProduct } from "@/types/dashboard-analytics"
import { formatCurrency } from "@/lib/dashboard-analytics-service"

interface TopProductsCardProps {
  products: TopSellingProduct[]
  isLoading?: boolean
}

export function TopProductsCard({ products, isLoading }: TopProductsCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <div className="h-5 w-40 bg-slate-800 animate-pulse rounded" />
          <div className="h-3 w-64 bg-slate-800 animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-850 animate-pulse rounded-xl" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-slate-900/80 border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            En Çok Satılan Ürünler
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Seçilen dönemde mağaza cirosuna en çok katkı sağlayan ürünler
          </CardDescription>
        </div>
        <Link href="/dashboard/inventory">
          <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300 h-7 px-2">
            Envanter <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        {products.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Package className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">Bu dönemde tamamlanan ürün satışı bulunmuyor.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {products.map((product, idx) => {
              const rankColor =
                idx === 0
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : idx === 1
                  ? "bg-slate-300/20 text-slate-200 border-slate-300/30"
                  : idx === 2
                  ? "bg-amber-700/20 text-amber-500 border-amber-700/30"
                  : "bg-slate-800 text-slate-400 border-slate-700"

              return (
                <div
                  key={product.productId || idx}
                  className="p-3.5 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3"
                >
                  {/* Sol: Sıralama Rozeti + Ürün Bilgisi */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${rankColor}`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-white truncate">
                          {product.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 h-4 border-slate-700 text-slate-300 bg-slate-800/60"
                        >
                          {product.categoryName}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-cyan-400 font-medium">
                          {product.totalQuantity} Adet Satıldı
                        </span>
                        <span>•</span>
                        <span>Kalan Stok: {product.currentStock}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sağ: Ciro ve Kâr */}
                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-bold text-white">
                      {formatCurrency(product.totalRevenue)}
                    </div>
                    <div className="text-[10px] font-medium text-emerald-400 flex items-center justify-end gap-1">
                      <TrendingUp className="w-2.5 h-2.5" />
                      +{formatCurrency(product.totalProfit)} Kâr
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
