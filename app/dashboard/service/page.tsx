"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { 
  Wrench, 
  Plus, 
  Search, 
  RefreshCw, 
  LayoutGrid, 
  ListFilter, 
  Clock, 
  Boxes, 
  CheckCircle2, 
  DollarSign, 
  Printer, 
  Info,
  History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ServiceTicketDisplay, 
  KanbanColumnId, 
  KANBAN_COLUMNS, 
  ServiceTicketReceiptData,
  ServiceDeliveryCheckoutPayload,
  ServiceDeliveryResult
} from "@/types/service"
import { UniversalReceiptData } from "@/types/receipt"
import { 
  fetchServiceTickets, 
  updateServiceTicketStatus,
  INITIAL_KANBAN_TICKETS
} from "@/lib/service-ticket-service"
import { formatServiceDeliveryToReceipt } from "@/lib/receipt-formatter"
import { KanbanColumn } from "@/components/service/kanban/kanban-column"
import { ServiceDetailModal } from "@/components/service/service-detail-modal"
import { ServiceTicketModal } from "@/components/service/service-ticket-modal"
import { CustomerNotificationModal } from "@/components/service/delivery/customer-notification-modal"
import { ServiceDeliveryModal } from "@/components/service/delivery/service-delivery-modal"
import { UniversalReceiptModal } from "@/components/receipt/universal-receipt-modal"

