"use client"

import React, { useState } from "react"
import { 
  Wrench, 
  Search, 
  Plus, 
  KeyRound, 
  Clock, 
  CheckCircle2, 
  RotateCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function RepairsDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const repairs = [
    {
      id: "r1",
      ticket_number: "SRV-20260925-001",
      customer_name: "Ahmet Yılmaz",
      customer_phone: "0532 111 22 33",
      device: "Apple iPhone 13",
      imei: "354892091234567",
      device_password: "1907",
      issue_description: "Ekran kırık, görüntü yok ses var.",
      status: "islemde",
      estimated_cost: 3200,
      actual_cost: 3200,
      part_name: "iPhone 13 GX OLED Ekran Paneli"
    },
    {
      id: "r2",
      ticket_number: "SRV-20260925-002",
      customer_name: "Fatma Kaya",
      customer_phone: "0542 333 44 55",
      device: "Samsung Galaxy S21 5G",
      imei: "359876098765432",
      device_password: "2468",
      issue_description: "Batarya şişmesi, arka kapak açılmış.",
      status: "bekliyor",
      estimated_cost: 1450,
      actual_cost: 1450,
      part_name: "Galaxy S21 4000mAh Batarya"
    },
    {
      id: "r3",
      ticket_number: "SRV-20260925-003",
      customer_name: "Mehmet Öztürk",
      customer_phone: "0555 777 88 99",
      device: "Xiaomi 12",
      imei: "867543021984210",
      device_password: "Yok (Ekran Kilidi Açık)",
      issue_description: "Şarj soketi temassızlık yapıyor.",
      status: "tamamlandi",
      estimated_cost: 750,
      actual_cost: 750,
      part_name: "Xiaomi 12 Şarj Bord Modülü"
    },
    {
      id: "r4",
      ticket_number: "SRV-20260925-004",
      customer_name: "Zeynep Çelik",
      customer_phone: "0505 999 00 11",
      device: "Huawei P30 Pro",
      imei: "863491028374651",
      device_password: "1234",
      issue_description: "Denize düştü, sıvı teması anakart hasarı.",
      status: "iade",
      estimated_cost: 4500,
      actual_cost: 0,
      part_name: "Onarılamadı / Parça Temin Edilemedi"
    }
  ]

  const filtered = repairs.filter(r => {
    const matchesSearch = 
      r.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.imei.includes(searchQuery) ||
      r.device_password.includes(searchQuery)

    const matchesStatus = statusFilter === "all" || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-cyan-400" />
            Teknik Servis (Repair Tickets)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cihaz kabul fişleri, arıza takibi, cihaz şifreleri ve JSONB yedek parça maliyetleri
          </p>
        </div>

        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium gap-1.5 shadow-md shadow-cyan-600/20 text-xs h-8">
          <Plus className="w-4 h-4" />
          Yeni Servis Fişi Aç
        </Button>
      </div>

      {/* Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Bekleyen Cihazlar</CardDescription>
            <CardTitle className="text-xl font-bold text-amber-400">1 Cihaz</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            İşlem sırası bekleniyor
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">İşlemde Olanlar</CardDescription>
            <CardTitle className="text-xl font-bold text-cyan-400">1 Cihaz</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-cyan-400" />
            Parça montajı devam ediyor
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">Teslime Hazır</CardDescription>
            <CardTitle className="text-xl font-bold text-emerald-400">1 Cihaz</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Onarım ve test tamamlandı
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="pb-1">
            <CardDescription className="text-xs">İade Edilenler</CardDescription>
            <CardTitle className="text-xl font-bold text-slate-400">1 Cihaz</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-slate-400 flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Maliyet onaylanmadı / onarılamadı
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              placeholder="Fiş no, müşteri, cihaz modeli, IMEI veya cihaz PIN/şifresi ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-950/60 border-slate-800 text-xs h-9 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className={`text-xs h-9 ${statusFilter === "all" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-400"}`}
            >
              Tümü
            </Button>
            <Button
              variant={statusFilter === "islemde" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("islemde")}
              className={`text-xs h-9 ${statusFilter === "islemde" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-400"}`}
            >
              İşlemde
            </Button>
            <Button
              variant={statusFilter === "bekliyor" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("bekliyor")}
              className={`text-xs h-9 ${statusFilter === "bekliyor" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-400"}`}
            >
              Bekleyen
            </Button>
            <Button
              variant={statusFilter === "tamamlandi" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("tamamlandi")}
              className={`text-xs h-9 ${statusFilter === "tamamlandi" ? "bg-cyan-600 text-white" : "border-slate-800 text-slate-400"}`}
            >
              Tamamlandı
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Repairs Table */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-950/50">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-xs text-slate-400 font-semibold">Fiş No & Müşteri</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold">Cihaz & IMEI</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold">Cihaz PIN / Şifre</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold">Şikayet & Arıza</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold text-right">Tahmini Tutar</TableHead>
                <TableHead className="text-xs text-slate-400 font-semibold text-center">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id} className="border-slate-800/60 hover:bg-slate-800/40">
                  <TableCell>
                    <div className="font-mono text-xs font-semibold text-cyan-300">{r.ticket_number}</div>
                    <div className="text-[11px] text-white font-medium">{r.customer_name}</div>
                    <div className="text-[10px] text-slate-500">{r.customer_phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-white">{r.device}</div>
                    <div className="font-mono text-[11px] text-slate-400">{r.imei}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono text-[11px] gap-1">
                      <KeyRound className="w-3 h-3 text-amber-400" />
                      {r.device_password}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-slate-200 max-w-xs">{r.issue_description}</div>
                    <div className="text-[10px] text-cyan-400/80 mt-0.5">Parça: {r.part_name}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-slate-100">
                    ₺{r.estimated_cost.toLocaleString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={`text-[10px] border-none ${
                      r.status === "islemde" ? "bg-cyan-500/15 text-cyan-300" :
                      r.status === "bekliyor" ? "bg-amber-500/15 text-amber-300" :
                      r.status === "tamamlandi" ? "bg-emerald-500/15 text-emerald-300" :
                      "bg-rose-500/15 text-rose-300"
                    }`}>
                      {r.status === "islemde" ? "İşlemde" :
                       r.status === "bekliyor" ? "Bekliyor" :
                       r.status === "tamamlandi" ? "Tamamlandı" : "İade"}
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
