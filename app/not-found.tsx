import React from "react"
import Link from "next/link"
import { 
  FileQuestion, 
  LayoutDashboard, 
  ShoppingBag, 
  Wrench, 
  Search, 
  Smartphone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Üst Mini Header */}
      <header className="border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-wide">
            Telefon Mağazası <span className="text-cyan-400">Yönetimi</span>
          </span>
        </Link>
        
        <Badge variant="outline" className="border-slate-800 text-slate-400 text-xs px-2.5 py-0.5">
          Hata Kodu: 404 Not Found
        </Badge>
      </header>

      {/* Ana 404 İçerik Kartı */}
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Arka Plan Glow Efektleri */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-xl w-full text-center space-y-6 p-8 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl shadow-2xl shadow-cyan-950/20">
          
          {/* İkon & 404 Rozeti */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center shadow-inner">
                <FileQuestion className="w-10 h-10 text-cyan-400 animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold">
                404
              </div>
            </div>

            <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30 text-xs px-3 py-1 mt-2">
              Sayfa veya Kayıt Bulunamadı
            </Badge>
          </div>

          {/* Başlık ve Açıklama */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Aradığınız Sayfa Mevcut Değil
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Ulaşmaya çalıştığınız sayfa kaldırılmış, adı değiştirilmiş veya geçersiz bir servis fişi / IMEI sorgusu yapılmış olabilir.
            </p>
          </div>

          {/* Hızlı Yönlendirme Aksiyonları */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium gap-2 shadow-lg shadow-cyan-500/20 h-10 px-5 text-xs sm:text-sm">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard Ana Sayfa
              </Button>
            </Link>

            <Link href="/dashboard/service">
              <Button variant="outline" className="border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-200 gap-2 h-10 px-4 text-xs sm:text-sm">
                <Wrench className="w-4 h-4 text-amber-400" />
                Teknik Servis
              </Button>
            </Link>

            <Link href="/dashboard/pos">
              <Button variant="outline" className="border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-200 gap-2 h-10 px-4 text-xs sm:text-sm">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                POS Satış
              </Button>
            </Link>
          </div>

          {/* Arama İpucu */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Belirli bir müşteri, IMEI veya ürün mü arıyorsunuz?</span>
            </div>
            <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 shrink-0">
              ⌘K / Ctrl+K
            </kbd>
          </div>

        </div>
      </main>

      {/* Alt Bilgi */}
      <footer className="border-t border-slate-900/80 px-6 py-4 text-center text-xs text-slate-400">
        Telefon Mağazası Yönetim Sistemi &copy; {new Date().getFullYear()} • Hata Yönetimi ve Güvenlik Altyapısı
      </footer>

    </div>
  )
}
