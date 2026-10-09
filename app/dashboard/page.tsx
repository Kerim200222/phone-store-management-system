"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { 
  Receipt, 
  Wrench, 
  AlertTriangle, 
  Banknote, 
  Plus, 
  Search, 
  ArrowRight, 
  Settings, 
  Layers, 
  Smartphone, 
  KeyRound, 
  TrendingUp,
  RefreshCw,
  Database,
  Sparkles,
  History
} from "lucide-react"
import { useRoleAccess } from "@/hooks/use-role-access"
import { getDateRange, DateFilterType } from "@/lib/date-filters"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { TopProductsCard } from "@/components/dashboard/top-products-card"
import { ProfitLossCard } from "@/components/dashboard/profit-loss-card"
import { 
  getDashboardAnalytics, 
  formatCurrency 
} from "@/lib/dashboard-analytics-service"
import { DashboardAnalyticsData } from "@/types/dashboard-analytics"

export default function DashboardPage() {
  const { userEmail, isAdmin } = useRoleAccess()
  const [activeFilter, setActiveFilter] = useState<DateFilterType>("this_week")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [analyticsData, setAnalyticsData] = useState<DashboardAnalyticsData | null>(null)
  const [dataSource, setDataSource] = useState<string>("supabase")

  // Aktif Tarih Aralığı Etiketi
  const dateRange = getDateRange(activeFilter)

  // Veri Çekme Fonksiyonu
  const loadAnalytics = useCallback(async (filter: DateFilterType) => {
    setIsLoading(true)
    try {
      const res = await getDashboardAnalytics(filter)
      if (res.data) {
        setAnalyticsData(res.data)
        setDataSource(res.source || "supabase")
      }
    } catch (error) {
      console.error("Dashboard verileri yüklenirken hata oluştu:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAnalytics(activeFilter)
  }, [activeFilter, loadAnalytics])

  const handleRefresh = () => {
    loadAnalytics(activeFilter)
  }

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

            {dataSource === "supabase_rpc" && (
              <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] gap-1">
                <Database className="w-3 h-3" />
                Supabase RPC
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

          {/* Tarih Filtreleme Butonları */}
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

          {/* Yenile Butonu */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs gap-1"
            title="Verileri Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KART 1: Toplam Ciro (Satış + Servis) */}
        <SummaryCard
          title={activeFilter === "today" ? "Günlük Ciro" : activeFilter === "this_week" ? "Haftalık Toplam Ciro" : "Aylık Toplam Ciro"}
          value={isLoading ? "Hesaplanıyor..." : formatCurrency(rev.total)}
          subtitle={`${rev.salesCount} Satış • ${rev.repairsCount} Servis Tahsilatı`}
          icon={TrendingUp}
          colorScheme="emerald"
          trend={{ value: `+₺${(rev.sales).toLocaleString("tr-TR")}`, isPositive: true }}
          badge={activeFilter === "this_week" ? "Bu Hafta" : activeFilter === "today" ? "Bugün" : "Bu Ay"}
          href="/dashboard/transactions"
        />

        {/* KART 2: Brüt Kâr / Zarar Durumu (GÜN 26 İSTENEN METRİK) */}
        <SummaryCard
          title="Brüt Kâr Durumu"
          value={isLoading ? "Hesaplanıyor..." : formatCurrency(prf.grossProfit)}
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
          value={isLoading ? "Yükleniyor..." : `${srv.totalActive} Cihaz`}
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
          value={isLoading ? "Kontrol Ediliyor..." : `${stk.count} Ürün`}
          subtitle="Minimum limitin altındaki ürün ve parçalar"
          icon={AlertTriangle}
          colorScheme="rose"
          trend={{ value: stk.count > 0 ? "Tedarik Gerekli" : "Stok Güvenli", isPositive: stk.count === 0 }}
          badge={stk.count > 0 ? "Kritik Eşik" : "Normal"}
          alert={stk.count > 0}
          href="/dashboard/inventory"
        />

      </div>

      {/* 3. Kritik Stok Detaylı Uyarı Paneli (Varsa) */}
      {stk.count > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-slate-900/60 border border-rose-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/10">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
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

      {/* 4. GÜN 26 ANALİTİK ÇİFT PANEL: EN ÇOK SATILAN ÜRÜNLER & KÂR-ZARAR DAĞILIMI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Kâr-Zarar & Gelir Dağılımı */}
        <ProfitLossCard
          revenue={rev}
          profit={prf}
          paymentMethods={payMethods}
          isLoading={isLoading}
        />

        {/* Panel 2: En Çok Satılan Ürünler */}
        <TopProductsCard
          products={topProds}
          isLoading={isLoading}
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
                Tüm Fişler <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentTrx.length === 0 ? (
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
                Kanban Panosu <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {activeSrv.length === 0 ? (
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
                              <KeyRound className="w-3 h-3 text-amber-400" />
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
