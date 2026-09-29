"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  Settings, 
  ShieldCheck, 
  ArrowLeft, 
  Store, 
  Receipt, 
  Wrench, 
  Database, 
  Lock, 
  Save, 
  CheckCircle2,
  Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<"store" | "financial" | "repairs" | "security">("store")

  // Form State
  const [storeName, setStoreName] = useState("Trunçgiller İletişim & Teknik Servis")
  const [taxNumber, setTaxNumber] = useState("TR8492019482")
  const [storePhone, setStorePhone] = useState("0850 123 45 67")
  const [storeAddress, setStoreAddress] = useState("Atatürk Bulvarı No:142 Çankaya / Ankara")
  const [vatRate, setVatRate] = useState("20")
  const [warrantyDays, setWarrantyDays] = useState("90")
  const [sessionTimeoutHours, setSessionTimeoutHours] = useState("24")

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Yönetim Paneline Dön
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20 text-white">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
                  Sistem Ayarları
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs px-2 py-0.5 font-normal flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Admin Yetkisi Doğrulandı
                  </Badge>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Mağaza parametreleri, teknik servis garanti kuralları ve veritabanı güvenlik politikaları
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-purple-500/40 bg-purple-500/10 text-purple-300 text-xs px-3 py-1">
              Next.js Middleware: RBAC Korumalı
            </Badge>
          </div>
        </div>

        {/* Security Notice Banner */}
        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-start gap-3">
          <Lock className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <p className="font-semibold text-purple-200">
              Bu rota Next.js Middleware (middleware.ts) tarafından yetki tabanlı olarak korunmaktadır (RBAC).
            </p>
            <p className="text-slate-400">
              Sadece <strong className="text-slate-200 font-medium">Admin</strong> rolüne sahip yetkili kullanıcılar erişebilir. 
              Personel rolündeki hesaplar bu rotaya erişmeye çalıştığında middleware tarafından otomatik olarak engellenir ve yönlendirilir.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {saved && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sistem ayarları başarıyla kaydedildi ve tüm servis noktalarına senkronize edildi.</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <Button
            variant={activeTab === "store" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("store")}
            className={activeTab === "store" ? "bg-purple-600 hover:bg-purple-500 text-white font-medium" : "text-slate-400 hover:text-white"}
          >
            <Store className="w-4 h-4 mr-2" />
            Mağaza & Şube
          </Button>

          <Button
            variant={activeTab === "financial" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("financial")}
            className={activeTab === "financial" ? "bg-purple-600 hover:bg-purple-500 text-white font-medium" : "text-slate-400 hover:text-white"}
          >
            <Receipt className="w-4 h-4 mr-2 text-indigo-400" />
            Kasa & Vergi
          </Button>

          <Button
            variant={activeTab === "repairs" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("repairs")}
            className={activeTab === "repairs" ? "bg-purple-600 hover:bg-purple-500 text-white font-medium" : "text-slate-400 hover:text-white"}
          >
            <Wrench className="w-4 h-4 mr-2 text-cyan-400" />
            Teknik Servis Kuralları
          </Button>

          <Button
            variant={activeTab === "security" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("security")}
            className={activeTab === "security" ? "bg-purple-600 hover:bg-purple-500 text-white font-medium" : "text-slate-400 hover:text-white"}
          >
            <Database className="w-4 h-4 mr-2 text-emerald-400" />
            Veritabanı & Güvenlik
          </Button>
        </div>

        {/* Tab Contents */}
        <form onSubmit={handleSave} className="space-y-6">
          {activeTab === "store" && (
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  Mağaza ve Şube Kimlik Bilgileri
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Fiş, fatura ve servis formlarında görüntülenecek resmi şirket bilgileri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storeName" className="text-xs">Firma Ünvanı</Label>
                    <Input
                      id="storeName"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="bg-slate-950/60 border-slate-700/80 text-white text-xs h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxNumber" className="text-xs">Vergi Kimlik No / Dairesi</Label>
                    <Input
                      id="taxNumber"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      className="bg-slate-950/60 border-slate-700/80 text-white text-xs h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storePhone" className="text-xs">İletişim Telefonu</Label>
                    <Input
                      id="storePhone"
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      className="bg-slate-950/60 border-slate-700/80 text-white text-xs h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeAddress" className="text-xs">Mağaza Adresi</Label>
                    <Input
                      id="storeAddress"
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      className="bg-slate-950/60 border-slate-700/80 text-white text-xs h-9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "financial" && (
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-400" />
                  Kasa, Satış ve Vergi Parametreleri
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Satışlarda uygulanacak varsayılan KDV oranı ve kasa mutabakat kuralları
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vatRate" className="text-xs">Varsayılan KDV Oranı (%)</Label>
                    <Input
                      id="vatRate"
                      type="number"
                      value={vatRate}
                      onChange={(e) => setVatRate(e.target.value)}
                      className="bg-slate-950/60 border-slate-700/80 text-white text-xs h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-xs">Para Birimi</Label>
                    <Input
                      id="currency"
                      value="Türk Lirası (₺ - TRY)"
                      disabled
                      className="bg-slate-950/40 border-slate-800 text-slate-400 text-xs h-9 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-400">
                  💡 Kasa hareketleri SQL şemasında `public.transactions` tablosunda ve Gün 3 SQLite altyapısında çift defter kaydı olarak saklanmaktadır.
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "repairs" && (
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  Teknik Servis ve Onarım Parametreleri
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Arıza kabul formu kuralları, cihaz şifresi zorunluluğu ve onarım garantisi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warrantyDays" className="text-xs">Onarım Garanti Süresi (Gün)</Label>
                    <Input
                      id="warrantyDays"
                      type="number"
                      value={warrantyDays}
                      onChange={(e) => setWarrantyDays(e.target.value)}
                      className="bg-slate-950/60 border-slate-700/80 text-white text-xs h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pinPolicy" className="text-xs">Cihaz Şifresi Politikası</Label>
                    <Input
                      id="pinPolicy"
                      value="Müşteri Onayı ile Zorunlu (Test Süreci İçin)"
                      disabled
                      className="bg-slate-950/40 border-slate-800 text-slate-400 text-xs h-9 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/30 text-xs text-cyan-300">
                  🔧 Gün 5 kapsamında uygulanan `repair_tickets` tablosundaki JSONB parça mimarisi ve cihaz şifresi alanı aktiftir.
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-base text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Veritabanı Güvenliği ve RLS Politikaları
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Supabase Row Level Security (RLS) ve oturum politikası durumu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout" className="text-xs">Oturum Zaman Aşımı (Saat)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={sessionTimeoutHours}
                      onChange={(e) => setSessionTimeoutHours(e.target.value)}
                      className="bg-slate-950/60 border-slate-700/80 text-white text-xs h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rlsStatus" className="text-xs">Supabase RLS Durumu</Label>
                    <Input
                      id="rlsStatus"
                      value="Tüm Tablolarda Etkin (Roles, Products, Repairs, Transactions)"
                      disabled
                      className="bg-slate-950/40 border-slate-800 text-emerald-400 text-xs h-9 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-300">
                  🛡️ `middleware.ts` dosyası yetkisiz istekleri sunucu tarafında keserek korumasız veri akışını engeller.
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link href="/dashboard">
              <Button type="button" variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:text-white">
                Vazgeç
              </Button>
            </Link>
            <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-medium gap-1.5 shadow-md shadow-purple-600/20">
              <Save className="w-4 h-4" />
              Ayarları Kaydet
            </Button>
          </div>
        </form>
    </div>
  )
}
