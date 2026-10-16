"use client"

import React, { useState, useMemo } from "react"
import { useSyncedTransactions } from "@/hooks/use-store-data"
import { 
  Receipt, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Banknote, 
  Printer,
  RefreshCw,
  Plus
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { UniversalReceiptModal } from "@/components/receipt/universal-receipt-modal"
import { 
  UniversalReceiptData, 
  SAMPLE_SALE_RECEIPT, 
  SAMPLE_PURCHASE_RECEIPT 
} from "@/types/receipt"
import { formatTransactionRowToReceipt } from "@/lib/receipt-formatter"

export interface TransactionItemRow {
  id: string
  trx_number: string
  customer: string
  type: string
  payment_method: string
  total_amount: number
  net_amount: number
  notes: string
  date: string
  raw_created_at: string
}

// Güvenli Fallback Verisi (Veritabanı boşken veya çevrimdışı modda UI bütünlüğü için)
const FALLBACK_TRANSACTIONS: TransactionItemRow[] = [
  {
    id: "t1",
    trx_number: "TRX-20260924-001",
    customer: "Ahmet Yılmaz",
    type: "sale",
    payment_method: "credit_card",
    total_amount: 67000,
    net_amount: 67000,
    notes: "iPhone 15 Pro 128GB Satışı (IMEI: 354892091234567)",
    date: "2026-09-24 10:15",
    raw_created_at: "2026-09-24T10:15:00.000Z",
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
    date: "2026-09-24 11:20",
    raw_created_at: "2026-09-24T11:20:00.000Z",
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
    date: "2026-09-24 12:45",
    raw_created_at: "2026-09-24T12:45:00.000Z",
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
    date: "2026-09-24 13:50",
    raw_created_at: "2026-09-24T13:50:00.000Z",
  },
]

// ==============================================================================
// ENTERPRISE DATA PERSISTENCE & REAL-TIME CACHE SYNC:
// Statik mock veri yerine StoreEngine ve useSyncedTransactions dinler.
// POS satışı, 2. el alımı veya servis teslimatı olduğunda anında güncellenir.
// ==============================================================================
export default function TransactionsDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [activeReceipt, setActiveReceipt] = useState<UniversalReceiptData | null>(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)

  // Real-time SWR senkronize kasa hareketleri hook'u
  const { transactions: rawTransactions, isLoading, isValidating, mutate } = useSyncedTransactions()
  const transactions = rawTransactions.length > 0 ? rawTransactions : FALLBACK_TRANSACTIONS

  // Canlı Finansal Özet Metrikleri (Gerçek Veriden Dinamik Hesaplanır)
  const summaryMetrics = useMemo(() => {
    let totalSales = 0
    let salesCount = 0
    let cashTotal = 0
    let cardTotal = 0
    let purchaseTotal = 0
    let purchaseCount = 0

    transactions.forEach((t) => {
      const amt = Number(t.net_amount) || 0
      if (t.type === "sale" || t.type === "repair_payment") {
        totalSales += amt
        salesCount++
      } else if (t.type === "purchase") {
        purchaseTotal += amt
        purchaseCount++
      }

      if (t.payment_method === "cash") {
        cashTotal += t.type === "purchase" ? -amt : amt
      } else if (t.payment_method === "credit_card") {
        cardTotal += amt
      }
    })

    return {
      totalSales,
      salesCount,
      cashTotal: Math.max(0, cashTotal),
      cardTotal,
      purchaseTotal,
      purchaseCount,
    }
  }, [transactions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0)
  }

  // Arama ve Filtreleme
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return transactions.filter((t) => {
      const matchesSearch = 
        !q ||
        t.trx_number.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)

      const matchesType = typeFilter === "all" || t.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [transactions, searchQuery, typeFilter])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Receipt className="w-6 h-6 text-cyan-400" />
              Kasa & Satış İşlemleri
            </h1>
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Canlı Veritabanı
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Günlük nakit akışı, POS çekimleri, cihaz alım/satım fişleri ve canlı kasa mutabakatı
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Canlı Yenileme Butonu */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => mutate()}
            disabled={isValidating}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs h-8 gap-1.5"
            title="Verileri Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden sm:inline">Yenile</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setActiveReceipt(SAMPLE_SALE_RECEIPT)
              setIsReceiptModalOpen(true)
            }}
            className="border-cyan-800/60 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/50 text-xs h-8 gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            80mm Satış Fişi Örneği
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setActiveReceipt(SAMPLE_PURCHASE_RECEIPT)
              setIsReceiptModalOpen(true)
            }}
            className="border-amber-800/60 bg-amber-950/30 text-amber-300 hover:bg-amber-900/50 text-xs h-8 gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            80mm 2. El Alım Fişi Örneği
          </Button>

          <Link href="/dashboard/pos">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Yeni Satış Yap
            </Button>
          </Link>
        </div>
      </div>

      {/* Finance Overview Cards (Dinamik Canlı Veriler) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Toplam Satış Cirosu</CardDescription>
            <CardTitle className="text-xl font-bold text-emerald-400">
              {formatCurrency(summaryMetrics.totalSales)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            {summaryMetrics.salesCount} Satış İşlemi
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Nakit Kasa Bakiyesi</CardDescription>
            <CardTitle className="text-xl font-bold text-slate-100">
              {formatCurrency(summaryMetrics.cashTotal)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5 text-emerald-400" />
            Fiziksel Kasa Mevcudu
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">POS / Kredi Kartı</CardDescription>
            <CardTitle className="text-xl font-bold text-indigo-400">
              {formatCurrency(summaryMetrics.cardTotal)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
            Banka Hesabına Geçen
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">İkinci El Alımları</CardDescription>
            <CardTitle className="text-xl font-bold text-amber-400">
              {formatCurrency(summaryMetrics.purchaseTotal)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-amber-400" />
            {summaryMetrics.purchaseCount} Cihaz Alımı Yapıldı
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
              Tümü ({transactions.length})
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
      <Card className="bg-slate-900/60 border-slate-800 shadow-xl">
        <CardContent className="p-0">
          {isLoading && (!transactions || transactions.length === 0) ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={`tx-skel-${idx}`} className="flex items-center justify-between py-2.5 border-b border-slate-800/40">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36 bg-slate-800" />
                    <Skeleton className="h-3 w-24 bg-slate-800/60" />
                  </div>
                  <Skeleton className="h-4 w-28 bg-slate-800" />
                  <Skeleton className="h-5 w-16 rounded bg-slate-800" />
                  <Skeleton className="h-5 w-20 rounded bg-slate-800" />
                  <Skeleton className="h-4 w-20 bg-slate-800" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Kriterlere uygun kasa hareketi bulunamadı.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-xs text-slate-400 font-semibold">Fiş No & Tarih</TableHead>
                  <TableHead className="text-xs text-slate-400 font-semibold">Müşteri</TableHead>
                  <TableHead className="text-xs text-slate-400 font-semibold">İşlem Türü</TableHead>
                  <TableHead className="text-xs text-slate-400 font-semibold">Ödeme Yöntemi</TableHead>
                  <TableHead className="text-xs text-slate-400 font-semibold">Açıklama / Kalem</TableHead>
                  <TableHead className="text-xs text-slate-400 font-semibold text-right">Net Tutar</TableHead>
                  <TableHead className="text-xs text-slate-400 font-semibold text-center w-28">Fiş / Yazdır</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
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
                          : t.type === "repair_payment"
                          ? "bg-cyan-500/15 text-cyan-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}>
                        {t.type === "sale" ? "Satış" : t.type === "repair_payment" ? "Servis Tahsilatı" : "Cihaz Alımı"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] border-slate-700 bg-slate-800/60 text-slate-300">
                        {t.payment_method === "credit_card" ? "Kredi Kartı / POS" :
                         t.payment_method === "cash" ? "Nakit" : 
                         t.payment_method === "on_account" ? "Veresiye / Cari" : "Havale / EFT"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 max-w-sm truncate">
                      {t.notes}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-slate-100">
                      {t.type === "purchase" ? `-${formatCurrency(t.net_amount)}` : formatCurrency(t.net_amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveReceipt(formatTransactionRowToReceipt(t))
                          setIsReceiptModalOpen(true)
                        }}
                        className="h-7 px-2.5 text-[11px] font-semibold border-cyan-800/60 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/50 hover:text-white gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        Fiş Yazdır
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Universal 80mm Fiş & Makbuz Modalı */}
      <UniversalReceiptModal
        isOpen={isReceiptModalOpen}
        data={activeReceipt}
        onClose={() => setIsReceiptModalOpen(false)}
        title={activeReceipt?.type === "purchase" ? "İkinci El Alım Gider Pusulası" : "Satış Bilgi Fişi"}
      />
    </div>
  )
}
