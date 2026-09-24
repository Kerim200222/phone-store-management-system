"use client"

import React, { useState } from "react"
import { 
  Smartphone, 
  ShieldCheck, 
  Database, 
  Search, 
  CheckCircle2, 
  Tag, 
  Hash, 
  Copy, 
  FileCode, 
  Server,
  Users,
  Receipt,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownLeft,
  Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { 
  Product, 
  Category, 
  Role, 
  Customer, 
  Transaction 
} from "@/types/database"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"inventory" | "transactions" | "customers" | "schema" | "types" | "config">("inventory")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedCondition, setSelectedCondition] = useState<string>("all")
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>("all")
  const [customerSearch, setCustomerSearch] = useState("")
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [selectedSqlTab, setSelectedSqlTab] = useState<"01" | "02" | "03" | "all">("03")

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
      description: "Servis montajına hazır dokunmatik panel",
      image_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Day 4: Örnek Müşteriler (Customers)
  const initialCustomers: Customer[] = [
    {
      id: "c1",
      full_name: "Ahmet Yılmaz",
      phone: "0532 111 22 33",
      email: "ahmet.yilmaz@example.com",
      identity_number: "12345678901",
      address: "Kadıköy, İstanbul",
      notes: "Sürekli iPhone müşterisi, faturalı alım yapar.",
      balance: 0.00,
      is_active: true,
      created_at: "2026-09-24T10:00:00Z",
      updated_at: "2026-09-24T10:00:00Z"
    },
    {
      id: "c2",
      full_name: "Fatma Kaya",
      phone: "0542 333 44 55",
      email: "fatma.kaya@example.com",
      identity_number: "23456789012",
      address: "Beşiktaş, İstanbul",
      notes: "Aksesuar ve şarj aletleri satın aldı.",
      balance: 0.00,
      is_active: true,
      created_at: "2026-09-24T11:15:00Z",
      updated_at: "2026-09-24T11:15:00Z"
    },
    {
      id: "c3",
      full_name: "Mehmet Öztürk",
      phone: "0555 777 88 99",
      email: "mehmet.ozturk@example.com",
      identity_number: "34567890123",
      address: "Çankaya, Ankara",
      notes: "İkinci el cihaz takası yaptı, veresiye borcu bulunuyor.",
      balance: -1200.00,
      is_active: true,
      created_at: "2026-09-24T12:30:00Z",
      updated_at: "2026-09-24T12:30:00Z"
    },
    {
      id: "c4",
      full_name: "Zeynep Çelik",
      phone: "0505 999 00 11",
      email: "zeynep.celik@example.com",
      identity_number: "45678901234",
      address: "Muratpaşa, Antalya",
      notes: "Ekran koruyucu taktırdı, kasada avansı var.",
      balance: 500.00,
      is_active: true,
      created_at: "2026-09-24T13:45:00Z",
      updated_at: "2026-09-24T13:45:00Z"
    }
  ]

  // Day 4: Örnek Kasa ve Satış İşlemleri (Transactions)
  const initialTransactions: (Transaction & { customerName: string; itemCount: number })[] = [
    {
      id: "t1",
      transaction_number: "TRX-20260924-001",
      customer_id: "c1",
      customerName: "Ahmet Yılmaz",
      type: "sale",
      payment_method: "credit_card",
      total_amount: 68000,
      discount_amount: 1000,
      net_amount: 67000,
      paid_amount: 67000,
      status: "completed",
      notes: "iPhone 15 Pro 128GB Naturel Titanyum satışı (IMEI: 354892091234567)",
      created_by: "role-1",
      itemCount: 1,
      created_at: "2026-09-24T10:15:00Z",
      updated_at: "2026-09-24T10:15:00Z"
    },
    {
      id: "t2",
      transaction_number: "TRX-20260924-002",
      customer_id: "c2",
      customerName: "Fatma Kaya",
      type: "sale",
      payment_method: "cash",
      total_amount: 1400,
      discount_amount: 0,
      net_amount: 1400,
      paid_amount: 1400,
      status: "completed",
      notes: "Apple 20W Hızlı Şarj Başlığı + Magsafe Kılıf",
      created_by: "role-2",
      itemCount: 2,
      created_at: "2026-09-24T11:20:00Z",
      updated_at: "2026-09-24T11:20:00Z"
    },
    {
      id: "t3",
      transaction_number: "TRX-20260924-003",
      customer_id: "c3",
      customerName: "Mehmet Öztürk",
      type: "purchase",
      payment_method: "bank_transfer",
      total_amount: 42000,
      discount_amount: 0,
      net_amount: 42000,
      paid_amount: 42000,
      status: "completed",
      notes: "İkinci el Samsung Galaxy S23 Ultra alımı (IMEI: 359876098765432)",
      created_by: "role-1",
      itemCount: 1,
      created_at: "2026-09-24T12:45:00Z",
      updated_at: "2026-09-24T12:45:00Z"
    },
    {
      id: "t4",
      transaction_number: "TRX-20260924-004",
      customer_id: "c4",
      customerName: "Zeynep Çelik",
      type: "sale",
      payment_method: "cash",
      total_amount: 250,
      discount_amount: 0,
      net_amount: 250,
      paid_amount: 250,
      status: "completed",
      notes: "Kırılmaz cam ekran koruyucu ve montaj hizmeti",
      created_by: "role-2",
      itemCount: 1,
      created_at: "2026-09-24T13:50:00Z",
      updated_at: "2026-09-24T13:50:00Z"
    }
  ]

  // Filter products
  const filteredProducts = initialProducts.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchQuery)) ||
      (product.imei && product.imei.includes(searchQuery))

    const matchesCategory = 
      selectedCategory === "all" || product.categoryName === selectedCategory

    const matchesCondition = 
      selectedCondition === "all" || product.condition === selectedCondition

    return matchesSearch && matchesCategory && matchesCondition
  })

  // Filter transactions
  const filteredTransactions = initialTransactions.filter((trx) => {
    const matchesType = transactionTypeFilter === "all" || trx.type === transactionTypeFilter
    return matchesType
  })

  // Filter customers
  const filteredCustomers = initialCustomers.filter((cust) => {
    return (
      cust.full_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      cust.phone.includes(customerSearch) ||
      (cust.identity_number && cust.identity_number.includes(customerSearch))
    )
  })

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Financial calculations
  const totalSalesRevenue = initialTransactions
    .filter(t => t.type === "sale" && t.status === "completed")
    .reduce((acc, t) => acc + t.net_amount, 0)

  const totalCashInRegister = initialTransactions
    .filter(t => t.payment_method === "cash" && t.type === "sale")
    .reduce((acc, t) => acc + t.paid_amount, 0)

  const totalCreditCardSales = initialTransactions
    .filter(t => t.payment_method === "credit_card" && t.type === "sale")
    .reduce((acc, t) => acc + t.paid_amount, 0)

  const totalPurchases = initialTransactions
    .filter(t => t.type === "purchase")
    .reduce((acc, t) => acc + t.paid_amount, 0)

  // SQL code snippets
  const sqlCodeUsersRoles = `-- 01_users_and_roles.sql
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
    role_id UUID NOT NULL REFERENCES public.roles(id),
    role VARCHAR(50) NOT NULL DEFAULT 'Personel',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);`

  const sqlCodeProductsCategories = `-- 02_categories_and_products.sql
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    barcode VARCHAR(100) UNIQUE,
    imei VARCHAR(15), -- 15 Haneli Unique IMEI
    condition VARCHAR(20) NOT NULL DEFAULT 'sıfır' CHECK (condition IN ('sıfır', 'ikinci el')),
    purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT check_imei_format CHECK (imei IS NULL OR (length(imei) = 15 AND imei ~ '^[0-9]+$'))
);
CREATE UNIQUE INDEX idx_products_imei_unique ON public.products(imei) WHERE imei IS NOT NULL;`

  const sqlCodeCustomersTransactions = `-- 03_customers_and_transactions.sql (Day 4 - Closes #43)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    identity_number VARCHAR(11), -- TCKN / Vergi No
    address TEXT,
    notes TEXT,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Cari bakiye
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_customers_full_name ON public.customers(full_name);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('sale', 'purchase', 'return', 'repair_payment')),
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'bank_transfer', 'on_account', 'split')),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    imei VARCHAR(15),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);`

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
                  Trunçgiller Staj Projesi — Telefon Mağazası ve Teknik Servis Yönetim Sistemi
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

        {/* 4 Task Cards (G1 - G4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-300">1. Altyapı & Supabase</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-1">
              <p className="text-slate-200 font-medium">Next.js 14 + Shadcn UI</p>
              <p className="text-slate-400">SSR Client & Server yapıları hazırlandı.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-300">2. Kullanıcılar & Roller</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-1">
              <p className="text-slate-200 font-medium">Admin & Personel Şeması</p>
              <p className="text-slate-400">RLS politikaları & auth trigger&apos;ı kuruldu.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-300">3. Ürünler & IMEI</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-1">
              <p className="text-slate-200 font-medium">15 Haneli Unique IMEI</p>
              <p className="text-slate-400">Telefon, Aksesuar & Parça envanteri.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-cyan-500/40 backdrop-blur-md shadow-lg shadow-cyan-950/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-cyan-400">4. Müşteri & Kasa (Day 4)</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-400 space-y-1">
              <p className="text-slate-100 font-medium">Kasa, İşlem & Cari Takip</p>
              <p className="text-slate-400">Transactions & Items ara tablosu (Closes #43).</p>
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
            Ürün Envanteri & IMEI
          </Button>

          <Button
            variant={activeTab === "transactions" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("transactions")}
            className={activeTab === "transactions" ? "bg-cyan-600 hover:bg-cyan-500 text-white font-medium" : "text-slate-400 hover:text-white"}
          >
            <Receipt className="w-4 h-4 mr-2 text-cyan-400" />
            Kasa & İşlemler
            <Badge className="ml-2 bg-cyan-500/20 text-cyan-300 border-none text-[10px] px-1.5 py-0">
              G4
            </Badge>
          </Button>

          <Button
            variant={activeTab === "customers" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("customers")}
            className={activeTab === "customers" ? "bg-cyan-600 hover:bg-cyan-500 text-white font-medium" : "text-slate-400 hover:text-white"}
          >
            <Users className="w-4 h-4 mr-2 text-emerald-400" />
            Müşteriler & Cari
            <Badge className="ml-2 bg-emerald-500/20 text-emerald-300 border-none text-[10px] px-1.5 py-0">
              G4
            </Badge>
          </Button>

          <Button
            variant={activeTab === "schema" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("schema")}
            className={activeTab === "schema" ? "bg-cyan-600 hover:bg-cyan-500 text-white font-medium" : "text-slate-400 hover:text-white"}
          >
            <Database className="w-4 h-4 mr-2" />
            SQL Şemaları
          </Button>

          <Button
            variant={activeTab === "types" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("types")}
            className={activeTab === "types" ? "bg-cyan-600 hover:bg-cyan-500 text-white font-medium" : "text-slate-400 hover:text-white"}
          >
            <FileCode className="w-4 h-4 mr-2" />
            TypeScript Tipleri
          </Button>

          <Button
            variant={activeTab === "config" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("config")}
            className={activeTab === "config" ? "bg-cyan-600 hover:bg-cyan-500 text-white font-medium" : "text-slate-400 hover:text-white"}
          >
            <Server className="w-4 h-4 mr-2" />
            Supabase SSR
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
                  <Tag className="w-3 h-3" /> {categories.length} Ana Kategori
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
                <p className="text-2xl font-bold text-emerald-400 mt-1">{roles.length} Rol</p>
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
                      <option value="all">Tüm Kondisyonlar</option>
                      <option value="sıfır">Sıfır Cihaz</option>
                      <option value="ikinci el">İkinci El Cihaz</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card className="bg-slate-900/70 border-slate-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-950/50">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-300 font-semibold">Ürün Adı & Model</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Kategori</TableHead>
                    <TableHead className="text-slate-300 font-semibold">15 Haneli IMEI / Barkod</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Kondisyon</TableHead>
                    <TableHead className="text-slate-300 font-semibold text-right">Alış Fiyatı</TableHead>
                    <TableHead className="text-slate-300 font-semibold text-right">Satış Fiyatı</TableHead>
                    <TableHead className="text-slate-300 font-semibold text-center">Stok</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((p) => (
                    <TableRow key={p.id} className="border-slate-800/60 hover:bg-slate-800/30">
                      <TableCell className="font-medium">
                        <div className="font-semibold text-slate-100">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.brand} {p.model ? `• ${p.model}` : ""}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-700 bg-slate-900 text-slate-300">
                          {p.categoryName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.imei ? (
                          <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-300 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/50 w-fit">
                            <Hash className="w-3 h-3 text-cyan-400" />
                            {p.imei}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">{p.barcode || "—"}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {p.condition === "sıfır" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Sıfır
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            2. El
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-400 text-xs">
                        ₺{p.purchase_price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-slate-100">
                        ₺{p.sale_price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          p.stock_quantity <= p.min_stock_level
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-slate-800 text-slate-200"
                        }`}>
                          {p.stock_quantity} Adet
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* TAB 2: TRANSACTIONS & CASH REGISTER (Day 4) */}
        {activeTab === "transactions" && (
          <div className="space-y-6">
            {/* Financial Summary KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  Toplam Satış Cirosu
                </span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  ₺{totalSalesRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">Net Tahsilat Tutarı</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-cyan-400" />
                  Kasa Nakit
                </span>
                <p className="text-2xl font-bold text-cyan-400 mt-1">
                  ₺{totalCashInRegister.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">Fiili Nakit Kasa Bakiyesi</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                  Kredi Kartı Satışları
                </span>
                <p className="text-2xl font-bold text-indigo-300 mt-1">
                  ₺{totalCreditCardSales.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">POS Cihazı Toplamı</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-amber-400" />
                  Cihaz Alım Ödemesi
                </span>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  ₺{totalPurchases.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">2. El Cihaz Girişi</span>
              </div>
            </div>

            {/* Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={transactionTypeFilter === "all" ? "default" : "outline"}
                  onClick={() => setTransactionTypeFilter("all")}
                  className={transactionTypeFilter === "all" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-300"}
                >
                  Tüm İşlemler ({initialTransactions.length})
                </Button>
                <Button
                  size="sm"
                  variant={transactionTypeFilter === "sale" ? "default" : "outline"}
                  onClick={() => setTransactionTypeFilter("sale")}
                  className={transactionTypeFilter === "sale" ? "bg-emerald-600 text-white" : "border-slate-800 text-slate-300"}
                >
                  Satışlar
                </Button>
                <Button
                  size="sm"
                  variant={transactionTypeFilter === "purchase" ? "default" : "outline"}
                  onClick={() => setTransactionTypeFilter("purchase")}
                  className={transactionTypeFilter === "purchase" ? "bg-amber-600 text-white" : "border-slate-800 text-slate-300"}
                >
                  2. El Alışlar
                </Button>
              </div>

              <div className="text-xs text-slate-400 font-mono">
                Tablolar: <span className="text-cyan-400">transactions</span> & <span className="text-cyan-400">transaction_items</span>
              </div>
            </div>

            {/* Transactions Table */}
            <Card className="bg-slate-900/70 border-slate-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-950/50">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-300 font-semibold">İşlem / Fiş No</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Müşteri</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Tür</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Ödeme Yöntemi</TableHead>
                    <TableHead className="text-slate-300 font-semibold text-center">Kalem</TableHead>
                    <TableHead className="text-slate-300 font-semibold text-right">Net Tutar</TableHead>
                    <TableHead className="text-slate-300 font-semibold text-center">Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((trx) => (
                    <TableRow key={trx.id} className="border-slate-800/60 hover:bg-slate-800/30">
                      <TableCell className="font-mono text-xs font-semibold text-cyan-300">
                        {trx.transaction_number}
                        <div className="text-[10px] text-slate-500 font-sans mt-0.5">{trx.notes}</div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-200">
                        {trx.customerName}
                      </TableCell>
                      <TableCell>
                        {trx.type === "sale" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Satış
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            2. El Alış
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-xs font-medium text-slate-300 flex items-center gap-1.5">
                          {trx.payment_method === "cash" && <Banknote className="w-3.5 h-3.5 text-emerald-400" />}
                          {trx.payment_method === "credit_card" && <CreditCard className="w-3.5 h-3.5 text-indigo-400" />}
                          {trx.payment_method === "bank_transfer" && <ArrowDownLeft className="w-3.5 h-3.5 text-amber-400" />}
                          {trx.payment_method === "cash" ? "Nakit" : trx.payment_method === "credit_card" ? "Kredi Kartı" : "Havale / EFT"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-slate-400">
                        {trx.itemCount} Ürün
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-slate-100">
                        ₺{trx.net_amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-900/30 text-emerald-300 border border-emerald-800/50 text-[11px]">
                          Tamamlandı
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* TAB 3: CUSTOMERS & BALANCE (Day 4) */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <Input
                  placeholder="Müşteri adı, telefon (05XX) veya T.C. Kimlik No ile ara..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-9 bg-slate-950/70 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 py-1.5 px-3">
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  Kayıtlı Müşteri: {initialCustomers.length}
                </Badge>
              </div>
            </div>

            {/* Customers Table */}
            <Card className="bg-slate-900/70 border-slate-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-950/50">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-300 font-semibold">Müşteri Adı</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Telefon & İletişim</TableHead>
                    <TableHead className="text-slate-300 font-semibold">T.C. Kimlik / Pasaport</TableHead>
                    <TableHead className="text-slate-300 font-semibold">Adres</TableHead>
                    <TableHead className="text-slate-300 font-semibold text-right">Cari Bakiye</TableHead>
                    <TableHead className="text-slate-300 font-semibold text-center">Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((cust) => (
                    <TableRow key={cust.id} className="border-slate-800/60 hover:bg-slate-800/30">
                      <TableCell className="font-semibold text-slate-100">
                        {cust.full_name}
                        {cust.notes && <div className="text-[11px] text-slate-400 font-normal">{cust.notes}</div>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-300">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {cust.phone}
                        </div>
                        <div className="text-[11px] text-slate-400">{cust.email}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-300">
                        {cust.identity_number || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {cust.address || "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {cust.balance < 0 ? (
                          <span className="text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded border border-rose-800/50 text-xs">
                            -₺{Math.abs(cust.balance).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} (Borçlu)
                          </span>
                        ) : cust.balance > 0 ? (
                          <span className="text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/50 text-xs">
                            +₺{cust.balance.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} (Avans)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">₺0,00</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                          Aktif
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* TAB 4: SUPABASE SQL SCRIPTS */}
        {activeTab === "schema" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Supabase SQL Editör Dosyaları</h2>
                <p className="text-xs text-slate-400">
                  Dosyalar <code className="text-cyan-400 font-mono">supabase/</code> dizininde yer almaktadır.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedSqlTab === "03" ? "default" : "outline"}
                  onClick={() => setSelectedSqlTab("03")}
                  className={selectedSqlTab === "03" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-300"}
                >
                  03_customers_and_transactions.sql (Day 4)
                </Button>
                <Button
                  size="sm"
                  variant={selectedSqlTab === "02" ? "default" : "outline"}
                  onClick={() => setSelectedSqlTab("02")}
                  className={selectedSqlTab === "02" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-300"}
                >
                  02_categories_and_products.sql
                </Button>
                <Button
                  size="sm"
                  variant={selectedSqlTab === "01" ? "default" : "outline"}
                  onClick={() => setSelectedSqlTab("01")}
                  className={selectedSqlTab === "01" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-300"}
                >
                  01_users_and_roles.sql
                </Button>
              </div>
            </div>

            <Card className="bg-slate-900/80 border-slate-800">
              <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-200">
                    {selectedSqlTab === "03" && "supabase/03_customers_and_transactions.sql (Müşteri, Kasa & Kalemler)"}
                    {selectedSqlTab === "02" && "supabase/02_categories_and_products.sql (15 Haneli IMEI & Ürünler)"}
                    {selectedSqlTab === "01" && "supabase/01_users_and_roles.sql (Roller & Kullanıcı Profilleri)"}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    {selectedSqlTab === "03" && "Day 4: Müşteri veritabanı, Kasa hareketleri, İşlem detayları ve RLS politikaları"}
                    {selectedSqlTab === "02" && "Day 3: Telefon, Aksesuar, Parça şeması ve UNIQUE IMEI indeksleri"}
                    {selectedSqlTab === "01" && "Day 2: Admin/Personel rolleri, profiles ve auth.users tetikleyicisi"}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const code = selectedSqlTab === "03" ? sqlCodeCustomersTransactions : selectedSqlTab === "02" ? sqlCodeProductsCategories : sqlCodeUsersRoles
                    copyToClipboard(code, `sql_${selectedSqlTab}`)
                  }}
                  className="text-xs border-slate-700 bg-slate-950 text-slate-300"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {copiedText === `sql_${selectedSqlTab}` ? "Kopyalandı!" : "SQL Kopyala"}
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-4 rounded-lg overflow-x-auto max-h-[500px] border border-slate-800/60 leading-relaxed">
                  {selectedSqlTab === "03" && sqlCodeCustomersTransactions}
                  {selectedSqlTab === "02" && sqlCodeProductsCategories}
                  {selectedSqlTab === "01" && sqlCodeUsersRoles}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 5: TYPESCRIPT INTERFACES */}
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
                      Supabase tabloları ve şemasıyla %100 uyumlu strongly-typed TypeScript modelleri
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-cyan-500/30 text-cyan-400">
                    Day 4 Genişletildi
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                    <h4 className="text-xs font-semibold text-cyan-400 mb-2 font-mono">Customer & Transaction Modelleri (Day 4)</h4>
                    <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`export interface Customer {
  id: string
  full_name: string
  phone: string
  email: string | null
  identity_number: string | null
  address: string | null
  balance: number // Cari bakiye
  is_active: boolean
}

export interface Transaction {
  id: string
  transaction_number: string
  customer_id: string | null
  type: 'sale' | 'purchase' | 'return' | 'repair_payment'
  payment_method: 'cash' | 'credit_card' | 'bank_transfer' | 'on_account'
  total_amount: number
  discount_amount: number
  net_amount: number
  paid_amount: number
  status: 'completed' | 'pending' | 'cancelled'
}`}
                    </pre>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-950 border border-slate-800">
                    <h4 className="text-xs font-semibold text-emerald-400 mb-2 font-mono">Product & IMEI Modeli</h4>
                    <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`export interface Product {
  id: string
  category_id: string
  name: string
  brand: string
  imei: string | null // 15 haneli benzersiz IMEI
  condition: 'sıfır' | 'ikinci el'
  purchase_price: number
  sale_price: number
  stock_quantity: number
  min_stock_level: number
  is_active: boolean
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 6: SSR CONFIG */}
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
