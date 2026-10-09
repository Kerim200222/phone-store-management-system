"use client"

import React, { useState } from "react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"
import { PieChart as PieIcon, Layers, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueDistributionSlice } from "@/types/dashboard-analytics"
import { formatCurrency } from "@/lib/dashboard-analytics-service"

interface RevenuePieChartProps {
  data: RevenueDistributionSlice[]
  totalRevenue: number
  isLoading?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: RevenueDistributionSlice
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload

    return (
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[170px]">
        <div className="flex items-center gap-2 font-semibold text-slate-200">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.name}</span>
        </div>
        <div className="flex items-center justify-between font-mono pt-1 border-t border-slate-800">
          <span className="text-slate-400">Tutar:</span>
          <span className="font-bold text-white">{formatCurrency(item.value)}</span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Gelir Payı:</span>
          <span className="font-semibold text-cyan-400">%{item.percentage}</span>
        </div>
        {item.count > 0 && (
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>İşlem Adedi:</span>
            <span>{item.count} Adet</span>
          </div>
        )}
      </div>
    )
  }

  return null
}

export function RevenuePieChart({
  data,
  totalRevenue,
  isLoading,
}: RevenuePieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (isLoading) {
    return (
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl">
        <CardHeader className="pb-2 border-b border-slate-800/80">
          <div className="h-5 w-48 bg-slate-800 animate-pulse rounded" />
          <div className="h-3 w-64 bg-slate-800 animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[280px] w-full bg-slate-850 animate-pulse rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  const validData = data.filter((item) => item.value > 0)
  const activeItem = activeIndex !== null ? validData[activeIndex] : null

  return (
    <Card className="bg-slate-900/80 border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-800/80">
        <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
          <PieIcon className="w-4 h-4 text-indigo-400" />
          Gelir Dağılımı (Satış vs Servis)
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Mağaza gelir kaynaklarının oransal pasta grafiği (Recharts)
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-6 flex-1 flex flex-col justify-between space-y-4">
        {/* Pasta Grafik Alanı */}
        <div className="relative h-[220px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={validData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={92}
                paddingAngle={4}
                cornerRadius={5}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                isAnimationActive={true}
              >
                {validData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#0f172a"
                    strokeWidth={2}
                    className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Orta Metrik Kartı */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {activeItem ? activeItem.name : "Toplam Ciro"}
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-white">
              {formatCurrency(activeItem ? activeItem.value : totalRevenue)}
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold">
              {activeItem ? `Pay: %${activeItem.percentage}` : "100% Hacim"}
            </span>
          </div>
        </div>

        {/* Dilim Dağılım Listesi ve Rozetler */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          {data.map((item, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg border transition-all flex items-center justify-between text-xs ${
                activeIndex === idx
                  ? "bg-slate-800/80 border-slate-700"
                  : "bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/40"
              }`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-200 font-medium truncate">{item.name}</span>
                <span className="text-[10px] text-slate-400">
                  (%{item.percentage})
                </span>
              </div>

              <div className="font-mono font-bold text-white text-right shrink-0">
                {formatCurrency(item.value)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
