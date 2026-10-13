import React from "react"
import Link from "next/link"
import { 
  FileQuestion, 
  LayoutDashboard, 
  Search, 
  Wrench, 
  Boxes 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DashboardNotFound() {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto flex items-center justify-center min-h-[65vh]">
      <div className="w-full p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-2xl shadow-cyan-950/20 text-center space-y-6">
        
        {/* İkon */}
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileQuestion className="w-8 h-8 animate-pulse" />
          </div>
          <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30 text-xs px-2.5 py-0.5">
            Kayıt veya Sayfa Bulunamadı
          </Badge>
        </div>

        {/* Başlık */}
        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            İlgili Panel Kaydına Ulaşılamadı
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Aradığınız servis bilet numarası, envanter barkodu veya alt yönetim sayfası mevcut değil ya da sistemden kaldırılmış.
          </p>
        </div>

        {/* Aksiyonlar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium gap-2 shadow-md shadow-cyan-500/20 h-9 px-4 text-xs">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard Panosu
            </Button>
          </Link>

          <Link href="/dashboard/inventory">
            <Button variant="outline" className="border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-200 gap-1.5 h-9 px-3 text-xs">
              <Boxes className="w-3.5 h-3.5 text-amber-400" />
              Envanter Listesi
            </Button>
          </Link>

          <Link href="/dashboard/service">
            <Button variant="outline" className="border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-200 gap-1.5 h-9 px-3 text-xs">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              Teknik Servis
            </Button>
          </Link>
        </div>

        {/* Global Arama Kısayolu */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between max-w-md mx-auto">
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            Hızlı cihaz veya müşteri araması yapın
          </span>
          <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-300">
            ⌘K
          </kbd>
        </div>

      </div>
    </div>
  )
}
