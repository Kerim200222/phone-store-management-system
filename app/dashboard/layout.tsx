"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Smartphone, 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Wrench, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink, 
  Store, 
  ChevronRight,
  Shield,
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRoleAccess } from "@/hooks/use-role-access"
import { NavItemConfig } from "@/types/auth"
import { CustomAvatar } from "@/components/ui/custom-avatar"

const navItems: NavItemConfig[] = [
  {
    title: "Ana Sayfa",
    href: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["Admin", "Personel"],
  },
  {
    title: "Kasa",
    href: "/dashboard/transactions",
    icon: Receipt,
    badge: "₺ Kasa",
    allowedRoles: ["Admin", "Personel"],
  },
  {
    title: "Stok",
    href: "/dashboard/inventory",
    icon: Package,
    badge: "IMEI",
    allowedRoles: ["Admin", "Personel"],
  },
  {
    title: "Teknik Servis",
    href: "/dashboard/repairs",
    icon: Wrench,
    badge: "G5",
    allowedRoles: ["Admin", "Personel"],
  },
  {
    title: "Müşteriler",
    href: "/dashboard/customers",
    icon: Users,
    badge: "Cari",
    allowedRoles: ["Admin", "Personel"],
  },
  {
    title: "Ayarlar",
    href: "/dashboard/settings",
    icon: Settings,
    badge: "Admin",
    adminOnly: true,
    allowedRoles: ["Admin"],
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Use custom RBAC hook
  const { 
    userRole, 
    userEmail, 
    isAdmin, 
    isLoading, 
    signOut 
  } = useRoleAccess()

  // RBAC Navigation Filtering using useMemo
  const filteredNavItems = useMemo(() => {
    return navItems.filter((item) => {
      if (item.adminOnly) {
        return userRole === "Admin"
      }
      if (item.allowedRoles && item.allowedRoles.length > 0) {
        return item.allowedRoles.includes(userRole)
      }
      return true
    })
  }, [userRole])

  // Sayfa değiştiğinde mobil menüyü otomatik kapat
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Aktif sayfa başlığı
  const currentTitle = navItems.find((item) => item.href === pathname)?.title || "Yönetim Paneli"

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-white flex flex-col">
      {/* Arka Plan Efektleri */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MASAÜSTÜ SOL SIDEBAR (lg ve üzeri ekranlar)                             */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-900/80 border-r border-slate-800/90 backdrop-blur-xl z-30 shadow-2xl">
        {/* Sidebar Logo & Marka Başlığı */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 text-white group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                PhoneStore Pro
              </div>
              <div className="text-[10px] text-cyan-400 font-medium">
                Trunçgiller Staj Sistemi
              </div>
            </div>
          </Link>
        </div>

        {/* Sidebar Navigasyon Linkleri - RBAC Filtrelenmiş Liste */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto px-3 py-4 space-y-6">
          <nav className="space-y-1">
            <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              <span>Yönetim Menüsü</span>
              <Badge variant="outline" className="text-[9px] px-1 py-0 border-slate-800 text-slate-400">
                RBAC
              </Badge>
            </div>

            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400"
                    }`} />
                    <span>{item.title}</span>
                  </div>

                  {item.badge && (
                    <Badge 
                      variant="outline" 
                      className={`text-[9px] px-1.5 py-0 border-none ${
                        isActive
                          ? "bg-cyan-500/30 text-cyan-200"
                          : item.adminOnly
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Alt Bilgi Kutusu */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400">Erişim Seviyesi</span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                  isAdmin ? "text-purple-400" : "text-blue-400"
                }`}>
                  {isAdmin ? <Shield className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                  {userRole} Rolü
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                {isAdmin 
                  ? "Tam yönetici yetkisi ile tüm modüllere erişim açık." 
                  : "Personel modu: Ayarlar paneli RBAC ile gizlenmiştir."}
              </p>
            </div>

            <Link
              href="/"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 text-[11px] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-cyan-400" />
                <span>Envanter Vitrini</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-300" />
            </Link>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBİL SIDEBAR ÇEKMECESİ (Responsive Drawer Overlay)                     */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Karartma Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobil Menü İçeriği */}
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between shadow-2xl z-50">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl text-white">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">PhoneStore Pro</div>
                    <div className="text-[10px] text-cyan-400">Trunçgiller Staj Paneli</div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 h-8 w-8 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Mobil Navigasyon Linkleri - RBAC Filtrelenmiş */}
              <nav className="space-y-1">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-none bg-slate-800 text-slate-300">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Mobil Menü Alt Çıkış */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                <div className="text-slate-400 text-[10px]">Oturum Açan:</div>
                <div className="font-mono text-cyan-300 font-semibold truncate text-[11px]">{userEmail}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Rol: <span className="text-white font-medium">{userRole}</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="w-full border-rose-900/50 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 text-xs justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ANA İÇERİK ALANI + ÜST HEADER                                          */}
      {/* ========================================================================= */}
      <div className="lg:pl-64 flex flex-col flex-1 relative z-10">
        
        {/* Üst Header Bar */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          {/* Sol Kısım: Hamburger Menü + Sayfa Başlığı / Breadcrumb */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white"
              aria-label="Menüyü Aç"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden sm:inline">Panel</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
              <span className="font-semibold text-white sm:text-sm">{currentTitle}</span>
              <Badge variant="outline" className="hidden md:inline-flex border-cyan-500/30 text-cyan-400 bg-cyan-500/10 text-[10px] ml-1">
                RBAC Aktif
              </Badge>
            </div>
          </div>

          {/* Sağ Kısım: Kullanıcı Profili + Rol Rozeti + Çıkış Yap Butonu */}
          <div className="flex items-center gap-3">
            {/* Kullanıcı Profil Bilgisi */}
            <div className="flex items-center gap-2.5 pl-2">
              <CustomAvatar 
                name={userEmail || userRole} 
                size={32} 
                showBadge={true} 
                badgeColor={isAdmin ? "cyan" : "emerald"} 
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[150px]">
                  {isLoading ? "Yükleniyor..." : userEmail}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span>Rol:</span>
                  <Badge 
                    className={`text-[9px] px-1.5 py-0 border-none font-semibold ${
                      userRole === "Admin" 
                        ? "bg-purple-500/20 text-purple-300" 
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {userRole}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Çıkış Yap Butonu */}
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="border-rose-900/40 bg-rose-950/20 text-rose-300 hover:bg-rose-900/40 hover:text-white text-xs h-8 px-2.5 gap-1.5 shadow-sm"
              title="Oturumu Güvenli Şekilde Kapat"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Çıkış Yap</span>
            </Button>
          </div>
        </header>

        {/* Ana Sayfa İçerik Alanı (children) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 px-4 sm:px-6 lg:px-8 py-3 text-center text-[11px] text-slate-500">
          Trunçgiller Staj Projesi — Telefon Mağazası Yönetim Sistemi © 2026 • Mentör: Faruk Hoca
        </footer>
      </div>
    </div>
  )
}
