"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Smartphone, 
  ShieldCheck, 
  Users, 
  Receipt, 
  Wrench, 
  LogOut, 
  ArrowUpRight, 
  Banknote, 
  CreditCard, 
  Clock, 
  TrendingUp,
  Package,
  Layers,
  ArrowRight
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DashboardPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string>("admin@truncgiller.com")
  const [userRole, setUserRole] = useState<string>("Admin")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.email) {
          setUserEmail(user.email)
          if (user.email.includes("personel")) {
            setUserRole("Personel")
          }
        }
      } catch {
        // Fallback demo user
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Bar */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 text-white hover:scale-105 transition-transform">
              <Smartphone className="w-6 h-6" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Yönetim Paneli (Dashboard)
                </h1>
                <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs">
                  Giriş Yapıldı
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Oturum: <span className="font-mono text-cyan-300">{loading ? "Yükleniyor..." : userEmail}</span> • Rol: <span className="text-slate-200 font-semibold">{userRole}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white text-xs">
                <Layers className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                Tam Envanter & Şema
              </Button>
            </Link>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="border-rose-900/40 bg-rose-950/20 text-rose-300 hover:bg-rose-900/40 hover:text-rose-200 text-xs"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Çıkış Yap
            </Button>
          </div>
        </header>

        {/* Overview Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-400 flex items-center justify-between">
                <span>Günlük Ciro</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-emerald-400">
                ₺68.650,00
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>3 Tamamlanan Satış İşlemi</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-400 flex items-center justify-between">
                <span>Teknik Servis Kayıtları</span>
                <Wrench className="w-4 h-4 text-cyan-400" />
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-cyan-400">
                4 Cihaz
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>1 İşlemde • 1 Bekleyen • 1 Hazır</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-400 flex items-center justify-between">
                <span>Kasa Nakit Bakiyesi</span>
                <Banknote className="w-4 h-4 text-indigo-400" />
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-indigo-300">
                ₺1.650,00
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
              <span>₺67.000 Kredi Kartı Tahsilatı</span>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs text-slate-400 flex items-center justify-between">
                <span>Kayıtlı Müşteri & Cari</span>
                <Users className="w-4 h-4 text-purple-400" />
              </CardDescription>
              <CardTitle className="text-2xl font-bold text-purple-300">
                4 Müşteri
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aktif Cari Bakiye Takibi</span>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/?tab=inventory" className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group">
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">Envanter & IMEI</div>
              <div className="text-[11px] text-slate-400">Ürün listesi ve stok</div>
            </div>
            <Package className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link href="/?tab=repairs" className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group">
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">Teknik Servis</div>
              <div className="text-[11px] text-slate-400">Arıza ve cihaz kabul</div>
            </div>
            <Wrench className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link href="/?tab=transactions" className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group">
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">Kasa & Fişler</div>
              <div className="text-[11px] text-slate-400">Satış ve alım işlemleri</div>
            </div>
            <Receipt className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link href="/?tab=customers" className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex items-center justify-between group">
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">Cari Hesaplar</div>
              <div className="text-[11px] text-slate-400">Müşteri borç ve alacak</div>
            </div>
            <Users className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Dual Panels: Recent Transactions and Service Tickets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Panel 1: Recent Transactions */}
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-cyan-400" />
                  Son Kasa Hareketleri
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Bugün gerçekleştirilen satış ve alım işlemleri
                </CardDescription>
              </div>
              <Link href="/?tab=transactions">
                <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300 h-7 px-2">
                  Tümü <ArrowRight className="w-3 h-3 ml-1" />
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
                      <div className="text-[11px] text-slate-300">Ahmet Yılmaz (iPhone 15 Pro Satışı)</div>
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
                      <div className="text-[11px] text-slate-300">Fatma Kaya (Aksesuar Satışı)</div>
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
                      <div className="font-mono text-xs font-semibold text-cyan-300">TRX-20260924-003</div>
                      <div className="text-[11px] text-slate-300">Mehmet Öztürk (2. El Cihaz Alımı)</div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-500/10 text-amber-300 border-none text-[10px]">
                        Havale
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

          {/* Panel 2: Active Repair Tickets */}
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  Aktif Servis Kayıtları
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Tamirde olan ve bekleyen cihazlar
                </CardDescription>
              </div>
              <Link href="/?tab=repairs">
                <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300 h-7 px-2">
                  Tümü <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-950/40">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-xs text-slate-400 font-semibold">Cihaz & Müşteri</TableHead>
                    <TableHead className="text-xs text-slate-400 font-semibold">Durum</TableHead>
                    <TableHead className="text-xs text-slate-400 font-semibold text-right">Tahmini</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-slate-800/50 hover:bg-slate-800/30">
                    <TableCell>
                      <div className="font-semibold text-xs text-slate-200">Apple iPhone 13</div>
                      <div className="text-[11px] text-slate-400">Ahmet Yılmaz • Şifre: 1907</div>
                    </TableCell>
                    <TableCell>
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
                      <div className="font-semibold text-xs text-slate-200">Samsung Galaxy S21 5G</div>
                      <div className="text-[11px] text-slate-400">Fatma Kaya • Şifre: 2468</div>
                    </TableCell>
                    <TableCell>
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
                      <div className="font-semibold text-xs text-slate-200">Xiaomi Xiaomi 12</div>
                      <div className="text-[11px] text-slate-400">Mehmet Öztürk • Soket Değişti</div>
                    </TableCell>
                    <TableCell>
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
    </div>
  )
}