export default function ServiceKanbanPage() {
  const [tickets, setTickets] = useState<ServiceTicketDisplay[]>(INITIAL_KANBAN_TICKETS)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban")

  // Modallar
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<ServiceTicketDisplay | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  
  const [receiptData, setReceiptData] = useState<ServiceTicketReceiptData | null>(null)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)

  // Gün 24: Teslimat ve Müşteri Bildirimi Modalları
  const [selectedTicketForAction, setSelectedTicketForAction] = useState<ServiceTicketDisplay | null>(null)
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false)
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false)
  const [isUniversalReceiptOpen, setIsUniversalReceiptOpen] = useState(false)
  const [universalReceiptData, setUniversalReceiptData] = useState<UniversalReceiptData | null>(null)

  // Biletleri Çekme Fonksiyonu
  const loadTickets = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchServiceTickets()
      setTickets(data)
    } catch (err) {
      console.warn("Veri çekme hatası:", err)
      setTickets(INITIAL_KANBAN_TICKETS)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  // Durum Değiştirme (Optimistic UI Update)
  const handleStatusChange = async (ticketId: string, newStatus: KanbanColumnId) => {
    // Anlık state güncellemesi
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus, updated_at: new Date().toISOString() } : t))
    )

    // Detay modalı açıksa onun da state'ini güncelle
    if (selectedTicketForDetail && selectedTicketForDetail.id === ticketId) {
      setSelectedTicketForDetail((prev) => (prev ? { ...prev, status: newStatus } : null))
    }

    // Veritabanı güncellemesi
    await updateServiceTicketStatus(ticketId, newStatus)
  }

  // Fiş Yazdırma Modalı Açma
  const handlePrintTicket = (ticket: ServiceTicketDisplay) => {
    const printPayload: ServiceTicketReceiptData = {
      ticketNumber: ticket.ticket_number,
      date: ticket.created_at,
      customer: {
        id: ticket.customer_id,
        full_name: ticket.customer_name,
        phone: ticket.customer_phone,
        tckn: null,
        city: null,
        address: null,
        balance: 0,
      },
      device: {
        brand: ticket.device_brand,
        model: ticket.device_model,
        imei: ticket.imei || null,
        serialNumber: ticket.serial_number || null,
        passwordType: ticket.pattern_code ? "pattern" : ticket.device_password ? "pin" : "none",
        devicePassword: ticket.device_password || "Yok",
        patternNotes: ticket.pattern_code || null,
        physicalCondition: ticket.physical_condition || "Belirtilmedi",
        cosmeticDefects: ticket.physical_condition ? [ticket.physical_condition] : [],
        accessories: ticket.has_accessories ? [ticket.has_accessories] : ["Yalnızca Cihaz Teslim Alındı"],
      },
      service: {
        category: ticket.issue_category || "Genel Bakım",
        issueDescription: ticket.issue_description,
        technicianNotes: ticket.technician_notes || null,
        estimatedCost: ticket.estimated_cost,
        priority: ticket.priority,
        assignedTechnician: ticket.assigned_technician || "Genel Servis",
      },
      store: {
        name: "TELEFON MAĞAZASI A.Ş.",
        branch: "Kadıköy Merkez Şubesi",
        address: "Bağdat Caddesi No: 124 Kadıköy / İstanbul",
        phone: "0216 444 0 555",
        taxNumber: "9870123456",
      },
    }
    setReceiptData(printPayload)
    setIsReceiptModalOpen(true)
  }

  // Detay Modalı Açma
  const handleViewDetails = (ticket: ServiceTicketDisplay) => {
    setSelectedTicketForDetail(ticket)
    setIsDetailModalOpen(true)
  }

  // Gün 24: Teslimat Modalı Açma
  const handleOpenDeliverModal = (ticket: ServiceTicketDisplay) => {
    setSelectedTicketForAction(ticket)
    setIsDeliveryModalOpen(true)
  }

  // Gün 24: Müşteri Bildirimi Modalı Açma
  const handleOpenNotifyModal = (ticket: ServiceTicketDisplay) => {
    setSelectedTicketForAction(ticket)
    setIsNotifyModalOpen(true)
  }

  // Gün 24: Teslimat ve Kasa Tahsilatı Başarılı
  const handleDeliverySuccess = (result: ServiceDeliveryResult, updatedTicket: ServiceTicketDisplay) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    )
    if (selectedTicketForDetail && selectedTicketForDetail.id === updatedTicket.id) {
      setSelectedTicketForDetail(updatedTicket)
    }
  }

  // Gün 24: Teslim Fişi / Makbuzunu Yazdır
  const handlePrintDeliveryReceipt = (
    result: ServiceDeliveryResult,
    payload: ServiceDeliveryCheckoutPayload
  ) => {
    if (!selectedTicketForAction) return
    const receipt = formatServiceDeliveryToReceipt(selectedTicketForAction, payload)
    setUniversalReceiptData(receipt)
    setIsUniversalReceiptOpen(true)
  }

  // Filtreleme Mantığı
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        t.ticket_number.toLowerCase().includes(q) ||
        t.customer_name.toLowerCase().includes(q) ||
        t.customer_phone.includes(q) ||
        t.device_brand.toLowerCase().includes(q) ||
        t.device_model.toLowerCase().includes(q) ||
        (t.imei && t.imei.includes(q)) ||
        t.issue_description.toLowerCase().includes(q)

      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter
      const matchesBrand = brandFilter === "all" || t.device_brand.toLowerCase() === brandFilter.toLowerCase()

      return matchesSearch && matchesPriority && matchesBrand
    })
  }, [tickets, searchQuery, priorityFilter, brandFilter])

  // İstatistikler
  const stats = useMemo(() => {
    const total = tickets.length
    const bekleyen = tickets.filter((t) => t.status === "bekliyor").length
    const islemde = tickets.filter((t) => t.status === "islemde").length
    const parcaBekliyor = tickets.filter((t) => t.status === "parca_bekliyor").length
    const tamamlandi = tickets.filter((t) => t.status === "tamamlandi").length
    const totalVolume = tickets.reduce((sum, t) => sum + (Number(t.estimated_cost) || 0), 0)

    return { total, bekleyen, islemde, parcaBekliyor, tamamlandi, totalVolume }
  }, [tickets])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Mevcut benzersiz markalar
  const availableBrands = useMemo(() => {
    const set = new Set<string>()
    tickets.forEach((t) => {
      if (t.device_brand) set.add(t.device_brand)
    })
    return Array.from(set)
  }, [tickets])

  return (
    <div className="space-y-6 pb-12">
      {/* 1. ÜST BAŞLIK ALANI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/40 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Teknik Servis Kanban Panosu
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold font-mono">
                  {stats.total} Cihaz
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Tamir bekleyen cihazların, arızaların ve durumların takibi (Gün 22)
              </p>
            </div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex items-center gap-2.5">
          {/* Görünüm Değiştirici */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "kanban"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Kanban Panosu"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pano</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Tablo / Liste Görünümü"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablo</span>
            </button>
          </div>

          {/* Yenile Butonu */}
          <Button
            size="sm"
            variant="outline"
            onClick={loadTickets}
            disabled={isLoading}
            className="h-9 border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5 text-xs"
            title="Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden sm:inline">Yenile</span>
          </Button>

          {/* Cihaz Geçmişi & IMEI Sorgulama Butonu */}
          <Link href="/dashboard/service/history">
            <Button
              size="sm"
              variant="outline"
              className="h-9 border-slate-800 bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white font-semibold gap-1.5 text-xs px-3"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Cihaz / IMEI Geçmişi</span>
            </Button>
          </Link>

          {/* Yeni Servis Kaydı Aç Butonu */}
          <Link href="/dashboard/service/new">
            <Button
              size="sm"
              className="h-9 bg-cyan-600 hover:bg-cyan-500 text-white font-bold gap-1.5 shadow-md shadow-cyan-600/20 text-xs px-3.5"
            >
              <Plus className="w-4 h-4" />
              Yeni Servis Fişi Aç
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. DURUM SAYAÇLARI & İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Bekleyen */}
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-amber-800/40 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bekliyor</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400">
            {stats.bekleyen} <span className="text-xs font-normal text-slate-400">cihaz</span>
          </div>
          <p className="text-[10px] text-slate-500">Kabul & sıra bekliyor</p>
        </div>

        {/* İşlemde */}
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-cyan-800/40 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>İşlemde</span>
            <Wrench className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-black text-cyan-400">
            {stats.islemde} <span className="text-xs font-normal text-slate-400">cihaz</span>
          </div>
          <p className="text-[10px] text-slate-500">Masa üstünde onarımda</p>
        </div>

        {/* Parça Bekliyor */}
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-purple-800/40 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Parça Bekliyor</span>
            <Boxes className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-400">
            {stats.parcaBekliyor} <span className="text-xs font-normal text-slate-400">cihaz</span>
          </div>
          <p className="text-[10px] text-slate-500">Tedarikçi kargosu</p>
        </div>

        {/* Tamamlandı */}
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-800/40 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tamamlandı</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400">
            {stats.tamamlandi} <span className="text-xs font-normal text-slate-400">cihaz</span>
          </div>
          <p className="text-[10px] text-slate-500">Teslimata hazır</p>
        </div>

        {/* Toplam Ciro Hacmi */}
        <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Servis Hacmi</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-black text-white">
            {formatCurrency(stats.totalVolume)}
          </div>
          <p className="text-[10px] text-slate-500">Toplam tahmini işlem</p>
        </div>
      </div>

      {/* 3. ARAMA VE FİLTRELEME ÇUBUĞU */}
      <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Arama Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Fiş No, müşteri, IMEI, model veya arıza ara..."
            className="pl-9 h-9 bg-slate-950 border-slate-700 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Filtre Seçiciler */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Öncelik Filtresi */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 text-xs font-medium focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="critical">Acil / Kritik</option>
            <option value="high">Yüksek Öncelik</option>
            <option value="normal">Normal Öncelik</option>
          </select>

          {/* Marka Filtresi */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 text-xs font-medium focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">Tüm Markalar</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Temizle Butonu */}
          {(searchQuery || priorityFilter !== "all" || brandFilter !== "all") && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchQuery("")
                setPriorityFilter("all")
                setBrandFilter("all")
              }}
              className="h-9 text-xs text-slate-400 hover:text-white"
            >
              Temizle
            </Button>
          )}
        </div>
      </div>

      {/* 4. ANA İÇERİK: KANBAN PANOSU VEYA TABLO GÖRÜNÜMÜ */}
      {viewMode === "kanban" ? (
        /* KANBAN SÜTUNLARI */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((colConfig) => {
            const columnTickets = filteredTickets.filter((t) => t.status === colConfig.id)
            return (
              <KanbanColumn
                key={colConfig.id}
                config={colConfig}
                tickets={columnTickets}
                onStatusChange={handleStatusChange}
                onPrintTicket={handlePrintTicket}
                onViewDetails={handleViewDetails}
                onDeliverTicket={handleOpenDeliverModal}
                onNotifyCustomer={handleOpenNotifyModal}
              />
            )
          })}
        </div>
      ) : (
        /* TABLO GÖRÜNÜMÜ */
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Takip No / Tarih</th>
                  <th className="py-3 px-4">Müşteri</th>
                  <th className="py-3 px-4">Cihaz / IMEI</th>
                  <th className="py-3 px-4">Şikayet</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4">Maliyet</th>
                  <th className="py-3 px-4 text-right">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Arama kriterlerine uygun servis bileti bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-cyan-400">
                          {ticket.ticket_number}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(ticket.created_at).toLocaleDateString("tr-TR")}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{ticket.customer_name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{ticket.customer_phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {ticket.device_brand} {ticket.device_model}
                        </div>
                        {ticket.imei && (
                          <div className="text-[10px] font-mono text-slate-400">IMEI: {ticket.imei}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate text-slate-300 font-medium">{ticket.issue_description}</div>
                        {ticket.issue_category && (
                          <span className="text-[10px] text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded">
                            {ticket.issue_category}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value as KanbanColumnId)}
                          className="px-2 py-1 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 text-xs font-semibold focus:ring-1 focus:ring-cyan-500"
                        >
                          <option value="bekliyor">Bekliyor</option>
                          <option value="islemde">İşlemde</option>
                          <option value="parca_bekliyor">Parça Bekliyor</option>
                          <option value="tamamlandi">Tamamlandı</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {formatCurrency(ticket.estimated_cost)}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <Link href={`/dashboard/service/${ticket.id}`} title="Parça & İşçilik Yönet">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800"
                          >
                            <Wrench className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetails(ticket)}
                          className="h-8 px-2 text-slate-400 hover:text-white"
                          title="Hızlı İnceleme"
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePrintTicket(ticket)}
                          className="h-8 px-2 text-slate-400 hover:text-emerald-400"
                          title="Fiş Yazdır"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODALLAR */}
      {/* Detay Modalı */}
      <ServiceDetailModal
        ticket={selectedTicketForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onStatusChange={handleStatusChange}
        onPrintTicket={handlePrintTicket}
      />

      {/* Yazdırılabilir Servis Kabul Fişi Modalı */}
      <ServiceTicketModal
        data={receiptData}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onNewTicket={() => {
          setIsReceiptModalOpen(false)
        }}
      />

      {/* Gün 24: Müşteri Onarım Bildirimi Modalı (WhatsApp / SMS) */}
      <CustomerNotificationModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        ticket={selectedTicketForAction}
        actualCost={selectedTicketForAction?.actual_cost || selectedTicketForAction?.estimated_cost || 0}
        onProceedToDelivery={() => {
          setIsNotifyModalOpen(false)
          setIsDeliveryModalOpen(true)
        }}
      />

      {/* Gün 24: Cihaz Teslimi ve Kasa Tahsilat Modalı (Checkout) */}
      <ServiceDeliveryModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        ticket={selectedTicketForAction}
        actualCost={selectedTicketForAction?.actual_cost || selectedTicketForAction?.estimated_cost || 0}
        onSuccess={handleDeliverySuccess}
        onPrintReceipt={handlePrintDeliveryReceipt}
      />

      {/* Gün 20 & 24: 80mm Termal Makbuz Çıktı Modalı */}
      <UniversalReceiptModal
        isOpen={isUniversalReceiptOpen}
        onClose={() => setIsUniversalReceiptOpen(false)}
        data={universalReceiptData}
      />
    </div>
  )
}
