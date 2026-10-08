"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Smartphone, 
  User, 
  Phone, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  Tag,
  RefreshCw,
  Printer,
  DollarSign,
  MessageSquare,
  History
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { 
  ServiceTicketDisplay, 
  KanbanColumnId, 
  UpdateTicketCostPayload, 
  ServiceTicketReceiptData,
  ServiceDeliveryCheckoutPayload,
  ServiceDeliveryResult
} from "@/types/service"
import { RepairPartItem } from "@/types/database"
import { UniversalReceiptData } from "@/types/receipt"
import { 
  getServiceTicketById, 
  updateServiceTicketCostsAndParts,
  markServiceTicketAsCompleted
} from "@/lib/service-ticket-service"
import { formatServiceDeliveryToReceipt } from "@/lib/receipt-formatter"
import { PartsTable } from "@/components/service/parts/parts-table"
import { PartsSelectorModal } from "@/components/service/parts/parts-selector-modal"
import { LaborCostManager } from "@/components/service/labor/labor-cost-manager"
import { CostSummaryCard } from "@/components/service/cost-summary-card"
import { ServiceTicketModal } from "@/components/service/service-ticket-modal"
import { CustomerNotificationModal } from "@/components/service/delivery/customer-notification-modal"
import { ServiceDeliveryModal } from "@/components/service/delivery/service-delivery-modal"
import { UniversalReceiptModal } from "@/components/receipt/universal-receipt-modal"

