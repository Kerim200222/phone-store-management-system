"use client"

import React from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  CreditCard, 
  Banknote, 
  ArrowUpRight, 
  Percent, 
  Scale
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DashboardRevenueMetrics, 
  DashboardProfitMetrics, 
  PaymentMethodMetric 
} from "@/types/dashboard-analytics"
import { formatCurrency } from "@/lib/dashboard-analytics-service"

interface ProfitLossCardProps {
  revenue: DashboardRevenueMetrics
  profit: DashboardProfitMetrics
  paymentMethods: PaymentMethodMetric[]
  isLoading?: boolean
}

export function ProfitLossCard({
  revenue,
  profit,
  paymentMethods,
  isLoading,
}: ProfitLossCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl">
        <CardHeader className="pb-3 border-b border-slate-800/80">
          <div className="h-5 w-40 bg-slate-800 animate-pulse rounded" />
          <div className="h-3 w-64 bg-slate-800 animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="h-24 bg-slate-850 animate-pulse rounded-xl" />
          <div className="h-20 bg-slate-850 animate-pulse rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  const salesShare =
    revenue.total > 0 ? Math.round((revenue.sales / revenue.total) * 100) : 0
  const repairShare =
    revenue.total > 0 ? Math.round((revenue.repairs / revenue.total) * 100) : 0

  return (
    <Card className="bg-slate-900/80 border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            Kâr - Zarar & Gelir Dağılımı
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Ciro matrahı, ürün maliyetleri ve net kârlılık performansı
          </CardDescription>
        </div>
        <Badge
          className={`${
            profit.isProfitable
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/15 text-rose-400 border-rose-500/30"
          } text-[11px] font-semibold gap-1`}
        >
          {profit.isProfitable ? (
            <>
              <TrendingUp className="w-3 h-3" />
              Kârda (%{profit.profitMargin})
            </>
          ) : (
            <>
              <TrendingDown className="w-3 h-3" />
              Zararda
            </>
          )}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4 flex-1">
        {/* Üst Kâr & Ciro Kutusu */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Toplam Ciro
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
              {formatCurrency(revenue.total)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {revenue.transactionCount} İşlem Tamamlandı
            </div>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Maliyet (COGS)
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-300 mt-0.5">
              {formatCurrency(profit.cogs)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Ürün Alış Maliyeti
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              Brüt Kâr
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-0.5">
              +{formatCurrency(profit.grossProfit)}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5 font-medium">
              Marj: %{profit.profitMargin}
            </div>
          </div>
        </div>

        {/* Gelir Kaynağı Kırılım Çubuğu (Satış vs Servis) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Ürün Satışı: <strong className="text-white">{formatCurrency(revenue.sales)}</strong> ({salesShare}%)
            </span>
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Teknik Servis: <strong className="text-white">{formatCurrency(revenue.repairs)}</strong> ({repairShare}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${salesShare}%` }}
              className="h-full bg-cyan-500 transition-all duration-500"
              title={`Satış: %${salesShare}`}
            />
            <div
              style={{ width: `${repairShare}%` }}
              className="h-full bg-indigo-500 transition-all duration-500"
              title={`Servis: %${repairShare}`}
            />
          </div>
        </div>

        {/* Ödeme Yöntemleri Dağılımı */}
        <div className="pt-2 border-t border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-300 block mb-2">
            Ödeme Yöntemleri Hacmi:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {paymentMethods.map((pm, idx) => {
              const label =
                pm.method === "credit_card"
                  ? "Kredi Kartı"
                  : pm.method === "cash"
                  ? "Nakit"
                  : pm.method === "bank_transfer"
                  ? "Havale/EFT"
                  : pm.method === "on_account"
                  ? "Cari/Veresiye"
                  : pm.method

              const icon =
                pm.method === "credit_card" ? CreditCard : Banknote

              const IconComp = icon

              return (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <IconComp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-300 truncate text-[11px]">{label}</span>
                  </div>
                  <span className="font-mono font-semibold text-white text-[11px] shrink-0">
                    {formatCurrency(pm.amount)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
