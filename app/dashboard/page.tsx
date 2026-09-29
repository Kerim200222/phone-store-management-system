"use client"

import React, { useEffect, useState } from "react"
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
  TrendingUp
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SummaryCard } from "@/components/dashboard/summary-card"

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string>("admin@truncgiller.com")
  const [activeFilter, setActiveFilter] = useState<"today" | "week" | "month">("today")

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.email) {
          setUserEmail(user.email)
        } else {
          const match = document.cookie.match(/(?:^|; )phonestore_session=([^;]+)/)
          if (match) {
            try {
              const parsed = JSON.parse(decodeURIComponent(match[1]))
              if (parsed?.email) setUserEmail(parsed.email)
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // Fallback demo user
      }
    }
    loadUser()
  }, [])

  return (
    <div className="space-y-6">
      
      {/* 1. Dashboard Overview Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Gösterge Paneli (Genel Bakış)
            </h1>
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 font-medium">
              Sistem Çevrimiçi
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hoş geldiniz <span className="text-cyan-300 font-semibold">{userEmail}</span>. Mağaza cirosu, teknik servis kuyruğu ve kritik stok uyarıları günceldir.
          </p>
        </div>

        {/* Zaman Aralığı Filtresi & Hızlı Bağlantılar */}
        <div className="flex flex-wrap items-center gap-2">
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
              onClick={() => setActiveFilter("week")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === "week" 
                  ? "bg-cyan-600 text-white font-semibold shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Bu Hafta
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("month")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeFilter === "month" 
                  ? "bg-cyan-600 text-white font-semibold shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Bu Ay
            </button>
          </div>

          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm" className="border-purple-800/60 bg-purple-950/30 text-purple-300 hover:bg-purple-900/40 hover:text-white text-xs h-8">
              <Settings className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
              Ayarlar
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white text-xs h-8">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              Vitrin
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. DÖRT ADET ÖZET KARTI (GÜN 9 ÖZET METRİK KARTLARI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KART 1: Günlük Satış Tutarı */}
        <SummaryCard
          title="Günlük Satış Tutarı"
          value="₺68.650,00"
          subtitle="3 Satış • ₺67.000 POS"
          icon={TrendingUp}
          colorScheme="emerald"
          trend={{ value: "+14.2%", isPositive: true }}
          badge="Hedef %112"
          href="/dashboard/transactions"
        />

        {/* KART 2: Bekleyen Teknik Servis Sayısı */}
        <SummaryCard
          title="Bekleyen Teknik Servis"
          value="3 Cihaz"
          subtitle="1 Bekliyor • 1 İşlemde • 1 Hazır"
          icon={Wrench}
          colorScheme="cyan"
          trend={{ value: "24 Dk", isPositive: true }}
          badge="Ort. Kabul"
          href="/dashboard/repairs"
        />

        {/* KART 3: Kritik Stok Uyarıları */}
        <SummaryCard
          title="Kritik Stok Uyarıları"
          value="2 Ürün"
          subtitle="Minimum limitin altında yedek parça"
          icon={AlertTriangle}
          colorScheme="rose"
          trend={{ value: "Acil", isPositive: false }}
          badge="Tedarik Gerekli"
          alert={true}
          href="/dashboard/inventory"
        />

        {/* KART 4: Kasa Nakit & Cari Durumu */}
        <SummaryCard
          title="Kasa Nakit & Cari"
          value="₺1.650,00"
          subtitle="+₺1.500 Alacak • -₺3.200 Borç"
          icon={Banknote}
          colorScheme="amber"
          trend={{ value: "Dengeli", isPositive: true }}
          badge="Nakit Mevcut"
          href="/dashboard/customers"
        />

      </div>

      {/* 3. Kritik Stok Detaylı Uyarı Paneli */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-slate-900/60 border border-rose-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-rose-950/10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-rose-200 flex items-center gap-2">
              Kritik Stok Seviyesi Bildirimi (2 Ürün Eşik Altında)
              <Badge className="bg-rose-500/20 text-rose-300 border-none text-[10px]">Depo Uyarısı</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              <strong className="text-slate-200">iPhone 11 GX OLED Ekran Paneli</strong> (1 Adet kaldı • Min: 2) ve <strong className="text-slate-200">Apple 20W USB-C Şarj Başlığı</strong> (Tükenmek üzere). Müşteri mağduriyeti yaşanmaması için sipariş oluşturunuz.
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

      {/* 4. Hızlı İşlem Kısayolları (Action Toolbar) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link 
          href="/dashboard/transactions" 
          className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group shadow-sm"
        >
          <div>
            <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              Yeni Satış Yap
            </div>
            <div className="text-[11px] text-slate-400">Fiş kes & POS tahsilatı</div>
          </div>
          <Receipt className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        </Link>

        <Link 
          href="/dashboard/repairs" 
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
          href="/dashboard/inventory" 
          className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group shadow-sm"
        >
          <div>
            <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              IMEI Sorgulama
            </div>
            <div className="text-[11px] text-slate-400">15 haneli seri no kontrolü</div>
          </div>
          <Smartphone className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
        </Link>

        <Link 
          href="/dashboard/customers" 
          className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group shadow-sm"
        >
          <div>
            <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              Cari Tahsilat
            </div>
            <div className="text-[11px] text-slate-400">Borç & avans takibi</div>
          </div>
          <Banknote className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
        </Link>
      </div>

      {/* 5. Çift Panel: Son Kasa Hareketleri ve Aktif Teknik Servis Kuyruğu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel 1: Son Kasa Hareketleri */}
        <Card className="bg-slate-900/70 border-slate-800 shadow-xl">
          <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Bugünkü Satış ve Alım İşlemleri
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Kasa hareketleri ve ödeme yöntemleri dağılımı
              </CardDescription>
            </div>
            <Link href="/dashboard/transactions">
              <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300 h-7 px-2">
                Tüm Fişler <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-950/40">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs text-slate-400 font-semibold">İşlem / Müşteri</TableHead>
                  <TableHead className="text-xs text-slate-400 font-semibold">Ödeme</TableHead>
                  <TableHead className="text-xs text-slate-400 font-semibold text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-slate-800/50 hover:bg-slate-800/30">
                  <TableCell>
                    <div className="font-mono text-xs font-semibold text-cyan-300">TRX-20260924-001</div>
                    <div className="text-[11px] text-slate-200">Ahmet Yılmaz (iPhone 15 Pro Satışı)</div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-indigo-500/10 text-indigo-300 border-none text-[10px]">
                      Kredi Kartı
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-slate-100">
                    ₺67.000,00
                  </TableCell>
                </TableRow>

                <TableRow className="border-slate-800/50 hover:bg-slate-800/30">
                  <TableCell>
                    <div className="font-mono text-xs font-semibold text-cyan-300">TRX-20260924-002</div>
                    <div className="text-[11px] text-slate-200">Fatma Kaya (Aksesuar Satışı)</div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px]">
                      Nakit
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-slate-100">
                    ₺1.400,00
                  </TableCell>
                </TableRow>

                <TableRow className="border-slate-800/50 hover:bg-slate-800/30">
                  <TableCell>
                    <div className="font-mono text-xs font-semibold text-amber-400">TRX-20260924-003</div>
                    <div className="text-[11px] text-slate-200">Mehmet Öztürk (S23 Ultra 2. El Alım)</div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-amber-500/10 text-amber-300 border-none text-[10px]">
                      Havale / EFT
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-amber-400">
                    -₺42.000,00
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
            <Link href="/dashboard/repairs">
              <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300 h-7 px-2">
                Kuyruğu Aç <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
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
                <TableRow className="border-slate-800/50 hover:bg-slate-800/30">
                  <TableCell>
                    <div className="font-semibold text-xs text-white">Apple iPhone 13</div>
                    <div className="text-[11px] text-slate-400">Ahmet Yılmaz • OLED Ekran Kırık</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-[10px] gap-1">
                      <KeyRound className="w-3 h-3 text-amber-400" />
                      1907
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px]">
                      İşlemde
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-slate-100">
                    ₺3.200,00
                  </TableCell>
                </TableRow>

                <TableRow className="border-slate-800/50 hover:bg-slate-800/30">
                  <TableCell>
                    <div className="font-semibold text-xs text-white">Samsung Galaxy S21 5G</div>
                    <div className="text-[11px] text-slate-400">Fatma Kaya • Batarya Şişmesi</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-[10px] gap-1">
                      <KeyRound className="w-3 h-3 text-amber-400" />
                      2468
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px]">
                      Bekliyor
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-slate-100">
                    ₺1.450,00
                  </TableCell>
                </TableRow>

                <TableRow className="border-slate-800/50 hover:bg-slate-800/30">
                  <TableCell>
                    <div className="font-semibold text-xs text-white">Xiaomi Xiaomi 12</div>
                    <div className="text-[11px] text-slate-400">Mehmet Öztürk • Soket Değişti</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] text-slate-500 font-mono">PIN Yok</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                      Tamamlandı
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-semibold text-slate-100">
                    ₺750,00
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
