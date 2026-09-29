"use client"

import React, { useState } from "react"
import { 
  Receipt, 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Banknote, 
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TransactionsDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const transactions = [
    {
      id: "t1",
      trx_number: "TRX-20260924-001",
      customer: "Ahmet Yılmaz",
      type: "sale",
      payment_method: "credit_card",
      total_amount: 67000,
      net_amount: 67000,
      notes: "iPhone 15 Pro 128GB Satışı (IMEI: 354892091234567)",
      date: "2026-09-24 10:15"
    },
    {
      id: "t2",
      trx_number: "TRX-20260924-002",
      customer: "Fatma Kaya",
      type: "sale",
      payment_method: "cash",
      total_amount: 1400,
      net_amount: 1400,
      notes: "Apple 20W Hızlı Şarj Başlığı + Kılıf",
      date: "2026-09-24 11:20"
    },
    {
      id: "t3",
      trx_number: "TRX-20260924-003",
      customer: "Mehmet Öztürk",
      type: "purchase",
      payment_method: "bank_transfer",
      total_amount: 42000,
      net_amount: 42000,
      notes: "İkinci el Samsung Galaxy S23 Ultra alımı",
      date: "2026-09-24 12:45"
    },
    {
      id: "t4",
      trx_number: "TRX-20260924-004",
      customer: "Zeynep Çelik",
      type: "sale",
      payment_method: "cash",
      total_amount: 250,
      net_amount: 250,
      notes: "Kırılmaz cam koruyucu ve montaj",
      date: "2026-09-24 13:50"
    }
  ]

  const filtered = transactions.filter(t => {
    const matchesSearch = 
      t.trx_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.notes.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || t.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-cyan-400" />
            Kasa & Satış İşlemleri
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Günlük nakit akışı, POS çekimleri, cihaz alım/satım fişleri ve kasa mutabakatı
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900 text-slate-300 text-xs h-8 gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Gün Sonu Raporu
          </Button>
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium gap-1.5 shadow-md shadow-cyan-600/20 text-xs h-8">
            <Plus className="w-4 h-4" />
            Yeni Satış Fişi
          </Button>
        </div>
      </div>

      {/* Finance Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Toplam Satış Cirosu</CardDescription>
            <CardTitle className="text-xl font-bold text-emerald-400">₺68.650,00</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            3 Satış Tamamlandı
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Nakit Kasa Bakiyesi</CardDescription>
            <CardTitle className="text-xl font-bold text-slate-100">₺1.650,00</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5 text-emerald-400" />
            Fiziksel Kasa Mevcudu
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">POS / Kredi Kartı</CardDescription>
            <CardTitle className="text-xl font-bold text-indigo-400">₺67.000,00</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
            Banka Hesabına Geçen
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">İkinci El Alımları</CardDescription>
            <CardTitle className="text-xl font-bold text-amber-400">₺42.000,00</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-amber-400" />
            1 Cihaz Alımı Yapıldı
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="Fiş no (TRX-...), müşteri adı veya işlem açıklamasıyla ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950/60 border-slate-800 text-xs h-9 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant={typeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("all")}
              className={`text-xs h-9 ${typeFilter === "all" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-400"}`}
            >
              Tümü
            </Button>
            <Button
              variant={typeFilter === "sale" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("sale")}
              className={`text-xs h-9 ${typeFilter === "sale" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-400"}`}
            >
              Satışlar
            </Button>
            <Button
              variant={typeFilter === "purchase" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("purchase")}
              className={`text-xs h-9 ${typeFilter === "purchase" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-400"}`}
            >
              Alımlar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-950/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-xs text-slate-400 font-semibold">Fiş No & Tarih</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold">Müşteri</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold">İşlem Türü</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold">Ödeme Yöntemi</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold">Açıklama / Kalem</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold text-right">Net Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => (
                <TableRow key={t.id} className="border-slate-800/60 hover:bg-slate-800/40">
                  <TableCell>
                    <div className="font-mono text-xs font-semibold text-cyan-300">{t.trx_number}</div>
                    <div className="text-[10px] text-slate-500">{t.date}</div>
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-white">
                    {t.customer}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] border-none ${
                      t.type === "sale" 
                        ? "bg-emerald-500/15 text-emerald-400" 
                        : "bg-amber-500/15 text-amber-400"
                    }`}>
                      {t.type === "sale" ? "Satış" : "Cihaz Alımı"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] border-slate-700 bg-slate-800/60 text-slate-300">
                      {t.payment_method === "credit_card" ? "Kredi Kartı / POS" :
                       t.payment_method === "cash" ? "Nakit" : "Havale / EFT"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-300 max-w-sm truncate">
                    {t.notes}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-slate-100">
                    ₺{t.net_amount.toLocaleString("tr-TR")},00
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
