"use client"

import React, { useState } from "react"
import { 
  Users, 
  Search, 
  Plus, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft,
  UserCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CustomersDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const customers = [
    {
      id: "c1",
      name: "Ahmet Yılmaz",
      phone: "0532 111 22 33",
      tc_no: "12345678901",
      city: "İstanbul / Kadıköy",
      balance: -3200,
      total_transactions: 3,
      is_corporate: false
    },
    {
      id: "c2",
      name: "Fatma Kaya",
      phone: "0542 333 44 55",
      tc_no: "23456789012",
      city: "Ankara / Çankaya",
      balance: 0,
      total_transactions: 2,
      is_corporate: false
    },
    {
      id: "c3",
      name: "Mehmet Öztürk",
      phone: "0555 777 88 99",
      tc_no: "34567890123",
      city: "İzmir / Konak",
      balance: 1500,
      total_transactions: 4,
      is_corporate: false
    },
    {
      id: "c4",
      name: "Zeynep Çelik",
      phone: "0505 999 00 11",
      tc_no: "45678901234",
      city: "Bursa / Nilüfer",
      balance: 0,
      total_transactions: 1,
      is_corporate: false
    }
  ]

  const filtered = customers.filter(c => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.tc_no.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-cyan-400" />
            Müşteriler & Cari Hesaplar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Bireysel ve kurumsal müşteri veritabanı, borç/alacak bakiyeleri ve iletişim rehberi
          </p>
        </div>

        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium gap-1.5 shadow-md shadow-cyan-600/20 text-xs h-8">
          <Plus className="w-4 h-4" />
          Yeni Müşteri Kaydet
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Kayıtlı Müşteri</CardDescription>
            <CardTitle className="text-xl font-bold text-white">4 Müşteri</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            Tüm kayıtlar aktif
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Müşteri Alacağı (Avans)</CardDescription>
            <CardTitle className="text-xl font-bold text-emerald-400">₺1.500,00</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-emerald-400/80 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            Müşteride bakiye mevcut
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Açık Veresiye (Borç)</CardDescription>
            <CardTitle className="text-xl font-bold text-rose-400">₺3.200,00</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-rose-400/80 flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-rose-400" />
            Tahsil edilecek tutar
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Cari Hesap Durumu</CardDescription>
            <CardTitle className="text-xl font-bold text-slate-200">Dengeli</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Çift Defter Mutabakatı
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="Müşteri adı, telefon (05...), T.C. kimlik veya şehir ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950/60 border-slate-800 text-xs h-9 text-white placeholder:text-slate-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-950/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-xs text-slate-400 font-semibold">Müşteri Adı</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold">İletişim Telefonu</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold">T.C. Kimlik No</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold">Şehir / Lokasyon</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold text-center">İşlem Sayısı</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold text-right">Cari Bakiye</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id} className="border-slate-800/60 hover:bg-slate-800/40">
                  <TableCell>
                    <div className="font-semibold text-xs text-white">{c.name}</div>
                    <div className="text-[10px] text-cyan-400">Bireysel Müşteri</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-300">
                    {c.phone}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">
                    {c.tc_no}
                  </TableCell>
                  <TableCell className="text-xs text-slate-300">
                    {c.city}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs text-slate-300">
                    {c.total_transactions} İşlem
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold">
                    {c.balance < 0 ? (
                      <span className="text-rose-400">-₺{Math.abs(c.balance).toLocaleString("tr-TR")},00 (Borç)</span>
                    ) : c.balance > 0 ? (
                      <span className="text-emerald-400">+₺{c.balance.toLocaleString("tr-TR")},00 (Alacak)</span>
                    ) : (
                      <span className="text-slate-400">₺0,00</span>
                    )}
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
