"use client"

import React from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { TrendingUp, Calendar, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DailySalesTrendPoint } from "@/types/dashboard-analytics"
import { formatCurrency } from "@/lib/dashboard-analytics-service"

interface SalesTrendLineChartProps {
  data: DailySalesTrendPoint[]
  isLoading?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    name: string
    color: string
    dataKey: string
  }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const totalRev = payload.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)

    return (
      <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-semibold text-slate-200">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Calendar className="w-3.5 h-3.5" />
            {label}
          </span>
          <span className="text-[10px] text-slate-400 font-normal">7 Günlük Trend</span>
        </div>

        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {formatCurrency(Number(entry.value) || 0)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800/80 pt-1.5 flex items-center justify-between font-semibold">
          <span className="text-slate-400 text-[11px]">Günlük Toplam:</span>
          <span className="font-mono text-emerald-400 text-xs font-bold">
            {formatCurrency(totalRev)}
          </span>
        </div>
      </div>
    )
  }

  return null
}

export function SalesTrendLineChart({ data, isLoading }: SalesTrendLineChartProps) {
  if (isLoading) {
    return (
      <Card className="bg-slate-900/80 border-slate-800 shadow-xl">
        <CardHeader className="pb-2 border-b border-slate-800/80">
          <div className="h-5 w-48 bg-slate-800 animate-pulse rounded" />
          <div className="h-3 w-72 bg-slate-800 animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[280px] w-full bg-slate-850 animate-pulse rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  // 7 Günlük Toplam ve Ortalama Hesaplama
  const totalPeriodRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0)
  const averageDailyRevenue = data.length > 0 ? Math.round(totalPeriodRevenue / data.length) : 0

  return (
    <Card className="bg-slate-900/80 border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Son 7 Günlük Satış & Servis Trendi
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Günlük ürün satışı ve teknik servis ciro gelişim grafiği (Recharts)
          </CardDescription>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className="border-cyan-500/30 bg-cyan-950/30 text-cyan-300 text-[11px] font-mono gap-1"
          >
            Ortalama: {formatCurrency(averageDailyRevenue)} / gün
          </Badge>
          <Badge
            className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono gap-1"
          >
            <ArrowUpRight className="w-3 h-3" />
            Toplam: {formatCurrency(totalPeriodRevenue)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-6 flex-1">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="repairGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
                dy={6}
              />

              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₺${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{
                  paddingBottom: "16px",
                  fontSize: "12px",
                }}
              />

              {/* 1. Çizgi: Ürün Satışları */}
              <Line
                type="monotone"
                dataKey="salesRevenue"
                name="Ürün Satışı"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: "#06b6d4", r: 4, strokeWidth: 1, stroke: "#0f172a" }}
                activeDot={{ r: 7, fill: "#22d3ee", stroke: "#ffffff", strokeWidth: 2 }}
                isAnimationActive={true}
              />

              {/* 2. Çizgi: Teknik Servis Geliri */}
              <Line
                type="monotone"
                dataKey="repairRevenue"
                name="Teknik Servis"
                stroke="#818cf8"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ fill: "#818cf8", r: 3.5, strokeWidth: 1, stroke: "#0f172a" }}
                activeDot={{ r: 6, fill: "#a5b4fc", stroke: "#ffffff", strokeWidth: 2 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
