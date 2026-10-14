"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { 
  Receipt, 
  Wrench, 
  AlertTriangle, 
  Banknote, 
  Plus, 
  ArrowRight, 
  Settings, 
  Layers, 
  Smartphone, 
  KeyRound, 
  TrendingUp,
  RefreshCw,
  Database,
  History
} from "lucide-react"
import { getDateRange, DateFilterType } from "@/lib/date-filters"
import { useCachedAnalytics } from "@/hooks/use-cached-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { TopProductsCard } from "@/components/dashboard/top-products-card"
import { ProfitLossCard } from "@/components/dashboard/profit-loss-card"
import { formatCurrency } from "@/lib/dashboard-analytics-service"
import { DashboardAnalyticsData } from "@/types/dashboard-analytics"

// Code Splitting & Lazy Loading: Recharts kütüphanesini istemci tarafında dinamik yükle (Hafif Bundle)
const SalesTrendLineChart = dynamic(
  () =>
    import("@/components/dashboard/charts/sales-trend-line-chart").then(
      (mod) => mod.SalesTrendLineChart
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[280px] w-full bg-slate-900/60 rounded-xl" />,
  }
)

const RevenuePieChart = dynamic(
  () =>
    import("@/components/dashboard/charts/revenue-pie-chart").then(
      (mod) => mod.RevenuePieChart
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[280px] w-full bg-slate-900/60 rounded-xl" />,
  }
)