export default function ServiceTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<ServiceTicketDisplay | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  // Düzenlenebilir Durumlar
  const [parts, setParts] = useState<RepairPartItem[]>([])
  const [laborCost, setLaborCost] = useState<number>(0)
  const [technicianNotes, setTechnicianNotes] = useState<string>("")
  const [status, setStatus] = useState<KanbanColumnId>("islemde")

  // Modallar
  const [isPartsModalOpen, setIsPartsModalOpen] = useState(false)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<ServiceTicketReceiptData | null>(null)

  // Gün 24: Teslimat ve Müşteri Bildirim Modalları
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false)
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false)
  const [isUniversalReceiptOpen, setIsUniversalReceiptOpen] = useState(false)
  const [universalReceiptData, setUniversalReceiptData] = useState<UniversalReceiptData | null>(null)

  // Kaydetme Durumu
  const [isSaving, setIsSaving] = useState(false)
  const [isSavedSuccess, setIsSavedSuccess] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Bilet Verisini Yükle
  const loadTicketData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getServiceTicketById(ticketId)
      if (data) {
        setTicket(data)
        setParts(data.parts_used || [])
        setLaborCost(Number(data.labor_cost) || 0)
        setTechnicianNotes(data.technician_notes || "")
        setStatus((data.status as KanbanColumnId) || "bekliyor")
      }
    } catch (err) {
      console.warn("Bilet detayı yüklenirken hata oluştu:", err)
    } finally {
      setIsLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    loadTicketData()
  }, [loadTicketData])

  // Canlı Hesaplanan Parça Toplamı
  const partsTotalCost = useMemo(() => {
    return parts.reduce((sum, p) => sum + (Number(p.total_price) || 0), 0)
  }, [parts])

  // Canlı Hesaplanan Genel Toplam (Parça + İşçilik)
  const actualCost = useMemo(() => {
    return partsTotalCost + (Number(laborCost) || 0)
  }, [partsTotalCost, laborCost])

  // Parça Ekleme Handler'ı
  const handleAddPart = (newPart: RepairPartItem) => {
    setParts((prev) => [...prev, newPart])
  }

  // Parça Miktarı Güncelleme
  const handleUpdatePartQuantity = (index: number, newQty: number) => {
    setParts((prev) => {
      const updated = [...prev]
      const current = updated[index]
      if (current) {
        const qty = Math.max(1, newQty)
        updated[index] = {
          ...current,
          quantity: qty,
          total_price: current.unit_price * qty,
        }
      }
      return updated
    })
  }

  // Parça Silme
  const handleRemovePart = (index: number) => {
    setParts((prev) => prev.filter((_, idx) => idx !== index))
  }

  // Supabase'e Kaydetme Handler'ı
  const handleSaveCosts = async () => {
    if (!ticket) return
    setIsSaving(true)
    setSaveMessage(null)

    const payload: UpdateTicketCostPayload = {
      parts_used: parts,
      parts_total_cost: partsTotalCost,
      labor_cost: laborCost,
      actual_cost: actualCost,
      technician_notes: technicianNotes,
      status: status,
    }

    try {
      const result = await updateServiceTicketCostsAndParts(ticket.id, payload)
      if (result.success) {
        setIsSavedSuccess(true)
        setSaveMessage(result.message || "Başarıyla kaydedildi.")
        setTicket((prev) =>
          prev
            ? {
                ...prev,
                parts_used: parts,
                parts_total_cost: partsTotalCost,
                labor_cost: laborCost,
                actual_cost: actualCost,
                technician_notes: technicianNotes,
                status: status,
              }
            : null
        )
        setTimeout(() => setIsSavedSuccess(false), 3000)
      }
    } catch (err) {
      console.warn("Kaydetme hatası:", err)
      setSaveMessage("Kayıt sırasında bir hata oluştu.")
    } finally {
      setIsSaving(false)
    }
  }

  // Fiş Yazdırma Modalı
  const handleOpenReceiptModal = () => {
    if (!ticket) return
    const receiptPayload: ServiceTicketReceiptData = {
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
        technicianNotes: technicianNotes || null,
        estimatedCost: actualCost,
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
    setReceiptData(receiptPayload)
    setIsReceiptModalOpen(true)
  }

  // Gün 24: Onarımı Tamamla (Durumu Tamamlandı Yap ve Bildirim Modalını Aç)
  const handleCompleteTicket = async () => {
    if (!ticket) return
    try {
      const res = await markServiceTicketAsCompleted(ticket.id, technicianNotes)
      if (res.success) {
        setStatus("tamamlandi")
        setTicket((prev) =>
          prev
            ? {
                ...prev,
                status: "tamamlandi",
                completed_at: new Date().toISOString(),
                technician_notes: technicianNotes,
              }
            : null
        )
        setIsSavedSuccess(true)
        setSaveMessage(res.message || "Cihaz onarımı tamamlandı olarak kaydedildi.")
        setTimeout(() => setIsSavedSuccess(false), 3000)
        setIsNotifyModalOpen(true)
      }
    } catch (err) {
      console.warn("Onarım tamamlama hatası:", err)
    }
  }

  // Gün 24: Teslimat Başarılı Olduğunda
  const handleDeliverySuccess = (result: ServiceDeliveryResult, updatedTicket: ServiceTicketDisplay) => {
    setTicket(updatedTicket)
    setStatus("tamamlandi")
    setIsSavedSuccess(true)
    setSaveMessage(result.message || "Cihaz teslim edildi ve teknik servis geliri kasaya kaydedildi.")
    setTimeout(() => setIsSavedSuccess(false), 4000)
  }

  // Gün 24: Teslimat Fişi / Makbuzunu Yazdır
  const handlePrintDeliveryReceipt = (
    result: ServiceDeliveryResult,
    payload: ServiceDeliveryCheckoutPayload
  ) => {
    if (!ticket) return
    const receipt = formatServiceDeliveryToReceipt(ticket, payload)
    setUniversalReceiptData(receipt)
    setIsUniversalReceiptOpen(true)
  }

  // Zaten teslim edilmiş cihaz için makbuz aç
  const handlePrintExistingDeliveryReceipt = () => {
    if (!ticket) return
    const payload: ServiceDeliveryCheckoutPayload = {
      ticketId: ticket.id,
      ticketNumber: ticket.ticket_number,
      customerId: ticket.customer_id,
      customerName: ticket.customer_name,
      customerPhone: ticket.customer_phone,
      deviceBrand: ticket.device_brand,
      deviceModel: ticket.device_model,
      imei: ticket.imei,
      paymentMethod: "cash",
      totalAmount: actualCost,
      discountAmount: 0,
      netAmount: actualCost,
      paidAmount: actualCost,
      warrantyPeriodMonths: 6,
      deliveredTo: ticket.customer_name,
    }
    const receipt = formatServiceDeliveryToReceipt(ticket, payload)
    setUniversalReceiptData(receipt)
    setIsUniversalReceiptOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Servis bilet detayları yükleniyor...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Servis Kaydı Bulunamadı</h2>
        <p className="text-xs text-slate-400">
          İstenen ID ({ticketId}) ile eşleşen bir servis bileti kaydı mevcut değil.
        </p>
        <Link href="/dashboard/service">
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white">
            Teknik Servis Panosuna Dön
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. ÜST GEZİNME VE BAŞLIK */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <Link
            href="/dashboard/service"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-medium transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Teknik Servis Panosuna Dön
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Servis Detayı:</span>
              <span className="font-mono text-cyan-400">{ticket.ticket_number}</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 uppercase">
              {status}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Kabul Tarihi: {new Date(ticket.created_at).toLocaleString("tr-TR")} • Teknisyen: {ticket.assigned_technician || "Genel Servis"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {ticket.status === "teslim_edildi" ? (
            <Button
              size="sm"
              onClick={handlePrintExistingDeliveryReceipt}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              Teslimat Makbuzu Yazdır
            </Button>
          ) : ticket.status === "tamamlandi" ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsNotifyModalOpen(true)}
                className="border-emerald-700 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs gap-1.5 font-bold"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                Müşteriye Bildir
              </Button>
              <Button
                size="sm"
                onClick={() => setIsDeliveryModalOpen(true)}
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-600/25"
              >
                <DollarSign className="w-3.5 h-3.5" />
                Teslim Et & Tahsilat
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={handleCompleteTicket}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Onarımı Tamamla
            </Button>
          )}

          {ticket.imei && (
            <Link href={`/dashboard/service/history?imei=${ticket.imei}`}>
              <Button
                size="sm"
                variant="outline"
                className="border-indigo-700/60 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 text-xs gap-1.5 font-medium"
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                Cihaz Geçmişi
              </Button>
            </Link>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenReceiptModal}
            className="border-slate-700 bg-slate-900 text-slate-200 hover:text-white text-xs gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            Kabul Fişi
          </Button>

          <Button
            size="sm"
            onClick={handleSaveCosts}
            disabled={isSaving}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-cyan-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </div>

      {/* Kaydedildi Bildirimi */}
      {saveMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* 2. CİHAZ VE MÜŞTERİ KÜNYE ŞERİDİ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Müşteri Bilgisi */}
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            Müşteri
          </span>
          <p className="font-bold text-white text-sm">{ticket.customer_name}</p>
          <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-400" />
            {ticket.customer_phone}
          </p>
        </div>

        {/* Cihaz Bilgisi */}
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              Cihaz & Model
            </span>
            {ticket.imei && (
              <Link
                href={`/dashboard/service/history?imei=${ticket.imei}`}
                className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline transition-colors"
                title="Cihazın tüm servis ve alım-satım geçmişini zaman çizelgesinde gör"
              >
                <History className="w-3 h-3" />
                Geçmiş
              </Link>
            )}
          </div>
          <p className="font-bold text-white text-sm">{ticket.device_brand} {ticket.device_model}</p>
          <p className="text-[11px] font-mono text-cyan-400 truncate">
            {ticket.imei ? `IMEI: ${ticket.imei}` : "IMEI Belirtilmedi"}
          </p>
        </div>

        {/* Cihaz Şifresi */}
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            Ekran Kilidi / Şifre
          </span>
          <div className="flex items-center justify-between">
            <p className="font-mono font-bold text-amber-300 text-sm">
              {showPassword ? (ticket.device_password || "Yok") : (ticket.device_password ? "••••••" : "Şifresiz")}
            </p>
            {ticket.device_password && ticket.device_password !== "Şifresiz / Ekran Kilidi Açık" && (
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white p-1"
                title={showPassword ? "Gizle" : "Göster"}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-500">Test ve kontrol için</p>
        </div>

        {/* Öncelik & Kategori */}
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-cyan-400" />
            Arıza Kategorisi
          </span>
          <p className="font-bold text-white text-sm">{ticket.issue_category || "Genel Bakım"}</p>
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
            Öncelik: {ticket.priority}
          </span>
        </div>
      </div>

      {/* 3. ANA 2 SÜTUNLU ÇALIŞMA ALANI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* SOL SÜTUN (2 Kolon): Arıza Bilgisi + Parçalar + İşçilik */}
        <div className="lg:col-span-2 space-y-6">
          {/* Müşteri Şikayeti ve Ekspertiz Özeti */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Müşteri Şikayeti & Fiziksel Durum</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 leading-relaxed">
                <span className="text-slate-400 font-bold block mb-1">Müşteri Beyanı:</span>
                {ticket.issue_description}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Kusur / Ekspertiz Notu:</span>
                  <p className="text-slate-300 text-xs mt-0.5">{ticket.physical_condition || "Belirtilmedi"}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Teslim Alınan Aksesuarlar:</span>
                  <p className="text-slate-300 text-xs mt-0.5">{ticket.has_accessories || "Yalnızca cihaz teslim alındı."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modül 1: Kullanılan Yedek Parçalar Tablosu */}
          <PartsTable
            parts={parts}
            onUpdateQuantity={handleUpdatePartQuantity}
            onRemovePart={handleRemovePart}
            onOpenSelectorModal={() => setIsPartsModalOpen(true)}
          />

          {/* Modül 2: Elden İşçilik Ücreti & Müdahale Notları */}
          <LaborCostManager
            laborCost={laborCost}
            onChangeLaborCost={setLaborCost}
            technicianNotes={technicianNotes}
            onChangeTechnicianNotes={setTechnicianNotes}
          />
        </div>

        {/* SAĞ SÜTUN (1 Kolon): Canlı Maliyet Dökümü & Kaydet */}
        <div className="lg:col-span-1">
          <CostSummaryCard
            partsTotalCost={partsTotalCost}
            laborCost={laborCost}
            actualCost={actualCost}
            estimatedCost={ticket.estimated_cost}
            status={ticket.status === "teslim_edildi" ? "teslim_edildi" : status}
            onChangeStatus={setStatus}
            onSave={handleSaveCosts}
            onPrint={handleOpenReceiptModal}
            isSaving={isSaving}
            isSavedSuccess={isSavedSuccess}
            onCompleteTicket={handleCompleteTicket}
            onNotifyCustomer={() => setIsNotifyModalOpen(true)}
            onDeliverCheckout={() => setIsDeliveryModalOpen(true)}
            isDelivered={ticket.status === "teslim_edildi"}
          />
        </div>
      </div>

      {/* 4. MODALLAR */}
      {/* Envanterden Parça Seçme Modalı */}
      <PartsSelectorModal
        isOpen={isPartsModalOpen}
        onClose={() => setIsPartsModalOpen(false)}
        onAddPart={handleAddPart}
        deviceBrand={ticket.device_brand}
        deviceModel={ticket.device_model}
      />

      {/* Servis Kabul / Çıktı Belgesi Modalı */}
      <ServiceTicketModal
        data={receiptData}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onNewTicket={() => {
          setIsReceiptModalOpen(false)
          router.push("/dashboard/service/new")
        }}
      />

      {/* Gün 24: Müşteri Onarım Bildirimi Modalı (WhatsApp / SMS) */}
      <CustomerNotificationModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        ticket={ticket}
        actualCost={actualCost}
        onProceedToDelivery={() => setIsDeliveryModalOpen(true)}
      />

      {/* Gün 24: Cihaz Teslimi ve Kasa Tahsilat Modalı (Checkout) */}
      <ServiceDeliveryModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        ticket={ticket}
        actualCost={actualCost}
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
