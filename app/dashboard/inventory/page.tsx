"use client"

import React, { useState } from "react"
import { 
  Package, 
  Search, 
  Plus, 
  AlertCircle, 
  Hash 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function InventoryDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const products = [
    {
      id: "prod-1",
      name: "Apple iPhone 15 Pro 128GB",
      brand: "Apple",
      model: "iPhone 15 Pro",
      category: "Telefon",
      imei: "354892091234567",
      barcode: "195949038241",
      condition: "sıfır",
      sale_price: 74999,
      purchase_price: 64500,
      stock_quantity: 4,
      min_stock_level: 1,
      is_active: true
    },
    {
      id: "prod-2",
      name: "Samsung Galaxy S23 Ultra 256GB",
      brand: "Samsung",
      model: "Galaxy S23 Ultra",
      category: "Telefon",
      imei: "359876098765432",
      barcode: "8806094772814",
      condition: "ikinci el",
      sale_price: 42500,
      purchase_price: 34000,
      stock_quantity: 2,
      min_stock_level: 1,
      is_active: true
    },
    {
      id: "prod-3",
      name: "Xiaomi Redmi Note 13 Pro 5G",
      brand: "Xiaomi",
      model: "Redmi Note 13 Pro",
      category: "Telefon",
      imei: "867543021984210",
      barcode: "6941812753218",
      condition: "sıfır",
      sale_price: 17200,
      purchase_price: 13500,
      stock_quantity: 8,
      min_stock_level: 2,
      is_active: true
    },
    {
      id: "prod-4",
      name: "Apple 20W USB-C Hızlı Güç Adaptörü",
      brand: "Apple",
      model: "MHJE3TU/A",
      category: "Aksesuar",
      imei: null,
      barcode: "194252157015",
      condition: "sıfır",
      sale_price: 849,
      purchase_price: 520,
      stock_quantity: 45,
      min_stock_level: 5,
      is_active: true
    },
    {
      id: "prod-5",
      name: "iPhone 11 GX OLED Ekran Paneli",
      brand: "GX",
      model: "GX-IP11-OLED",
      category: "Yedek Parça",
      imei: null,
      barcode: "8690192837465",
      condition: "sıfır",
      sale_price: 2450,
      purchase_price: 1600,
      stock_quantity: 1,
      min_stock_level: 2,
      is_active: true
    }
  ]

  const filtered = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.imei && p.imei.includes(searchQuery)) ||
      (p.barcode && p.barcode.includes(searchQuery))

    const matchesCat = selectedCategory === "all" || p.category === selectedCategory
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-cyan-400" />
            Ürün Envanteri & Stok Takibi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Telefonlar (15 Haneli IMEI), aksesuarlar ve teknik servis yedek parçaları
          </p>
        </div>

        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium gap-1.5 shadow-md shadow-cyan-600/20 text-xs h-8">
          <Plus className="w-4 h-4" />
          Yeni Ürün Ekle
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Toplam Çeşit</CardDescription>
            <CardTitle className="text-xl font-bold text-white">5 Ürün</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400">
            3 Kategori Aktif
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Kayıtlı IMEI Adedi</CardDescription>
            <CardTitle className="text-xl font-bold text-cyan-400">14 Cihaz</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400">
            Sıfır & İkinci El Cihazlar
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Kritik Stok Uyarısı</CardDescription>
            <CardTitle className="text-xl font-bold text-amber-400">1 Ürün</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-amber-400/80 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Minimum seviyenin altında
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Toplam Stok Değeri</CardDescription>
            <CardTitle className="text-xl font-bold text-emerald-400">₺545.900</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400">
            Satış Değeri Toplamı
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="Ürün adı, marka, model, barkod veya 15 haneli IMEI no ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950/60 border-slate-800 text-xs h-9 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={`text-xs h-9 ${selectedCategory === "all" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-400"}`}
            >
              Tümü
            </Button>
            <Button
              variant={selectedCategory === "Telefon" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("Telefon")}
              className={`text-xs h-9 ${selectedCategory === "Telefon" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-400"}`}
            >
              Telefon
            </Button>
            <Button
              variant={selectedCategory === "Aksesuar" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("Aksesuar")}
              className={`text-xs h-9 ${selectedCategory === "Aksesuar" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-400"}`}
            >
              Aksesuar
            </Button>
            <Button
              variant={selectedCategory === "Yedek Parça" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("Yedek Parça")}
              className={`text-xs h-9 ${selectedCategory === "Yedek Parça" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-400"}`}
            >
              Yedek Parça
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-950/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-xs text-slate-400 font-semibold">Ürün Adı & Marka</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold">Kategori</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold">IMEI / Barkod</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold text-right">Alış Fiyatı</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold text-right">Satış Fiyatı</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold text-center">Stok</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold text-center">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(product => (
                <TableRow key={product.id} className="border-slate-800/60 hover:bg-slate-800/40">
                  <TableCell>
                    <div className="font-semibold text-xs text-white">{product.name}</div>
                    <div className="text-[11px] text-slate-400">{product.brand} • {product.model}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] border-slate-700 bg-slate-800/50 text-slate-300">
                      {product.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.imei ? (
                      <div className="font-mono text-xs text-cyan-300 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-cyan-500" />
                        {product.imei}
                      </div>
                    ) : (
                      <div className="font-mono text-xs text-slate-400">
                        {product.barcode}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-slate-400">
                    ₺{product.purchase_price.toLocaleString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-emerald-400">
                    ₺{product.sale_price.toLocaleString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      product.stock_quantity <= product.min_stock_level
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-slate-800 text-slate-200"
                    }`}>
                      {product.stock_quantity} Adet
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`text-[10px] border-none ${
                      product.condition === "sıfır"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-blue-500/15 text-blue-400"
                    }`}>
                      {product.condition === "sıfır" ? "Sıfır Cihaz" : "2. El"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