export default function DashboardPage() {
  // PERFORMANS OPTİMİZASYONU (FAZ 2 - ADIM 5):
  // Mükerrer useRoleAccess() ve supabase.auth.getUser() ağ çağrısı TAMAMEN kaldırıldı.
  // Oturum durumu Layout tarafından senkronize edilen bellekten veya çerezden 0ms ile okunur.
  const [auth, setAuth] = useState<{ userEmail: string; isAdmin: boolean }>(() => {
    if (typeof window !== "undefined") {
      const g = (window as unknown as { __DASHBOARD_AUTH__?: { userEmail: string; isAdmin: boolean } }).__DASHBOARD_AUTH__
      if (g) return { userEmail: g.userEmail, isAdmin: g.isAdmin }
      const match = document.cookie.match(/(?:^|; )phonestore_session=([^;]+)/)
      if (match) {
        try {
          const parsed = JSON.parse(decodeURIComponent(match[1]))
          return {
            userEmail: parsed.email || "admin@truncgiller.com",
            isAdmin: parsed.role === "Admin" || (parsed.email && parsed.email.toLowerCase().includes("admin")),
          }
        } catch {}
      }
    }
    return { userEmail: "admin@truncgiller.com", isAdmin: true }
  })

  useEffect(() => {
    const handleAuth = () => {
      if (typeof window !== "undefined") {
        const g = (window as unknown as { __DASHBOARD_AUTH__?: { userEmail: string; isAdmin: boolean } }).__DASHBOARD_AUTH__
        if (g) {
          setAuth({ userEmail: g.userEmail, isAdmin: g.isAdmin })
        }
      }
    }
    window.addEventListener("dashboard-auth-ready", handleAuth)
    return () => window.removeEventListener("dashboard-auth-ready", handleAuth)
  }, [])

  const { userEmail, isAdmin } = auth
  const [activeFilter, setActiveFilter] = useState<DateFilterType>("this_week")

  // PERFORMANS OPTİMİZASYONU (FAZ 2 - ADIM 1):
  // İlkel useEffect, useState(isLoading) ve doğrudan ağır servis çağrıları kaldırıldı.
  // Yerine SWR (Stale-While-Revalidate + keepPreviousData) kancası entegre edildi.
  const { analytics, source, isLoading, isValidating, refresh } = useCachedAnalytics(activeFilter)

  // Aktif Tarih Aralığı Etiketi
  const dateRange = getDateRange(activeFilter)

  // Güvenli Analitik Verisi Çözümleme (SWR doğrudan veri veya nested response dönebilir)
  const analyticsData: DashboardAnalyticsData | null = useMemo(() => {
    if (!analytics) return null
    const raw = analytics as unknown as Record<string, unknown>
    if (raw.revenue) return raw as unknown as DashboardAnalyticsData
    if (raw.data && typeof raw.data === "object" && (raw.data as Record<string, unknown>).revenue) {
      return raw.data as DashboardAnalyticsData
    }
    return null
  }, [analytics])

  // PERFORMANS OPTİMİZASYONU (FAZ 2 - ADIM 4):
  // Yalnızca ilk yüklemede ve önbellekte veri yokken iskelet (skeleton) gösterilir.
  // Periyot değişiminde keepPreviousData sayesinde ekran asla boşalmaz (Sıfır Layout Shift - CLS).
  const isInitialLoading = isLoading && !analyticsData

  // Güvenli veri erişimi (Yüklenme veya boşluk durumları için)
  const rev = analyticsData?.revenue || {
    total: 0,
    sales: 0,
    repairs: 0,
    purchasesExpense: 0,
    salesCount: 0,
    repairsCount: 0,
    transactionCount: 0,
  }
  const prf = analyticsData?.profit || {
    grossProfit: 0,
    cogs: 0,
    profitMargin: 0,
    isProfitable: true,
  }
  const srv = analyticsData?.serviceQueue || {
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalActive: 0,
  }
  const stk = analyticsData?.criticalStock || { count: 0, items: [] }
  const topProds = analyticsData?.topProducts || []
  const payMethods = analyticsData?.paymentMethods || []
  const recentTrx = analyticsData?.recentTransactions || []
  const activeSrv = analyticsData?.activeTickets || []
  const salesTrendData = analyticsData?.salesTrend || []
  const revenueDistributionData = analyticsData?.revenueDistribution || []

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Dashboard Overview Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Gösterge Paneli (Genel Bakış)
            </h1>
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Çevrimiçi
            </Badge>

            {source === "supabase_rpc" && (
              <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] gap-1">
                <Database className="w-3 h-3" />
                Supabase RPC
              </Badge>
            )}

            {isValidating && (
              <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] gap-1 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Arka Planda Güncelleniyor
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hoş geldiniz <span className="text-cyan-300 font-semibold">{userEmail}</span>. Haftalık ciro, kâr-zarar durumu, en çok satan ürünler ve servis kuyruğu günceldir.
          </p>
        </div>

        {/* Zaman Aralığı Filtresi & Aksiyonlar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Aktif Tarih Aralığı Etiketi */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Aralık: <strong className="text-slate-200">{dateRange.displayRange}</strong></span>
          </div>

          {/* Tarih Filtreleme Butonları (SWR Instant Switch) */}
          <div className="p-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter("today")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === "today" 
                  ? "bg-cyan-600 text-white font-semibold shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Bugün
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("this_week")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === "this_week" 
                  ? "bg-cyan-600 text-white font-semibold shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Bu Hafta
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("this_month")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === "this_month" 
                  ? "bg-cyan-600 text-white font-semibold shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Bu Ay
            </button>
          </div>

          {/* SWR Manuel Yenile Butonu */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            disabled={isValidating}
            className="h-8 border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs gap-1"
            title="Verileri Yenile (SWR)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden sm:inline">Yenile</span>
          </Button>

          {/* RBAC: Sadece Admin ise Ayarlar butonu */}
          {isAdmin && (
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm" className="border-purple-800/60 bg-purple-950/30 text-purple-300 hover:bg-purple-900/40 hover:text-white text-xs h-8">
                <Settings className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                Ayarlar
              </Button>
            </Link>
          )}

          <Link href="/">
            <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white text-xs h-8">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Vitrin
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. DÖRT ADET ÖZET KARTI (CANLI GERÇEK METRİKLER) */}
      {/* Sabit "Hesaplanıyor...", "Kontrol Ediliyor..." metinleri kaldırıldı; zarif Skeleton eklendi */}
      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={`kpi-skeleton-${idx}`}
              className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl space-y-4 animate-pulse shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-24 bg-slate-800" />
                  <Skeleton className="h-8 w-36 bg-slate-800" />
                </div>
                <Skeleton className="w-10 h-10 rounded-xl bg-slate-800" />
              </div>
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <Skeleton className="h-3 w-36 bg-slate-800/70" />
                <Skeleton className="h-4 w-14 rounded-full bg-slate-800/70" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KART 1: Toplam Ciro (Satış + Servis) */}
          <SummaryCard
            title={activeFilter === "today" ? "Günlük Ciro" : activeFilter === "this_week" ? "Haftalık Toplam Ciro" : "Aylık Toplam Ciro"}
            value={formatCurrency(rev.total)}
            subtitle={`${rev.salesCount} Satış • ${rev.repairsCount} Servis Tahsilatı`}
            icon={TrendingUp}
            colorScheme="emerald"
            trend={{ value: `+₺${(rev.sales).toLocaleString("tr-TR")}`, isPositive: true }}
            badge={activeFilter === "this_week" ? "Bu Hafta" : activeFilter === "today" ? "Bugün" : "Bu Ay"}
            href="/dashboard/transactions"
          />

          {/* KART 2: Brüt Kâr / Zarar Durumu */}
          <SummaryCard
            title="Brüt Kâr Durumu"
            value={formatCurrency(prf.grossProfit)}
            subtitle={`Maliyet (COGS): ${formatCurrency(prf.cogs)}`}
            icon={Banknote}
            colorScheme={prf.isProfitable ? "emerald" : "rose"}
            trend={{ value: `%${prf.profitMargin} Marj`, isPositive: prf.isProfitable }}
            badge={prf.isProfitable ? "Kârda" : "Zararda"}
            href="/dashboard/transactions"
          />

          {/* KART 3: Bekleyen Teknik Servis Sayısı */}
          <SummaryCard
            title="Teknik Servis Kuyruğu"
            value={`${srv.totalActive} Cihaz`}
            subtitle={`${srv.pending} Bekliyor • ${srv.inProgress} İşlemde • ${srv.completed} Hazır`}
            icon={Wrench}
            colorScheme="cyan"
            trend={{ value: `${srv.completed} Hazır`, isPositive: true }}
            badge="Kuyruk Aktif"
            href="/dashboard/service"
          />

          {/* KART 4: Kritik Stok Uyarıları */}
          <SummaryCard
            title="Kritik Stok Uyarıları"
            value={`${stk.count} Ürün`}
            subtitle="Minimum limitin altındaki ürün ve parçalar"
            icon={AlertTriangle}
            colorScheme="rose"
            trend={{ value: stk.count > 0 ? "Tedarik Gerekli" : "Stok Güvenli", isPositive: stk.count === 0 }}
            badge={stk.count > 0 ? "Kritik Eşik" : "Normal"}
            alert={stk.count > 0}
            href="/dashboard/inventory"
          />
        </div>
      )}

      {/* 3. Kritik Stok Detaylı Uyarı Paneli (Varsa) */}
      {stk.count > 0 && !isInitialLoading && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-slate-900/60 border border-rose-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-semibold text-rose-200 flex items-center gap-2">
                Kritik Stok Seviyesi Bildirimi ({stk.count} Ürün Eşik Altında)
                <Badge className="bg-rose-500/20 text-rose-300 border-none text-[10px]">Depo Uyarısı</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {stk.items.slice(0, 3).map((item, idx) => (
                  <span key={item.id}>
                    <strong className="text-slate-200">{item.name}</strong> ({item.stockQuantity} Adet kaldı • Min: {item.minStockLevel})
                    {idx < Math.min(stk.items.length, 3) - 1 ? ", " : ""}
                  </span>
                ))}
                . Müşteri mağduriyeti yaşanmaması için sipariş oluşturunuz.
              </p>
            </div>
          </div>

          <Link href="/dashboard/inventory" className="shrink-0">
            <Button size="sm" variant="outline" className="border-rose-700/60 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 hover:text-white text-xs h-8">
              Stok Listesini İncele
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* 4. RECHARTS İLE VERİ GÖRSELLEŞTİRME (ÇİZGİ VE PASTA GRAFİKLERİ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Çizgi Grafik: Son 7 Günlük Satış & Servis Trendi (2 Sütun) */}
        <div className="lg:col-span-2">
          <SalesTrendLineChart
            data={salesTrendData}
            isLoading={isInitialLoading}
          />
        </div>

        {/* Pasta Grafik: Satış vs Servis Gelir Dağılımı (1 Sütun) */}
        <div className="lg:col-span-1">
          <RevenuePieChart
            data={revenueDistributionData}
            totalRevenue={rev.total}
            isLoading={isInitialLoading}
          />
        </div>
      </div>

      {/* Detaylı Finansal Kartlar & En Çok Satılanlar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Brüt Kâr ve Gider Dağılımı */}
        <ProfitLossCard
          revenue={rev}
          profit={prf}
          paymentMethods={payMethods}
          isLoading={isInitialLoading}
        />

        {/* Panel 2: En Çok Satılan Ürünler */}
        <TopProductsCard
          products={topProds}
          isLoading={isInitialLoading}
        />
      </div>

      {/* 5. Hızlı İşlem Kısayolları (Action Toolbar) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link 
          href="/dashboard/pos" 
          className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group shadow-sm"
        >
          <div>
            <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              POS Satış Yap
            </div>
            <div className="text-[11px] text-slate-400">Fiş kes & POS tahsilatı</div>
          </div>
          <Receipt className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        </Link>

        <Link 
          href="/dashboard/service/new" 
          className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group shadow-sm"
        >
          <div>
            <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              Cihaz Kabul Fişi
            </div>
            <div className="text-[11px] text-slate-400">Arıza & PIN kaydet</div>
          </div>
          <Wrench className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        </Link>

        <Link 
          href="/dashboard/service/history" 
          className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group shadow-sm"
        >
          <div>
            <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              Cihaz Geçmişi
            </div>
            <div className="text-[11px] text-slate-400">15 haneli IMEI zaman çizelgesi</div>
          </div>
          <Smartphone className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
        </Link>

        <Link 
          href="/dashboard/customers" 
          className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group shadow-sm"
        >
          <div>
            <div className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              Cari Tahsilat
            </div>
            <div className="text-[11px] text-slate-400">Borç & avans takibi</div>
          </div>
          <Banknote className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
        </Link>
      </div>

      {/* 6. Çift Panel: Son Kasa Hareketleri ve Aktif Teknik Servis Kuyruğu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel 1: Son Kasa Hareketleri */}
        <Card className="bg-slate-900/70 border-slate-800 shadow-xl">
          <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Son Kasa ve Satış Hareketleri
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Kasa hareketleri ve ödeme yöntemleri dökümü
              </CardDescription>
            </div>
            <Link href="/dashboard/transactions">
              <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300 h-7 px-2">
                Tüm Fişler <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isInitialLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={`trx-skel-${idx}`} className="flex items-center justify-between py-2 border-b border-slate-800/40">
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-28 bg-slate-800" />
                      <Skeleton className="h-3 w-40 bg-slate-800/60" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded bg-slate-800" />
                    <Skeleton className="h-4 w-20 bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : recentTrx.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Henüz kayıtlı kasa hareketi bulunmuyor.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-950/40">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs text-slate-400 font-semibold">İşlem / Müşteri</TableHead>
                    <TableHead className="text-xs text-slate-400 font-semibold">Ödeme</TableHead>
                    <TableHead className="text-xs text-slate-400 font-semibold text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTrx.map((trx) => {
                    const isPurchase = trx.type === "purchase"
                    const badgeColor =
                      trx.paymentMethod === "credit_card"
                        ? "bg-indigo-500/10 text-indigo-300"
                        : trx.paymentMethod === "cash"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-300"

                    const pmLabel =
                      trx.paymentMethod === "credit_card"
                        ? "Kredi Kartı"
                        : trx.paymentMethod === "cash"
                        ? "Nakit"
                        : trx.paymentMethod === "bank_transfer"
                        ? "Havale/EFT"
                        : trx.paymentMethod

                    return (
                      <TableRow key={trx.id} className="border-slate-800/50 hover:bg-slate-800/30">
                        <TableCell>
                          <div className="font-mono text-xs font-semibold text-cyan-300">
                            {trx.transactionNumber}
                          </div>
                          <div className="text-[11px] text-slate-200 truncate max-w-[220px]">
                            {trx.customerName ? `${trx.customerName} • ` : ""}
                            {trx.notes || (isPurchase ? "Cihaz Alımı" : "Satış")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${badgeColor} border-none text-[10px]`}>
                            {pmLabel}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono text-xs font-bold ${
                            isPurchase ? "text-amber-400" : "text-slate-100"
                          }`}
                        >
                          {isPurchase ? `-${formatCurrency(trx.amount)}` : formatCurrency(trx.amount)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Panel 2: Aktif Teknik Servis Kuyruğu */}
        <Card className="bg-slate-900/70 border-slate-800 shadow-xl">
          <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                Aktif Teknik Servis Kuyruğu
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Arıza tespiti ve parça montajı devam eden cihazlar
              </CardDescription>
            </div>
            <Link href="/dashboard/service">
              <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300 h-7 px-2">
                Kanban Panosu <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isInitialLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={`srv-skel-${idx}`} className="flex items-center justify-between py-2 border-b border-slate-800/40">
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-32 bg-slate-800" />
                      <Skeleton className="h-3 w-44 bg-slate-800/60" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded bg-slate-800" />
                    <Skeleton className="h-4 w-16 bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : activeSrv.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Kuyrukta aktif servis cihazı bulunmuyor.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-950/40">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs text-slate-400 font-semibold">Cihaz & Müşteri</TableHead>
                    <TableHead className="text-xs text-slate-400 font-semibold">Ekran Kilidi (PIN)</TableHead>
                    <TableHead className="text-xs text-slate-400 font-semibold text-center">Durum</TableHead>
                    <TableHead className="text-xs text-slate-400 font-semibold text-right">Tutar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSrv.map((srvItem) => {
                    const statusBadge =
                      srvItem.status === "islemde"
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                        : srvItem.status === "tamamlandi"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"

                    const statusLabel =
                      srvItem.status === "islemde"
                        ? "İşlemde"
                        : srvItem.status === "tamamlandi"
                        ? "Tamamlandı"
                        : "Bekliyor"

                    return (
                      <TableRow key={srvItem.id} className="border-slate-800/50 hover:bg-slate-800/30">
                        <TableCell>
                          <div className="font-semibold text-xs text-white">
                            {srvItem.deviceBrand} {srvItem.deviceModel}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {srvItem.customerName ? `${srvItem.customerName} • ` : ""}
                            {srvItem.issueDescription}
                          </div>
                        </TableCell>
                        <TableCell>
                          {srvItem.devicePassword ? (
                            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-[10px] gap-1">
                              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                              {srvItem.devicePassword}
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">PIN Yok</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${statusBadge} border text-[10px]`}>
                            {statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold text-slate-100">
                          {formatCurrency(srvItem.estimatedCost)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
