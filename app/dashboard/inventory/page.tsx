"use client"

import React, { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { 
  Package, 
  Search, 
  Plus, 
  AlertCircle, 
  FolderTree,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  SlidersHorizontal,
  Copy,
  Check,
  Eye,
  Smartphone,
  BatteryCharging,
  Tag,
  Boxes,
  X,
  TrendingUp,
  MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  InventoryItem, 
  StockStatusType, 
  SortField, 
  SortOrder, 
  calculateStockStatus 
} from "@/types/inventory"
import { createClient } from "@/utils/supabase/client"
import { CustomImage } from "@/components/ui/custom-image"

interface InventoryDbClient {
  from(table: string): {
    select(query?: string): {
      order(column: string, options?: { ascending: boolean }): Promise<{
        data: Array<{
          id: string
          name: string
          brand: string
          model: string | null
          category_id: string
          barcode: string | null
          imei: string | null
          condition: "sıfır" | "ikinci el"
          battery_health?: number | null
          cosmetic_condition?: string | null
          storage?: string | null
          color?: string | null
          purchase_price: number
          sale_price: number
          stock_quantity: number
          min_stock_level: number
          description: string | null
          image_url?: string | null
          created_at: string
        }> | null
        error: unknown
      }>
    }
  }
}

// Zengin Örnek Envanter Veri Kümesi (Telefonlar, Aksesuarlar ve Yedek Parçalar)
const initialInventoryProducts: InventoryItem[] = [
  {
    id: "prod-1",
    name: "Apple iPhone 15 Pro 256GB Doğal Titanyum",
    brand: "Apple",
    model: "iPhone 15 Pro (A3102)",
    category: "Telefon",
    imei: "354892091234567",
    barcode: "195949038241",
    condition: "sıfır",
    battery_health: 100,
    cosmetic_condition: "Sıfır (Kutulu Jelatinli)",
    storage: "256 GB",
    color: "Doğal Titanyum",
    sale_price: 76999,
    purchase_price: 66500,
    stock_quantity: 1,
    min_stock_level: 1,
    shelf_location: "Kasa Arkası Çelik Kasa A-1",
    description: "Apple Türkiye 2 Yıl Resmi Distribütör Garantili, Orijinal Kutu",
    image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
    is_active: true,
    created_at: "2026-10-01T10:00:00.000Z"
  },
  {
    id: "prod-2",
    name: "Samsung Galaxy S23 Ultra 512GB Phantom Black",
    brand: "Samsung",
    model: "Galaxy S23 Ultra (SM-S918B)",
    category: "Telefon",
    imei: "359876098765432",
    barcode: "8806094772814",
    condition: "ikinci el",
    battery_health: 93,
    cosmetic_condition: "A+ (Kusursuz / Sıfır Ayarında)",
    storage: "512 GB",
    color: "Gece Yarısı",
    sale_price: 43500,
    purchase_price: 34500,
    stock_quantity: 1,
    min_stock_level: 1,
    shelf_location: "İkinci El Teşhir Vitrini B-2",
    description: "Kılcal çiziksiz, kasada ezik yok, S-Pen eksiksiz, 6 ay servis garantili",
    image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
    is_active: true,
    created_at: "2026-10-01T11:30:00.000Z"
  },
  {
    id: "prod-3",
    name: "Apple iPhone 13 128GB Gece Yarısı",
    brand: "Apple",
    model: "iPhone 13 (A2633)",
    category: "Telefon",
    imei: "358742084920193",
    barcode: "194252707241",
    condition: "ikinci el",
    battery_health: 86,
    cosmetic_condition: "A (Çok Temiz / Mikro Kılcal)",
    storage: "128 GB",
    color: "Gece Yarısı",
    sale_price: 28900,
    purchase_price: 22500,
    stock_quantity: 1,
    min_stock_level: 1,
    shelf_location: "İkinci El Vitrin A-3",
    description: "Kutulu, faturalı, TrueTone ve FaceID sorunsuz",
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
    is_active: true,
    created_at: "2026-09-30T14:20:00.000Z"
  },
  {
    id: "prod-4",
    name: "Xiaomi Redmi Note 13 Pro 5G 256GB",
    brand: "Xiaomi",
    model: "Redmi Note 13 Pro",
    category: "Telefon",
    imei: "867543021984210",
    barcode: "6941812753218",
    condition: "sıfır",
    battery_health: 100,
    cosmetic_condition: "Sıfır (Kutulu Jelatinli)",
    storage: "256 GB",
    color: "Buz Mavisi",
    sale_price: 17200,
    purchase_price: 13500,
    stock_quantity: 4,
    min_stock_level: 2,
    shelf_location: "Giriş Seviye Cihaz Standı",
    description: "Genpa Garantili, 67W Turbo Şarj Adaptörü Kutuda",
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    is_active: true,
    created_at: "2026-09-29T09:15:00.000Z"
  },
  {
    id: "prod-5",
    name: "Apple 20W USB-C Hızlı Güç Adaptörü",
    brand: "Apple",
    model: "MHJE3TU/A",
    category: "Aksesuar",
    imei: null,
    barcode: "194252157015",
    condition: "sıfır",
    sale_price: 849,
    purchase_price: 520,
    stock_quantity: 38,
    min_stock_level: 8,
    shelf_location: "Kasa Arkası Çekmece 1",
    description: "Orijinal Apple Türkiye Distribütör bandrollü kutu",
    image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
    is_active: true,
    created_at: "2026-09-28T16:00:00.000Z"
  },
  {
    id: "prod-6",
    name: "Spigen iPhone 15 Pro MagSafe Ultra Hybrid Kılıf",
    brand: "Spigen",
    model: "ACS06712",
    category: "Aksesuar",
    imei: null,
    barcode: "8809897103284",
    condition: "sıfır",
    sale_price: 749,
    purchase_price: 340,
    stock_quantity: 22,
    min_stock_level: 5,
    shelf_location: "Kılıf Standı Askı 4",
    description: "Air Cushion Teknolojili Darbe Emici Şeffaf Kılıf",
    image_url: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=600&q=80",
    is_active: true,
    created_at: "2026-09-27T11:45:00.000Z"
  },
  {
    id: "prod-7",
    name: "Baseus Tungsten Gold 100W Type-C Hızlı Şarj Kablosu",
    brand: "Baseus",
    model: "CAWJK-01",
    category: "Aksesuar",
    imei: null,
    barcode: "6953156201842",
    condition: "sıfır",
    sale_price: 390,
    purchase_price: 180,
    stock_quantity: 3,
    min_stock_level: 5,
    shelf_location: "Kablo Standı B-1",
    description: "Örgülü yıpranmaz kablo, 5A E-Marker çip destekli",
    image_url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80",
    is_active: true,
    created_at: "2026-09-26T13:10:00.000Z"
  },
  {
    id: "prod-8",
    name: "Anker Soundcore R50i TWS Bluetooth Kulaklık",
    brand: "Anker",
    model: "A3949",
    category: "Aksesuar",
    imei: null,
    barcode: "194644140298",
    condition: "sıfır",
    sale_price: 1199,
    purchase_price: 720,
    stock_quantity: 0,
    min_stock_level: 3,
    shelf_location: "Kulaklık Vitrini C-2",
    description: "10mm sürücüler, 30 saat pil ömrü, AI gürültü engelleme",
    image_url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80",
    is_active: true,
    created_at: "2026-09-25T15:30:00.000Z"
  },
  {
    id: "prod-9",
    name: "iPhone 11 GX OLED Ekran Paneli (Montaj Uyumlu)",
    brand: "GX",
    model: "GX-IP11-OLED",
    category: "Yedek Parça",
    imei: null,
    barcode: "8690192837465",
    condition: "sıfır",
    sale_price: 2450,
    purchase_price: 1600,
    stock_quantity: 2,
    min_stock_level: 3,
    shelf_location: "Teknik Servis Çekmece 4",
    description: "True Tone ve 3D Touch destekli A+ Revize Ekran",
    image_url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
    is_active: true,
    created_at: "2026-09-24T10:00:00.000Z"
  },
  {
    id: "prod-10",
    name: "iPhone 12 Deji Mucize Batarya 3210mAh (Yüksek Kapasite)",
    brand: "Deji",
    model: "IP12-DEJI-PLUS",
    category: "Yedek Parça",
    imei: null,
    barcode: "8682145601248",
    condition: "sıfır",
    sale_price: 1250,
    purchase_price: 550,
    stock_quantity: 14,
    min_stock_level: 4,
    shelf_location: "Servis Rafı Bataryalar C-1",
    description: "%30 daha uzun kullanım süresi, montaj bandı kutuda",
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    is_active: true,
    created_at: "2026-09-23T12:00:00.000Z"
  },
  {
    id: "prod-11",
    name: "Samsung Galaxy S21 Orijinal Type-C Şarj Soket Kartı",
    brand: "Samsung",
    model: "GH96-14025A",
    category: "Yedek Parça",
    imei: null,
    barcode: "8694412098412",
    condition: "sıfır",
    sale_price: 890,
    purchase_price: 380,
    stock_quantity: 1,
    min_stock_level: 2,
    shelf_location: "Soket Çekmecesi B-2",
    description: "Mikrofon ve hızlı şarj entegreli orijinal servis yedek parçası",
    is_active: true,
    created_at: "2026-09-22T17:15:00.000Z"
  },
  {
    id: "prod-12",
    name: "9H Temperli Seramik Kırılmaz Cam (10'lu Paket)",
    brand: "Spigen",
    model: "IP15-GLASS-10X",
    category: "Aksesuar",
    imei: null,
    barcode: "8695501928371",
    condition: "sıfır",
    sale_price: 650,
    purchase_price: 240,
    stock_quantity: 18,
    min_stock_level: 5,
    shelf_location: "Kılıf Standı Alt Kutu",
    description: "Parmak izi bırakmayan mat seramik kaplama",
    is_active: true,
    created_at: "2026-09-21T08:30:00.000Z"
  }
]

export default function InventoryDashboardPage() {
  const supabase = createClient()
  const db = supabase as unknown as InventoryDbClient

  const [products, setProducts] = useState<InventoryItem[]>(initialInventoryProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStockStatus, setSelectedStockStatus] = useState<StockStatusType>("all")
  const [selectedCondition, setSelectedCondition] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  
  // Sayfalama (Pagination) Durumları
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  // Seçili Ürün Detay Modalı (Modal/Drawer state)
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<InventoryItem | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Supabase'den canlı ürünleri çekip mock veriyle harmanla
  useEffect(() => {
    async function loadProductsFromSupabase() {
      try {
        const { data, error } = await db
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })

        if (data && Array.isArray(data) && data.length > 0 && !error) {
          const mapped: InventoryItem[] = data.map((p) => {
            const isPhone = p.imei !== null && p.imei.length === 15
            const catName = isPhone 
              ? "Telefon" 
              : p.description?.includes("Parça") 
                ? "Yedek Parça" 
                : "Aksesuar"

            return {
              id: p.id,
              name: p.name,
              brand: p.brand,
              model: p.model,
              category: catName,
              category_id: p.category_id,
              barcode: p.barcode,
              imei: p.imei,
              condition: p.condition || "sıfır",
              battery_health: p.battery_health,
              cosmetic_condition: p.cosmetic_condition,
              storage: p.storage,
              color: p.color,
              purchase_price: p.purchase_price,
              sale_price: p.sale_price,
              stock_quantity: p.stock_quantity,
              min_stock_level: p.min_stock_level,
              shelf_location: null,
              description: p.description,
              image_url: p.image_url || null,
              is_active: true,
              created_at: p.created_at
            }
          })

          // Var olan ilk mock listesi ile Supabase'den gelenleri birleştir (id çakışmasını engelle)
          setProducts((prev) => {
            const existingIds = new Set(mapped.map(m => m.id))
            const rest = prev.filter(p => !existingIds.has(p.id))
            return [...mapped, ...rest]
          })
        }
      } catch {
        // Fallback initial list
      }
    }

    loadProductsFromSupabase()
  }, [db])

  // Arama veya Filtreler Değiştiğinde Sayfayı 1'e Sıfırla
  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleCategoryFilter = (cat: string) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
  }

  const handleStockFilter = (status: StockStatusType) => {
    setSelectedStockStatus(status)
    setCurrentPage(1)
  }

  const handleConditionFilter = (cond: string) => {
    setSelectedCondition(cond)
    setCurrentPage(1)
  }

  // Sıralama Değiştirme
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  // Panoya Kopyalama (IMEI veya Barkod)
  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  // Dinamik Filtreleme ve Arama Mantığı
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Arama Metni
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        (p.model && p.model.toLowerCase().includes(query)) ||
        (p.imei && p.imei.includes(query)) ||
        (p.barcode && p.barcode.includes(query)) ||
        (p.shelf_location && p.shelf_location.toLowerCase().includes(query))

      // 2. Kategori Filtresi
      const matchesCategory =
        selectedCategory === "all" || p.category === selectedCategory

      // 3. Stok Durumu Filtresi
      const status = calculateStockStatus(p.stock_quantity, p.min_stock_level)
      const matchesStock =
        selectedStockStatus === "all" || status === selectedStockStatus

      // 4. Kondisyon Filtresi
      const matchesCondition =
        selectedCondition === "all" || p.condition === selectedCondition

      return matchesSearch && matchesCategory && matchesStock && matchesCondition
    })
  }, [products, searchQuery, selectedCategory, selectedStockStatus, selectedCondition])

  // Sıralama Uygulama
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      let comparison = 0
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name, "tr")
      } else if (sortField === "sale_price") {
        comparison = a.sale_price - b.sale_price
      } else if (sortField === "stock_quantity") {
        comparison = a.stock_quantity - b.stock_quantity
      } else if (sortField === "created_at") {
        comparison = new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime()
      }
      return sortOrder === "asc" ? comparison : -comparison
    })
  }, [filteredProducts, sortField, sortOrder])

  // Sayfalama (Pagination) Hesaplamaları
  const totalItems = sortedProducts.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex)

  // Canlı Dinamik KPI İstatistikleri (Tüm Envanter Üzerinden)
  const kpiStats = useMemo(() => {
    let totalSaleValue = 0
    let totalPurchaseCost = 0
    let registeredImeiCount = 0
    let criticalStockCount = 0
    let outOfStockCount = 0

    products.forEach((p) => {
      totalSaleValue += p.sale_price * p.stock_quantity
      totalPurchaseCost += p.purchase_price * p.stock_quantity
      if (p.imei) registeredImeiCount++
      if (p.stock_quantity === 0) outOfStockCount++
      else if (p.stock_quantity <= p.min_stock_level) criticalStockCount++
    })

    return {
      totalVarieties: products.length,
      registeredImeiCount,
      criticalStockCount,
      outOfStockCount,
      totalSaleValue,
      totalPurchaseCost,
      potentialProfit: totalSaleValue - totalPurchaseCost
    }
  }, [products])

  return (
    <div className="space-y-6 pb-12">
      {/* Sayfa Başlığı ve Hızlı İşlem Düğmeleri */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-cyan-400" />
            Ürün Envanteri & Stok Takip Tablosu
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Telefonlar (15 Haneli IMEI), aksesuarlar ve yedek parçalar için gelişmiş filtreleme ve sayfalama.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/dashboard/purchases/new">
            <Button variant="outline" size="sm" className="border-emerald-800/60 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 hover:text-white text-xs h-9 gap-1.5 shadow-sm">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              2. El Cihaz Satın Al
            </Button>
          </Link>
          <Link href="/dashboard/inventory/categories">
            <Button variant="outline" size="sm" className="border-purple-800/60 bg-purple-950/30 text-purple-300 hover:bg-purple-900/40 hover:text-white text-xs h-9 gap-1.5 shadow-sm">
              <FolderTree className="w-3.5 h-3.5 text-purple-400" />
              Kategori & Markalar
            </Button>
          </Link>
          <Link href="/dashboard/inventory/new">
            <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium gap-1.5 shadow-md shadow-cyan-600/20 text-xs h-9">
              <Plus className="w-4 h-4" />
              Yeni Ürün & Cihaz Ekle
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Kartları (Dinamik Özet İstatistikler) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Kart 1: Toplam Çeşit */}
        <Card className="bg-slate-900/60 border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <CardHeader className="pb-1">
            <CardDescription className="text-xs flex items-center gap-1 text-slate-400">
              <Boxes className="w-3.5 h-3.5 text-cyan-400" />
              Toplam Çeşit
            </CardDescription>
            <CardTitle className="text-xl font-bold text-white">
              {kpiStats.totalVarieties} Model
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400">
            {filteredProducts.length !== kpiStats.totalVarieties ? (
              <span className="text-cyan-400">Filtrelenen: {filteredProducts.length} Ürün</span>
            ) : (
              <span>Aktif Mağaza Envanteri</span>
            )}
          </CardContent>
        </Card>

        {/* Kart 2: Kayıtlı IMEI Cihazlar */}
        <Card className="bg-slate-900/60 border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <CardHeader className="pb-1">
            <CardDescription className="text-xs flex items-center gap-1 text-slate-400">
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              Kayıtlı IMEI Adedi
            </CardDescription>
            <CardTitle className="text-xl font-bold text-purple-300">
              {kpiStats.registeredImeiCount} Cihaz
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400">
            Tekil IMEI Takipli Telefonlar
          </CardContent>
        </Card>

        {/* Kart 3: Kritik & Tükenen Stok */}
        <Card className="bg-slate-900/60 border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <CardHeader className="pb-1">
            <CardDescription className="text-xs flex items-center gap-1 text-slate-400">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Kritik Stok Uyarısı
            </CardDescription>
            <CardTitle className="text-xl font-bold text-amber-400">
              {kpiStats.criticalStockCount} Ürün
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1.5">
            {kpiStats.outOfStockCount > 0 && (
              <span className="text-rose-400 font-semibold">• {kpiStats.outOfStockCount} Stokta Yok</span>
            )}
            <span>Eşik Seviyesinin Altında</span>
          </CardContent>
        </Card>

        {/* Kart 4: Toplam Stok Değeri */}
        <Card className="bg-slate-900/60 border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <CardHeader className="pb-1">
            <CardDescription className="text-xs flex items-center gap-1 text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Toplam Envanter Değeri
            </CardDescription>
            <CardTitle className="text-xl font-bold text-emerald-400 font-mono">
              ₺{kpiStats.totalSaleValue.toLocaleString("tr-TR")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-emerald-400/80 font-mono">
            Beklenen Kar: +₺{kpiStats.potentialProfit.toLocaleString("tr-TR")}
          </CardContent>
        </Card>

      </div>

      {/* GELİŞMİŞ FİLTRELEME & ARAMA PANELİ */}
      <Card className="bg-slate-900/80 border-slate-800 shadow-md">
        <CardContent className="p-4 space-y-3.5">
          
          {/* Üst Sıra: Arama Çubuğu + Sıralama Menüsü */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            
            {/* Arama Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder="Ürün adı, marka, model, barkod veya 15 haneli IMEI no ile ara..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-8 bg-slate-950 border-slate-800 text-xs h-10 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sıralama & Sayfa Boyutu */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
              
              {/* Sıralama Seçici */}
              <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-md px-2.5 h-10">
                <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Sırala:</span>
                <select
                  value={sortField}
                  onChange={(e) => {
                    setSortField(e.target.value as SortField)
                    setCurrentPage(1)
                  }}
                  className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
                >
                  <option value="created_at" className="bg-slate-900">En Yeniler</option>
                  <option value="sale_price" className="bg-slate-900">Fiyat</option>
                  <option value="stock_quantity" className="bg-slate-900">Stok Adedi</option>
                  <option value="name" className="bg-slate-900">Ürün Adı (A-Z)</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-1.5 py-0.5 rounded text-[11px] font-bold text-cyan-300 hover:bg-slate-800"
                  title="Sıralama Yönünü Değiştir"
                >
                  {sortOrder === "asc" ? "↑ Artan" : "↓ Azalan"}
                </button>
              </div>

              {/* Sayfa Boyutu */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-md px-2.5 h-10">
                <span>Göster:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value={5} className="bg-slate-900">5</option>
                  <option value={10} className="bg-slate-900">10</option>
                  <option value={20} className="bg-slate-900">20</option>
                </select>
              </div>

            </div>

          </div>

          {/* Alt Sıra: Filtre Hapları (Kategori + Stok Durumu + Kondisyon) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
            
            {/* Kategori Filtresi */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-cyan-400" /> Kategori:
              </span>
              {[
                { id: "all", label: "Tümü" },
                { id: "Telefon", label: "📱 Telefonlar" },
                { id: "Aksesuar", label: "🔌 Aksesuar" },
                { id: "Yedek Parça", label: "🔧 Yedek Parça" }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryFilter(cat.id)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-cyan-600 text-white font-medium shadow-sm"
                      : "bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Stok Durumu Filtresi */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-amber-400" /> Stok Durumu:
              </span>
              {[
                { id: "all", label: "Tümü" },
                { id: "in_stock", label: "🟢 Stokta Var" },
                { id: "critical", label: "⚠️ Kritik Stok" },
                { id: "out_of_stock", label: "🔴 Tükendi" }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStockFilter(st.id as StockStatusType)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    selectedStockStatus === st.id
                      ? "bg-amber-600 text-white font-medium shadow-sm"
                      : "bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Kondisyon Filtresi */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400 mr-1">Kondisyon:</span>
              {[
                { id: "all", label: "Tümü" },
                { id: "sıfır", label: "Sıfır" },
                { id: "ikinci el", label: "İkinci El" }
              ].map((co) => (
                <button
                  key={co.id}
                  type="button"
                  onClick={() => handleConditionFilter(co.id)}
                  className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                    selectedCondition === co.id
                      ? "bg-purple-600 text-white font-medium"
                      : "bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {co.label}
                </button>
              ))}

              {/* Filtreleri Sıfırla Düğmesi */}
              {(selectedCategory !== "all" || selectedStockStatus !== "all" || selectedCondition !== "all" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all")
                    setSelectedStockStatus("all")
                    setSelectedCondition("all")
                    setSearchQuery("")
                    setCurrentPage(1)
                  }}
                  className="text-[11px] px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/60 transition-colors ml-1"
                >
                  ✕ Sıfırla
                </button>
              )}
            </div>

          </div>

        </CardContent>
      </Card>

      {/* DATA TABLE ALANI (Shadcn Table) */}
      <Card className="bg-slate-900/70 border-slate-800 shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-950/80">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs text-slate-300 font-semibold cursor-pointer" onClick={() => toggleSort("name")}>
                    <div className="flex items-center gap-1">
                      <span>Ürün Adı & Model</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </TableHead>
                  <TableHead className="text-xs text-slate-300 font-semibold">Kategori</TableHead>
                  <TableHead className="text-xs text-slate-300 font-semibold">Tanımlayıcı (IMEI / Barkod)</TableHead>
                  <TableHead className="text-xs text-slate-300 font-semibold text-center">Durum / Donanım</TableHead>
                  <TableHead className="text-xs text-slate-300 font-semibold text-right cursor-pointer" onClick={() => toggleSort("sale_price")}>
                    <div className="flex items-center justify-end gap-1">
                      <span>Alış / Satış Fiyatı</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </TableHead>
                  <TableHead className="text-xs text-slate-300 font-semibold text-center cursor-pointer" onClick={() => toggleSort("stock_quantity")}>
                    <div className="flex items-center justify-center gap-1">
                      <span>Stok Durumu</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </TableHead>
                  <TableHead className="text-xs text-slate-300 font-semibold text-center">İşlem</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => {
                    const stockStatus = calculateStockStatus(product.stock_quantity, product.min_stock_level)
                    const isPhone = product.imei !== null && product.imei.length === 15
                    const profit = product.sale_price - product.purchase_price
                    const margin = product.purchase_price > 0 ? Math.round((profit / product.purchase_price) * 100) : 0

                    return (
                      <TableRow key={product.id} className="border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                        
                        {/* 1. Ürün Görseli, Adı & Marka */}
                        <TableCell className="max-w-[320px]">
                          <div className="flex items-center gap-3">
                            <div
                              onClick={() => setSelectedProductForDetail(product)}
                              className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80 flex-shrink-0 flex items-center justify-center cursor-pointer group/img hover:border-cyan-500 transition-colors"
                              title="Detay & Görseli İncele"
                            >
                              {product.image_url ? (
                                <CustomImage
                                  src={product.image_url}
                                  alt={product.name}
                                  fill
                                  sizes="40px"
                                  className="object-contain p-0.5 group-hover/img:scale-110 transition-transform duration-200"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900/50">
                                  {isPhone ? <Smartphone className="w-5 h-5 text-slate-500" /> : <Package className="w-5 h-5 text-slate-500" />}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div
                                onClick={() => setSelectedProductForDetail(product)}
                                className="font-semibold text-xs text-white line-clamp-1 hover:text-cyan-400 cursor-pointer transition-colors"
                              >
                                {product.name}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span className="text-slate-300 font-medium">{product.brand}</span>
                                {product.model && <span className="truncate max-w-[130px]">• {product.model}</span>}
                                {product.storage && (
                                  <span className="text-purple-300 font-mono">• {product.storage}</span>
                                )}
                                {product.color && (
                                  <span className="text-slate-400">• {product.color}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* 2. Kategori */}
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] font-medium border ${
                            product.category === "Telefon"
                              ? "bg-purple-950/60 border-purple-700/60 text-purple-300"
                              : product.category === "Yedek Parça"
                                ? "bg-amber-950/60 border-amber-700/60 text-amber-300"
                                : "bg-cyan-950/60 border-cyan-700/60 text-cyan-300"
                          }`}>
                            {product.category}
                          </Badge>
                        </TableCell>

                        {/* 3. Tanımlayıcı: IMEI veya Barkod */}
                        <TableCell>
                          {isPhone ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded tracking-wide">
                                {product.imei}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(product.imei || "", product.id)}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="IMEI Numarasını Kopyala"
                              >
                                {copiedId === product.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-slate-300 bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded">
                                {product.barcode || "Barkodsuz"}
                              </span>
                              {product.barcode && (
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(product.barcode || "", product.id)}
                                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                  title="Barkodu Kopyala"
                                >
                                  {copiedId === product.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </TableCell>

                        {/* 4. Durum & Donanım Özellikleri */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge className={`text-[10px] border-none ${
                              product.condition === "sıfır"
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-amber-500/15 text-amber-300"
                            }`}>
                              {product.condition === "sıfır" ? "Sıfır" : "İkinci El"}
                            </Badge>

                            {/* Telefon ise Batarya Sağlığı ve Kozmetik */}
                            {isPhone && product.battery_health && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-300">
                                <BatteryCharging className={`w-3 h-3 ${
                                  product.battery_health >= 90 ? "text-emerald-400" : "text-amber-400"
                                }`} />
                                <span>%{product.battery_health}</span>
                                {product.cosmetic_condition && (
                                  <span className="text-cyan-400 font-semibold">• {product.cosmetic_condition.split(" ")[0]}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* 5. Alış / Satış Fiyatı & Kar Marjı */}
                        <TableCell className="text-right">
                          <div className="font-mono text-xs font-bold text-emerald-400">
                            ₺{product.sale_price.toLocaleString("tr-TR")}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-end gap-1">
                            <span>Alış: ₺{product.purchase_price.toLocaleString("tr-TR")}</span>
                            <span className="text-[10px] text-cyan-400/90 font-semibold">
                              (+%{margin})
                            </span>
                          </div>
                        </TableCell>

                        {/* 6. Stok Seviyesi & Durum Rozeti */}
                        <TableCell className="text-center">
                          {isPhone ? (
                            <div className="inline-flex flex-col items-center">
                              <Badge className="bg-cyan-950 border-cyan-800 text-cyan-300 text-[10px] font-mono">
                                1 Cihaz (IMEI)
                              </Badge>
                              <span className="text-[10px] text-emerald-400 mt-0.5">Stokta Mevcut</span>
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                                stockStatus === "out_of_stock"
                                  ? "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                                  : stockStatus === "critical"
                                    ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                                    : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                              }`}>
                                {product.stock_quantity} Adet
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                {stockStatus === "out_of_stock" ? (
                                  <span className="text-rose-400">Tükendi</span>
                                ) : stockStatus === "critical" ? (
                                  <span className="text-amber-400">Kritik Eşik (Min: {product.min_stock_level})</span>
                                ) : (
                                  <span>Yeterli</span>
                                )}
                              </span>
                            </div>
                          )}
                        </TableCell>

                        {/* 7. İşlem / Detay Butonu */}
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProductForDetail(product)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Ürün Detayını İncele"
                          >
                            <Eye className="w-4 h-4 text-cyan-400" />
                          </Button>
                        </TableCell>

                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-44 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <AlertCircle className="w-8 h-8 text-slate-500" />
                        <div className="text-sm font-semibold text-slate-300">
                          Arama kriterlerine uygun ürün bulunamadı.
                        </div>
                        <p className="text-xs text-slate-500 max-w-sm">
                          Farklı bir arama terimi deneyin veya kategori/stok durumu filtrelerini sıfırlayın.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCategory("all")
                            setSelectedStockStatus("all")
                            setSelectedCondition("all")
                            setSearchQuery("")
                            setCurrentPage(1)
                          }}
                          className="border-slate-800 bg-slate-900 text-xs h-8 mt-1"
                        >
                          Filtreleri Temizle
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* SAYFALAMA (PAGINATION) BARI */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Sol: Gösterilen Kayıt Bilgisi */}
            <div className="text-xs text-slate-400">
              {totalItems > 0 ? (
                <>
                  Toplam <span className="font-semibold text-white">{totalItems}</span> üründen{" "}
                  <span className="font-semibold text-cyan-400">{startIndex + 1}</span> -{" "}
                  <span className="font-semibold text-cyan-400">{endIndex}</span> arası gösteriliyor
                </>
              ) : (
                "Kayıt bulunamadı"
              )}
            </div>

            {/* Sağ: Sayfalama Düğmeleri */}
            <div className="flex items-center gap-1.5">
              
              {/* İlk Sayfa */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white disabled:opacity-40"
                title="İlk Sayfa"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>

              {/* Önceki Sayfa */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white text-xs gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Önceki</span>
              </Button>

              {/* Sayfa Numaraları */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((pageNum) => {
                    // Sayfa sayısı çok olduğunda ilk, son ve aktif sayfa civarını göster
                    return (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - currentPage) <= 1
                    )
                  })
                  .map((pageNum, idx, arr) => {
                    const prev = arr[idx - 1]
                    const showEllipsis = prev && pageNum - prev > 1

                    return (
                      <React.Fragment key={pageNum}>
                        {showEllipsis && (
                          <span className="text-slate-600 px-1 text-xs">...</span>
                        )}
                        <Button
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-8 w-8 p-0 text-xs font-semibold ${
                            currentPage === pageNum
                              ? "bg-cyan-600 text-white shadow-sm"
                              : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      </React.Fragment>
                    )
                  })}
              </div>

              {/* Sonraki Sayfa */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-8 px-2.5 border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white text-xs gap-1 disabled:opacity-40"
              >
                <span className="hidden sm:inline">Sonraki</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>

              {/* Son Sayfa */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-8 w-8 p-0 border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white disabled:opacity-40"
                title="Son Sayfa"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>

            </div>

          </div>

        </CardContent>
      </Card>

      {/* SEÇİLİ ÜRÜN DETAY MODAL DİYALOĞU (Quick View Modal) */}
      {selectedProductForDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2">
                {selectedProductForDetail.imei ? (
                  <Smartphone className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Package className="w-5 h-5 text-purple-400" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-white">Ürün Envanter Kartı</h3>
                  <p className="text-[11px] text-slate-400">ID: {selectedProductForDetail.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductForDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Ürün Görseli (Supabase Storage) */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group shadow-inner">
                {selectedProductForDetail.image_url ? (
                  <>
                    <CustomImage
                      src={selectedProductForDetail.image_url}
                      alt={selectedProductForDetail.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 500px"
                      className="object-contain p-2"
                    />
                    <div className="absolute top-2 right-2 bg-slate-900/85 backdrop-blur-sm text-[10px] text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-cyan-500/30 z-10">
                      Supabase Storage CDN
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-1.5 p-4 text-center">
                    {selectedProductForDetail.imei ? (
                      <Smartphone className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                    )}
                    <span className="text-xs text-slate-400">Ürün Görseli Bulunmuyor</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  {selectedProductForDetail.category}
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  {selectedProductForDetail.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedProductForDetail.brand} • {selectedProductForDetail.model || "Standart Model"}
                </p>
              </div>

              {/* IMEI veya Barkod Kutusu */}
              {selectedProductForDetail.imei ? (
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/50 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">15 Haneli IMEI:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedProductForDetail.imei || "", "modal-imei")}
                      className="text-cyan-300 hover:text-white flex items-center gap-1 font-mono font-bold text-xs"
                    >
                      {selectedProductForDetail.imei}
                      {copiedId === "modal-imei" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {selectedProductForDetail.battery_health && (
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-cyan-900/40">
                      <span className="text-slate-400">Batarya Sağlığı:</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        %{selectedProductForDetail.battery_health}
                      </span>
                    </div>
                  )}
                  {selectedProductForDetail.cosmetic_condition && (
                    <div className="flex justify-between items-center text-xs pt-1 border-t border-cyan-900/40">
                      <span className="text-slate-400">Kozmetik Derece:</span>
                      <span className="text-cyan-300 font-medium">
                        {selectedProductForDetail.cosmetic_condition}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">EAN-13 Barkod:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {selectedProductForDetail.barcode || "Barkodsuz"}
                  </span>
                </div>
              )}

              {/* Fiyat & Stok Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Maliyet (Alış Fiyatı)</span>
                  <span className="text-sm font-mono font-bold text-slate-200">
                    ₺{selectedProductForDetail.purchase_price.toLocaleString("tr-TR")}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Etiket (Satış Fiyatı)</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    ₺{selectedProductForDetail.sale_price.toLocaleString("tr-TR")}
                  </span>
                </div>
              </div>

              {/* Açıklama & Konum */}
              {selectedProductForDetail.description && (
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">Ürün Açıklaması / Garanti:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedProductForDetail.description}
                  </p>
                </div>
              )}

              {selectedProductForDetail.shelf_location && (
                <div className="flex items-center gap-1.5 text-xs text-amber-300">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Dükkan Konumu: {selectedProductForDetail.shelf_location}</span>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedProductForDetail(null)}
                className="border-slate-800 bg-slate-900 text-xs h-8"
              >
                Kapat
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
