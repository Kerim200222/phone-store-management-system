"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { 
  Smartphone, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Sparkles,
  Phone, 
  MapPin, 
  Clock, 
  LogIn, 
  LayoutDashboard,
  X,
  Package,
  Check,
  Headphones,
  Wrench
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { Product, Category } from "@/types/database"

interface VitrinProduct extends Omit<Product, "category_id"> {
  category_id: string
  categoryName: string
  specs?: string[]
}

const VITRIN_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Telefon",
    slug: "telefon",
    description: "Akıllı telefonlar (Sıfır ve Garantili İkinci El)",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "cat-2",
    name: "Aksesuar",
    slug: "aksesuar",
    description: "Kılıf, şarj cihazı, kulaklık ve koruyucu aksesuarlar",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "cat-3",
    name: "Yedek Parça",
    slug: "yedek-parca",
    description: "OLED ekranlar, orijinal bataryalar ve servis modülleri",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const VITRIN_PRODUCTS: VitrinProduct[] = [
  {
    id: "prod-1",
    category_id: "cat-1",
    categoryName: "Telefon",
    name: "Apple iPhone 15 Pro 128GB",
    brand: "Apple",
    model: "iPhone 15 Pro",
    barcode: "195949038241",
    imei: null,
    condition: "sıfır",
    purchase_price: 64500, // Vitrinde gizlenecek (iç maliyet)
    sale_price: 74999,
    stock_quantity: 4,
    min_stock_level: 1,
    description: "2 Yıl Apple Türkiye Yetkili Distribütör Garantili. Kapalı kutu, faturalı.",
    image_url: null,
    is_active: true,
    specs: ["128 GB Depolama", "A17 Pro Çip", "Titanyum Kasa", "48 MP Kamera"],
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
    imei: null,
    condition: "ikinci el",
    purchase_price: 34000, // Vitrinde gizlenecek
    sale_price: 42500,
    stock_quantity: 2,
    min_stock_level: 1,
    description: "Ekspertizi yapılmış, kozmetik 9.5/10. Orijinal kutusu ve faturası mevcut, 1 Yıl Mağaza Garantili.",
    image_url: null,
    is_active: true,
    specs: ["256 GB / 12 GB RAM", "200 MP Kamera", "Snapdragon 8 Gen 2", "S-Pen Kalem Dahil"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prod-3",
    category_id: "cat-1",
    categoryName: "Telefon",
    name: "Xiaomi Redmi Note 13 Pro 5G 256GB",
    brand: "Xiaomi",
    model: "Redmi Note 13 Pro",
    barcode: "6941812753218",
    imei: null,
    condition: "sıfır",
    purchase_price: 13500,
    sale_price: 17200,
    stock_quantity: 8,
    min_stock_level: 2,
    description: "Türkiye Garantili sıfır cihaz. 200MP OIS kamera ve 67W hızlı şarj desteği.",
    image_url: null,
    is_active: true,
    specs: ["256 GB / 8 GB RAM", "200 MP OIS Kamera", "120Hz AMOLED", "67W Hızlı Şarj"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prod-4",
    category_id: "cat-1",
    categoryName: "Telefon",
    name: "Apple iPhone 13 128GB (Gece Yarısı)",
    brand: "Apple",
    model: "iPhone 13",
    barcode: "194252697812",
    imei: null,
    condition: "ikinci el",
    purchase_price: 21500,
    sale_price: 28500,
    stock_quantity: 3,
    min_stock_level: 1,
    description: "%88 Batarya sağlığı, değişensiz hatasız kasa. 6 Ay Mağaza Güvencesiyle.",
    image_url: null,
    is_active: true,
    specs: ["128 GB Depolama", "A15 Bionic", "%88 Pil Sağlığı", "FaceID Aktif"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prod-5",
    category_id: "cat-2",
    categoryName: "Aksesuar",
    name: "Apple 20W USB-C Orijinal Güç Adaptörü",
    brand: "Apple",
    model: "MHJE3TU/A",
    barcode: "194252157015",
    imei: null,
    condition: "sıfır",
    purchase_price: 520,
    sale_price: 849,
    stock_quantity: 45,
    min_stock_level: 5,
    description: "Orijinal Apple Türkiye Hızlı Şarj Cihazı. Tüm iPhone ve iPad modelleriyle tam uyumlu.",
    image_url: null,
    is_active: true,
    specs: ["20 Watt Hızlı Şarj", "USB-C Çıkış", "Apple Güvenlik Sertifikalı"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prod-6",
    category_id: "cat-2",
    categoryName: "Aksesuar",
    name: "Apple AirPods Pro 2. Nesil (MagSafe USB-C)",
    brand: "Apple",
    model: "MTJV3TU/A",
    barcode: "195949052568",
    imei: null,
    condition: "sıfır",
    purchase_price: 7200,
    sale_price: 8999,
    stock_quantity: 6,
    min_stock_level: 2,
    description: "Aktif Gürültü Engelleme (ANC), Adaptif Şeffaf Mod ve USB-C şarj kutusu.",
    image_url: null,
    is_active: true,
    specs: ["Aktif Gürültü Engelleme", "H2 Kulaklık Çipi", "MagSafe USB-C Kutu", "30 Saat Pil"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prod-7",
    category_id: "cat-3",
    categoryName: "Yedek Parça",
    name: "iPhone 11 GX OLED Dokunmatik Ekran Paneli",
    brand: "Apple Uyumlu",
    model: "iPhone 11",
    barcode: "8680001122334",
    imei: null,
    condition: "sıfır",
    purchase_price: 1100,
    sale_price: 1950,
    stock_quantity: 12,
    min_stock_level: 3,
    description: "Servisimizde anında montaj yapılabilir. 1 Yıl Dokunmatik ve Renk Garantisi.",
    image_url: null,
    is_active: true,
    specs: ["TrueTone Uyumlu", "Sıfır Ölü Piksel", "Yüksek Parlaklık", "Servis Montaj Desteği"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "prod-8",
    category_id: "cat-1",
    categoryName: "Telefon",
    name: "Samsung Galaxy A54 5G 128GB",
    brand: "Samsung",
    model: "Galaxy A54",
    barcode: "8806094892406",
    imei: null,
    condition: "sıfır",
    purchase_price: 12200,
    sale_price: 15499,
    stock_quantity: 0,
    min_stock_level: 2,
    description: "Super AMOLED 120Hz ekran ve 5000mAh pil. Stoklar tükenmiştir, yakında mağazamızda.",
    image_url: null,
    is_active: true,
    specs: ["128 GB Depolama", "120Hz Super AMOLED", "50 MP OIS Kamera", "5000 mAh Batarya"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedCondition, setSelectedCondition] = useState<string>("all")
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false)
  const [selectedProduct, setSelectedProduct] = useState<VitrinProduct | null>(null)

  // Müşteri Arama ve Filtreleme Mantığı
  const filteredProducts = useMemo(() => {
    return VITRIN_PRODUCTS.filter((product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.model ? product.model.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
        (product.description ? product.description.toLowerCase().includes(searchQuery.toLowerCase()) : false)

      const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory
      const matchesCondition = selectedCondition === "all" || product.condition === selectedCondition
      const matchesStock = onlyInStock ? product.stock_quantity > 0 : true

      return matchesSearch && matchesCategory && matchesCondition && matchesStock
    })
  }, [searchQuery, selectedCategory, selectedCondition, onlyInStock])

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val)
  }

  const getProductIcon = (categoryName: string) => {
    switch (categoryName) {
      case "Aksesuar":
        return <Headphones className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform" />
      case "Yedek Parça":
        return <Wrench className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform" />
      default:
        return <Smartphone className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform" />
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* 1. ÜST MÜŞTERİ BİLGİLENDİRME BANTI */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 text-[11px] text-slate-400 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Bağdat Caddesi No:42/A Kadıköy / İstanbul
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Pzt - Cmt: 09:00 - 20:00
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Phone className="w-3 h-3" />
              (0216) 555 12 34
            </span>
            <span className="text-slate-600">|</span>
            <Link 
              href="/dashboard"
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <LayoutDashboard className="w-3 h-3" />
              Yönetim Paneli Girişi
            </Link>
          </div>
        </div>
      </div>

      {/* 2. ANA BAŞLIK & VİTRİN HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white tracking-tight">PhoneStore</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                  VİTRİN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Akıllı Telefon, Aksesuar & Teknik Servis Mağazası</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button 
                size="sm" 
                variant="outline" 
                className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold h-9 gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                Personel Girişi
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button 
                size="sm" 
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs h-9 shadow-md shadow-cyan-600/20 gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Yönetim Paneli
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. HERO GÜVENCE BANTLARI */}
      <section className="bg-gradient-to-b from-slate-900/60 to-transparent py-8 px-4 sm:px-8 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <Badge className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 px-3 py-1 text-xs">
            ✨ Güncel Mağaza Stokları & Garantili Cihazlar
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            En Yeni Akıllı Telefonlar & Garantili İkinci El Cihazlar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Mağazamızdaki tüm ürünler faturalı ve garantilidir. İkinci el cihazlarımız 28 nokta uzman ekspertizinden geçmiş olup mağaza garantisi kapsamındadır.
          </p>

          {/* Güven Rozetleri */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              1 Yıl Mağaza & Distribütör Garantisi
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <Sparkles className="w-4 h-4 text-amber-400" />
              28 Nokta Ekspertiz Kontrolü
            </span>
            <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
              <Package className="w-4 h-4 text-cyan-400" />
              Aynı Gün Mağazadan Teslim
            </span>
          </div>
        </div>
      </section>

      {/* 4. ARAMA VE FİLTRELEME ÇUBUĞU */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 space-y-4">
        <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800/90 backdrop-blur-sm shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Arama Kutusu */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <Input
              type="text"
              placeholder="Ürün adı, marka veya model ile ara... (Örn: iPhone 15, Galaxy S23, Şarj Aleti)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl text-xs sm:text-sm focus:border-cyan-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Kategori Seçici */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                selectedCategory === "all"
                  ? "bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20"
                  : "bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              Tüm Kategoriler
            </button>
            {VITRIN_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  selectedCategory === cat.id
                    ? "bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20"
                    : "bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Kondisyon ve Stok Butonları */}
          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-3">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="h-10 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Tüm Kondisyonlar</option>
              <option value="sıfır">Sıfır (Kapalı Kutu)</option>
              <option value="ikinci el">İkinci El (Garantili)</option>
            </select>

            <button
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`px-3 h-10 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap flex items-center gap-1.5 ${
                onlyInStock 
                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${onlyInStock ? "text-emerald-400" : "opacity-0"}`} />
              Sadece Stoktakiler
            </button>
          </div>
        </div>

        {/* Sonuç Sayacı */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Toplam <strong>{filteredProducts.length}</strong> ürün listeleniyor</span>
          {(searchQuery || selectedCategory !== "all" || selectedCondition !== "all" || onlyInStock) && (
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSelectedCondition("all")
                setOnlyInStock(false)
              }}
              className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </section>

      {/* 5. ÜRÜN KARTLARI VİTRİN IZGARASI (Showcase Grid) */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 pb-16 flex-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-3">
            <Package className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">Aradığınız Kriterlere Uygun Ürün Bulunamadı</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Arama kriterlerinizi değiştirerek veya filtreleri temizleyerek mağazamızdaki diğer ürünleri görüntüleyebilirsiniz.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSelectedCondition("all")
                setOnlyInStock(false)
              }}
              className="border-slate-700 bg-slate-800 text-xs text-slate-200 mt-2"
            >
              Tüm Ürünleri Göster
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((p) => {
              const inStock = p.stock_quantity > 0
              const isLowStock = inStock && p.stock_quantity <= p.min_stock_level

              return (
                <div
                  key={p.id}
                  className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/10 group relative overflow-hidden backdrop-blur-sm"
                >
                  {/* Kart Üst Rozetleri */}
                  <div className="flex items-center justify-between gap-1 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                      {p.categoryName}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {p.condition === "sıfır" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Sıfır Kapalı Kutu
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          2. El Garantili
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ürün Görsel / İkon Alanı */}
                  <div className="h-40 rounded-xl bg-gradient-to-b from-slate-950 to-slate-900/90 border border-slate-800/60 flex items-center justify-center p-4 relative mb-3 group-hover:border-cyan-500/30 transition-colors">
                    {getProductIcon(p.categoryName)}
                    
                    {/* Stok Rozeti (Görselin İçinde) */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      {inStock ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isLowStock 
                            ? "bg-amber-950/80 text-amber-300 border border-amber-800/60" 
                            : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isLowStock ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
                          {isLowStock ? `Son ${p.stock_quantity} Ürün` : "Stokta Var"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800/60 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Tükendi
                        </span>
                      )}
                      
                      <span className="text-[10px] text-slate-500 font-mono">
                        {p.brand}
                      </span>
                    </div>
                  </div>

                  {/* Ürün Başlık & Açıklama */}
                  <div className="space-y-1.5 mb-4 flex-1">
                    <h2 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {p.name}
                    </h2>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Öne Çıkan Özellikler */}
                    {p.specs && p.specs.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {p.specs.slice(0, 2).map((spec, idx) => (
                          <span key={idx} className="text-[9px] bg-slate-950/80 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fiyat & İncele Butonu (MÜŞTERİ ODAKLI - ALIŞ FİYATI YOK!) */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-end justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Satış Fiyatı</span>
                      <span className="font-black text-lg text-cyan-400 tracking-tight">
                        {formatPrice(p.sale_price)}
                      </span>
                      <span className="text-[9px] text-slate-500 block">KDV Dahil</span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => setSelectedProduct(p)}
                      className="bg-slate-800 hover:bg-cyan-600 text-white font-medium text-xs h-8 px-3 rounded-lg transition-colors group-hover:bg-cyan-600"
                    >
                      İncele
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* 6. MÜŞTERİ ÜRÜN DETAY MODALI */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/70 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {selectedProduct.categoryName} • {selectedProduct.brand}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedProduct.name}</h3>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Kondisyon:</span>
                <span className="font-semibold text-white">
                  {selectedProduct.condition === "sıfır" ? "Sıfır Kapalı Kutu (2 Yıl Distribütör)" : "Garantili İkinci El (Ekspertizli)"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Stok Durumu:</span>
                <span className={`font-bold ${selectedProduct.stock_quantity > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {selectedProduct.stock_quantity > 0 ? `Mağazada Mevcut (${selectedProduct.stock_quantity} Adet)` : "Tükendi"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Teslimat & Kurulum:</span>
                <span className="text-slate-200">Aynı gün mağazamızdan ücretsiz kurulumla teslim</span>
              </div>

              <div className="py-1">
                <span className="text-slate-400 block mb-1">Ürün Açıklaması:</span>
                <p className="text-slate-300 leading-relaxed">{selectedProduct.description}</p>
              </div>

              {selectedProduct.specs && (
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400 block mb-1.5 font-medium">Teknik Özellikler:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {selectedProduct.specs.map((s, i) => (
                      <span key={i} className="bg-slate-900 px-2 py-1 rounded text-[11px] text-slate-300 border border-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fiyat ve İletişim */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-[11px] text-slate-400 block">Mağaza Satış Fiyatı</span>
                <span className="text-2xl font-black text-cyan-400">{formatPrice(selectedProduct.sale_price)}</span>
                <span className="text-[10px] text-slate-500 block">Tüm vergiler dahil</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSelectedProduct(null)}
                  variant="outline"
                  className="border-slate-800 bg-slate-800 text-xs text-slate-300"
                >
                  Kapat
                </Button>
                <a
                  href={`https://wa.me/902165551234?text=${encodeURIComponent(`Merhaba, mağazanızdaki ${selectedProduct.name} ürünü hakkında bilgi almak istiyorum.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-600/20">
                    <Phone className="w-3.5 h-3.5" />
                    Bilgi Al
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. FOOTER */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-6 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>PhoneStore Pro</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500 font-normal">Teknoloji & Telefon Mağaza Yönetim Sistemi</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Adres: Bağdat Cad. No:42/A Kadıköy</span>
            <span>Tel: (0216) 555 12 34</span>
            <Link href="/login" className="text-cyan-400 hover:underline">
              Yönetici Girişi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
