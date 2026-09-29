"use client"

import React, { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ShieldAlert, ArrowLeft, LogIn, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function UnauthorizedContent() {
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/dashboard/settings"
  const currentRole = searchParams.get("role") || "Personel"

  return (
    <div className="relative w-full max-w-lg space-y-6">
      
      {/* Brand & Icon */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="p-4 bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-rose-500/30 rounded-2xl shadow-xl shadow-rose-500/10 text-rose-400">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <div>
          <Badge variant="outline" className="border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs px-3 py-1 mb-2">
            HTTP 403: Erişim Engellendi (RBAC)
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Yetkisiz Sayfa Erişimi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">
            Next.js <code className="text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">middleware.ts</code> rota koruma mekanizması bu sayfaya erişimi sınırlandırmıştır.
          </p>
        </div>
      </div>

      <Card className="bg-slate-900/70 border-slate-800 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" />
            Rol Yetkilendirme Detayları
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Erişilmek istenen rota üst düzey yönetici izni gerektirmektedir.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2 text-xs bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400">Erişilmek İstenen Rota:</span>
              <span className="font-mono text-cyan-300 font-semibold">{from}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Gerekli Rol:</span>
              <span className="font-semibold text-emerald-400">Admin</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400">Mevcut Oturum Rolü:</span>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[11px] px-2 py-0.5">
                {currentRole}
              </Badge>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed">
            ⚠️ <strong>Sistem Notu:</strong> Mağaza personelinin sistem ayarlarına, vergi oranlarına veya kullanıcı izinlerine müdahale etmesi güvenlik politikaları gereğince kısıtlanmıştır.
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Link href="/dashboard" className="flex-1">
              <Button variant="default" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs h-9 gap-1.5 shadow-md shadow-cyan-600/20">
                <ArrowLeft className="w-3.5 h-3.5" />
                Yönetim Paneline Dön
              </Button>
            </Link>
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs h-9 gap-1.5">
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                Admin Hesabıyla Giriş Yap
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

export default function UnauthorizedPage() {
  return (
    <div className="py-6 flex flex-col justify-center items-center">
      <Suspense fallback={
        <div className="text-center text-xs text-slate-400">Yetkilendirme denetleniyor...</div>
      }>
        <UnauthorizedContent />
      </Suspense>
    </div>
  )
}
