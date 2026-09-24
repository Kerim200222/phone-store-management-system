"use client"

import React, { useState } from "react"
import { 
  Smartphone, 
  ShieldCheck, 
  UserCheck, 
  Database, 
  Layers, 
  Search, 
  CheckCircle2, 
  Tag, 
  Hash, 
  Copy, 
  FileCode, 
  Server
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Product, Category, Role } from "@/types/database"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"inventory" | "schema" | "types" | "config">("inventory")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedCondition, setSelectedCondition] = useState<string>("all")
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const roles: Role[] = [
    {
      id: "role-1",
      name: "Admin",
      description: "Sistem Yöneticisi - Tüm modüllere, ayarlara, maliyetlere ve kullanıcı yönetimine tam erişim",
      created_at: new Date().toISOString()
    },
    {
      id: "role-2",
      name: "Personel",
      description: "Mağaza Personeli - Satış, ürün listeleme, stok güncelleme ve servis kabul yetkileri",
      created_at: new Date().toISOString()
    }
  ]

  const categories: Category[] = [
    {
      id: "cat-1",
      name: "Telefon",
      slug: "telefon",
      description: "Akıllı telefonlar ve tuşlu cihazlar (Sıfır ve İkinci El)",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "cat-2",
      name: "Aksesuar",
      slug: "aksesuar",
      description: "Kılıf, kırılmaz cam, şarj aletleri ve kablolar",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "cat-3",
      name: "Yedek Parça",
      slug: "yedek-parca",
      description: "Ekran panelleri, piller, şarj soketleri ve kameralar",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  const initialProducts: (Product & { categoryName: string })[] = [
    {
      id: "prod-1",
      category_id: "cat-1",
      categoryName: "Telefon",
      name: "Apple iPhone 15 Pro 128GB",
      brand: "Apple",
      model: "iPhone 15 Pro",
      barcode: "195949038241",
      imei: "354892091234567",
      condition: "sıfır",
      purchase_price: 64500,
      sale_price: 74999,
      stock_quantity: 4,
      min_stock_level: 1,
      description: "2 Yıl Apple Türkiye Garantili Kapalı Kutu",
      image_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "prod-2",
      category_id: "cat-1",
      categoryName: "Telefon",
      name: "Samsung Galaxy S23 Ultra 256GB",
      brand: "Samsung",
      model: "Galaxy S23 Ultra",
      barcode: "8806094772814",
      imei: "359876098765432",
      condition: "ikinci el",
      purchase_price: 34000,
      sale_price: 42500,
      stock_quantity: 2,
      min_stock_level: 1,
      description: "Kozmetik 9.5/10, kutulu faturalı 2. el cihaz",
      image_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "prod-3",
      category_id: "cat-1",
      categoryName: "Telefon",
      name: "Xiaomi Redmi Note 13 Pro 5G",
      brand: "Xiaomi",
      model: "Redmi Note 13 Pro",
      barcode: "6941812753218",
      imei: "867543021984210",
      condition: "sıfır",
      purchase_price: 13500,
      sale_price: 17200,
      stock_quantity: 8,
      min_stock_level: 2,
      description: "Distribütör Garantili Sıfır Cihaz",
      image_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "prod-4",
      category_id: "cat-2",
      categoryName: "Aksesuar",
      name: "Apple 20W USB-C Güç Adaptörü",
      brand: "Apple",
      model: "MHJE3TU/A",
      barcode: "194252157015",
      imei: null,
      condition: "sıfır",
      purchase_price: 520,
      sale_price: 849,
      stock_quantity: 45,
      min_stock_level: 5,
      description: "Orijinal Apple Türkiye Hızlı Şarj Cihazı",
      image_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "prod-5",
      category_id: "cat-3",
      categoryName: "Yedek Parça",
      name: "iPhone 11 GX OLED Ekran Paneli",
      brand: "Apple Uyumlu",
      model: "iPhone 11",
      barcode: "8680001122334",
      imei: null,
      condition: "sıfır",
      purchase_price: 1100,
      sale_price: 1950,
      stock_quantity: 12,
      min_stock_level: 3,
      description: "Teknik servis montajına hazır dokunmatik ekran",
      image_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  const filteredProducts = initialProducts.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.imei && item.imei.includes(searchQuery)) ||
      (item.barcode && item.barcode.includes(searchQuery))
    
    const matchesCategory = selectedCategory === "all" || item.categoryName === selectedCategory
    const matchesCondition = selectedCondition === "all" || item.condition === selectedCondition

    return matchesSearch && matchesCategory && matchesCondition
  })

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2500)
  }

  const sqlCodeUsersRoles = `-- Kullanıcılar ve Roller (01_users_and_roles.sql)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    role VARCHAR(50) NOT NULL DEFAULT 'Personel',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);`

  const sqlCodeProductsCategories = `-- Kategoriler ve Ürünler (02_categories_and_products.sql)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    barcode VARCHAR(100) UNIQUE,
    imei VARCHAR(15), -- Telefonlar için 15 haneli benzersiz IMEI
    condition VARCHAR(20) NOT NULL DEFAULT 'sıfır' CHECK (condition IN ('sıfır', 'ikinci el')),
    purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (purchase_price >= 0),
    sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (sale_price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INTEGER NOT NULL DEFAULT 1 CHECK (min_stock_level >= 0),
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_imei_format CHECK (imei IS NULL OR (length(imei) = 15 AND imei ~ '^[0-9]+$'))
);

CREATE UNIQUE INDEX idx_products_imei_unique ON public.products(imei) WHERE imei IS NOT NULL;`

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 text-white">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  PhoneStore Pro
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Telefon Mağazası ve Teknik Servis Yönetim Sistemi
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Next.js 14 App Router
            </span>
            <span className="px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium">
              Tailwind CSS & Shadcn UI
            </span>
            <span className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
              @supabase/ssr Entegre
            </span>
          </div>
        </header>

        {/* Milestone Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-300">Görev 1: Altyapı & Supabase</CardTitle>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-1.5">
              <p className="text-slate-200 font-medium">Next.js 14 + Shadcn UI + SSR Client</p>
              <p className="text-slate-400">utils/supabase/client.ts & server.ts hazırlandı, .env.local yapılandırıldı.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-300">Görev 2: Kullanıcılar & Roller</CardTitle>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-1.5">
              <p className="text-slate-200 font-medium">Admin & Personel Yetki Şeması</p>
              <p className="text-slate-400">RLS politikaları, auth.users tetikleyicisi ve types/database.ts tanımlandı.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-300">Görev 3: Ürünler & Kategoriler</CardTitle>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-1.5">
              <p className="text-slate-200 font-medium">15 Haneli Benzersiz IMEI & Durum</p>
              <p className="text-slate-400">Telefon, Aksesuar, Yedek Parça tabloları, alış/satış fiyatı ve stok sütunları hazır.</p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <Button
            variant={activeTab === "inventory" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("inventory")}
            className={activeTab === "inventory" ? "bg-cyan-600 hover:bg-cyan-500 text-white font-medium" : "text-slate-400 hover:text-white"}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Ürün Envanteri & IMEI Tablosu
          </Button>

          <Button
            variant={activeTab === "schema" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("schema")}
            className={activeTab === "schema" ? "bg-cyan-600 hover:bg-cyan-500 text-white font-medium" : "text-slate-400 hover:text-white"}
          >
            <Database className="w-4 h-4 mr-2" />
            Supabase SQL Scriptleri
          </Button>

          <Button
            variant={activeTab === "types" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("types")}
            className={activeTab === "types" ? "bg-cyan-600 hover:bg-cyan-500 text-white font-medium" : "text-slate-400 hover:text-white"}
          >
            <FileCode className="w-4 h-4 mr-2" />
            TypeScript Tipleri (types/database.ts)
          </Button>

          <Button
            variant={activeTab === "config" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("config")}
            className={activeTab === "config" ? "bg-cyan-600 hover:bg-cyan-500 text-white font-medium" : "text-slate-400 hover:text-white"}
          >
            <Server className="w-4 h-4 mr-2" />
            Supabase İstemci / Sunucu Yapısı
          </Button>
        </div>

        {/* TAB 1: INVENTORY & PRODUCTS */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Toplam Ürün Çeşidi</span>
                <p className="text-2xl font-bold text-white mt-1">{initialProducts.length}</p>
                <span className="text-[11px] text-cyan-400 flex items-center gap-1 mt-1">
                  <Tag className="w-3 h-3" /> 3 Ana Kategori
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">IMEI Kayıtlı Cihazlar</span>
                <p className="text-2xl font-bold text-cyan-400 mt-1">
                  {initialProducts.filter(p => p.imei).length}
                </p>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                  <Hash className="w-3 h-3" /> 15 Haneli Unique İndeks
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">İkinci El / Yenilenmiş</span>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  {initialProducts.filter(p => p.condition === "ikinci el").length}
                </p>
                <span className="text-[11px] text-amber-400/80 flex items-center gap-1 mt-1">
                  Kondisyon & Alış Takibi
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400">Kullanıcı Rolleri</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">2 Rol</p>
                <span className="text-[11px] text-emerald-400/80 flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3 h-3" /> Admin & Personel (RLS)
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <Card className="bg-slate-900/70 border-slate-800">
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      placeholder="Ürün adı, marka, barkod veya 15 haneli IMEI ile ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-slate-950/70 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 text-sm bg-slate-950/70 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="all">Tüm Kategoriler</option>
                      <option value="Telefon">📱 Telefon</option>
                      <option value="Aksesuar">🎧 Aksesuar</option>
                      <option value="Yedek Parça">🔧 Yedek Parça</option>
                    </select>

                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="px-3 py-2 text-sm bg-slate-950/70 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="all">Tüm Durumlar</option>
                      <option value="sıfır">Sıfır Cihaz</option>
                      <option value="ikinci el">İkinci El</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card className="bg-slate-900/80 border-slate-800 overflow-hidden">
              <CardHeader className="py-4 px-6 border-b border-slate-800/80 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-100">
                    Ürün ve Stok Envanteri ({filteredProducts.length} kayıt listelendi)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Supabase PostgreSQL products tablosunun birebir şemasını ve tiplerini yansıtır
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-950/50">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400 font-medium">Ürün & Model</TableHead>
                      <TableHead className="text-slate-400 font-medium">Kategori</TableHead>
                      <TableHead className="text-slate-400 font-medium">Durum</TableHead>
                      <TableHead className="text-slate-400 font-medium">IMEI / Barkod</TableHead>
                      <TableHead className="text-slate-400 font-medium text-right">Alış Fiyatı</TableHead>
                      <TableHead className="text-slate-400 font-medium text-right">Satış Fiyatı</TableHead>
                      <TableHead className="text-slate-400 font-medium text-right">Stok</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => {
                      const profit = p.sale_price - p.purchase_price
                      return (
                        <TableRow key={p.id} className="border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                          <TableCell className="font-medium text-slate-200">
                            <div>{p.name}</div>
                            <span className="text-[11px] text-slate-400 font-normal">
                              {p.brand} {p.model ? `• ${p.model}` : ""}
                            </span>
                          </TableCell>

                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={
                                p.categoryName === "Telefon" 
                                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                                  : p.categoryName === "Aksesuar"
                                  ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                                  : "border-purple-500/30 bg-purple-500/10 text-purple-300"
                              }
                            >
                              {p.categoryName}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                p.condition === "sıfır"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium"
                                  : "border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium"
                              }
                            >
                              {p.condition}
                            </Badge>
                          </TableCell>

                          <TableCell className="font-mono text-xs">
                            {p.imei ? (
                              <div className="flex items-center gap-1.5 text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/50 w-fit">
                                <Hash className="w-3 h-3 text-cyan-400" />
                                <span>{p.imei}</span>
                              </div>
                            ) : p.barcode ? (
                              <span className="text-slate-400">{p.barcode}</span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </TableCell>

                          <TableCell className="text-right font-mono text-slate-400">
                            ₺{p.purchase_price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                          </TableCell>

                          <TableCell className="text-right font-mono font-semibold text-emerald-400">
                            ₺{p.sale_price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                            <div className="text-[10px] text-slate-500 font-normal">
                              +₺{profit.toLocaleString("tr-TR")} kar
                            </div>
                          </TableCell>

                          <TableCell className="text-right font-mono">
                            <span className={p.stock_quantity <= p.min_stock_level ? "text-rose-400 font-bold" : "text-slate-300"}>
                              {p.stock_quantity} adet
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Categories & Roles Detail Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories */}
              <Card className="bg-slate-900/70 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Kategoriler Tablosu (categories)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Görev 3 kapsamında oluşturulan ana kategoriler
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-200 flex items-center gap-2">
                          {c.name}
                          <span className="text-xs font-mono text-slate-500">({c.slug})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
                        {c.name === "Telefon" ? "IMEI Zorunlu" : "Barkodlu"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Roles & Users */}
              <Card className="bg-slate-900/70 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Kullanıcı Rolleri (roles & profiles)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Görev 2 kapsamında oluşturulan yetkilendirme modeli
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {roles.map((r) => (
                    <div key={r.id} className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200 flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-cyan-400" />
                          {r.name}
                        </span>
                        <Badge variant="secondary" className="text-[11px] bg-slate-800 text-slate-300">
                          {r.name === "Admin" ? "Tam Yetki" : "Operasyonel Yetki"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{r.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: SUPABASE SQL SCRIPTS */}
        {activeTab === "schema" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Supabase SQL Editör Dosyaları</h2>
                <p className="text-xs text-slate-400">
                  Dosyalar <code className="text-cyan-400 font-mono">supabase/</code> klasöründe yer almaktadır ve SQL Editöründe doğrudan çalıştırılabilir.
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm"
                  variant="outline" 
                  onClick={() => copyToClipboard(sqlCodeUsersRoles, "users_sql")}
                  className="text-xs border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {copiedText === "users_sql" ? "Kopyalandı!" : "Kullanıcılar SQL Kopyala"}
                </Button>
                <Button 
                  size="sm"
                  variant="outline" 
                  onClick={() => copyToClipboard(sqlCodeProductsCategories, "products_sql")}
                  className="text-xs border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {copiedText === "products_sql" ? "Kopyalandı!" : "Ürünler SQL Kopyala"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* File 1: Users & Roles */}
              <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-slate-200">
                        supabase/01_users_and_roles.sql
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        Roller (Admin, Personel), profiller, tetikleyiciler & RLS
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-xs">
                      Görev 2
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-lg overflow-x-auto max-h-[420px] border border-slate-800/60 leading-relaxed">
                    {sqlCodeUsersRoles}
                  </pre>
                </CardContent>
              </Card>

              {/* File 2: Products & Categories */}
              <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-semibold text-slate-200">
                        supabase/02_categories_and_products.sql
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        Telefon, Aksesuar, Yedek Parça, 15 Haneli IMEI, Alış/Satış & Stok
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                      Görev 3
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-lg overflow-x-auto max-h-[420px] border border-slate-800/60 leading-relaxed">
                    {sqlCodeProductsCategories}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: TYPESCRIPT INTERFACES */}
        {activeTab === "types" && (
          <div className="space-y-6">
            <Card className="bg-slate-900/80 border-slate-800">
              <CardHeader className="border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-slate-200">
                      types/database.ts
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Supabase tabloları ve şemasıyla %100 uyumlu strongly-typed TypeScript arayüzleri
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                    Full Type Safety
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                    <h4 className="text-xs font-semibold text-cyan-400 mb-2 font-mono">Product Arayüzü</h4>
                    <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`export interface Product {
  id: string
  category_id: string
  name: string
  brand: string
  model: string | null
  barcode: string | null
  imei: string | null // 15 haneli IMEI
  condition: 'sıfır' | 'ikinci el'
  purchase_price: number // Alış Fiyatı
  sale_price: number // Satış Fiyatı
  stock_quantity: number // Stok Adedi
  min_stock_level: number
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}`}
                    </pre>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                    <h4 className="text-xs font-semibold text-emerald-400 mb-2 font-mono">Profile & Role Arayüzü</h4>
                    <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`export type UserRole = 'Admin' | 'Personel'

export interface Role {
  id: string
  name: UserRole
  description: string | null
  created_at: string
}

export interface Profile {
  id: string // auth.users id
  email: string | null
  full_name: string
  phone: string | null
  role_id: string
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 4: SSR CLIENT / SERVER CONFIG */}
        {activeTab === "config" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-slate-200">
                    utils/supabase/client.ts (Browser Client)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Client Component&apos;lar için createBrowserClient örneği
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-800/60 leading-relaxed">
{`import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}`}
                  </pre>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-slate-200">
                    utils/supabase/server.ts (Server Client)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Server Component ve Server Actions için createServerClient örneği
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-lg overflow-x-auto border border-slate-800/60 leading-relaxed">
{`import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {}
        },
      },
    }
  )
}`}
                  </pre>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-200">
                  .env.local Ortam Değişkenleri Şablonu
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Supabase Dashboard &gt; Project Settings &gt; API bölümünden alınacak anahtarlar
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <pre className="text-xs font-mono text-cyan-300 bg-slate-950 p-4 rounded-lg border border-slate-800/60">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here`}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}
