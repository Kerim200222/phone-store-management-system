"use client"

import React, { useState, useMemo, useEffect } from "react"
import { 
  X, 
  DollarSign, 
  CheckCircle2, 
  CreditCard, 
  Banknote, 
  Building2, 
  Layers, 
  ShieldCheck, 
  UserCheck, 
  Printer, 
  ArrowRight, 
  AlertCircle,
  FileCheck,
  Smartphone,
  Wrench,
  Boxes
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  ServiceTicketDisplay, 
  ServiceDeliveryCheckoutPayload, 
  ServiceDeliveryResult 
} from "@/types/service"
import { PaymentMethod } from "@/types/database"
import { completeAndDeliverServiceTicket } from "@/lib/service-ticket-service"

interface ServiceDeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: ServiceTicketDisplay | null
  actualCost: number
  onSuccess: (result: ServiceDeliveryResult, updatedTicket: ServiceTicketDisplay) => void
  onPrintReceipt?: (result: ServiceDeliveryResult, payload: ServiceDeliveryCheckoutPayload) => void
}

export function ServiceDeliveryModal({
  isOpen,
  onClose,
  ticket,
  actualCost,
  onSuccess,
  onPrintReceipt,
}: ServiceDeliveryModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [warrantyMonths, setWarrantyMonths] = useState<number>(6)
  const [deliveredTo, setDeliveredTo] = useState<string>("")
  const [deliveryNotes, setDeliveryNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Başarı ekranı durumu
  const [completedResult, setCompletedResult] = useState<ServiceDeliveryResult | null>(null)
  const [lastPayload, setLastPayload] = useState<ServiceDeliveryCheckoutPayload | null>(null)

  // Varsayılan müşteri adını teslim alan kişiye ata
  useEffect(() => {
    if (ticket) {
      setDeliveredTo(ticket.customer_name || "")
      setDeliveryNotes("Cihaz müşteri huzurunda test edildi, sorunsuz çalışır vaziyette teslim edildi.")
      setDiscountAmount(0)
      setCompletedResult(null)
      setLastPayload(null)
      setErrorMessage(null)
    }
  }, [ticket])

  if (!isOpen || !ticket) return null

  const baseCost = actualCost || ticket.actual_cost || ticket.estimated_cost || 0
  const netAmount = Math.max(0, baseCost - discountAmount)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleDeliverySubmit = async () => {
    if (!ticket) return
    if (!deliveredTo.trim()) {
      setErrorMessage("Lütfen cihazı teslim alan kişinin adını giriniz.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    const payload: ServiceDeliveryCheckoutPayload = {
      ticketId: ticket.id,
      ticketNumber: ticket.ticket_number,
      customerId: ticket.customer_id,
      customerName: ticket.customer_name,
      customerPhone: ticket.customer_phone,
      deviceBrand: ticket.device_brand,
      deviceModel: ticket.device_model,
      imei: ticket.imei,
      paymentMethod,
      totalAmount: baseCost,
      discountAmount,
      netAmount,
      paidAmount: netAmount,
      warrantyPeriodMonths: warrantyMonths,
      warrantyNotes: warrantyMonths > 0 ? `${warrantyMonths} Ay Servis Garantisi` : "Garantisiz",
      deliveredTo: deliveredTo.trim(),
      internalNotes: deliveryNotes.trim(),
      technicianNotes: ticket.technician_notes || undefined,
    }

    try {
      const result = await completeAndDeliverServiceTicket(payload)
      if (result.success) {
        setCompletedResult(result)
        setLastPayload(payload)
        
        const updatedTicket: ServiceTicketDisplay = {
          ...ticket,
          status: "teslim_edildi",
          delivered_at: result.deliveredAt || new Date().toISOString(),
          transaction_number: result.transactionNumber || null,
          actual_cost: baseCost,
        }
        onSuccess(result, updatedTicket)
      } else {
        setErrorMessage(result.error || "Teslimat işlemi sırasında bir hata oluştu.")
      }
    } catch (err) {
      console.warn("Teslimat onay hatası:", err)
      setErrorMessage("Beklenmeyen bir hata oluştu.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 1. BAŞARI EKRANI
  if (completedResult && lastPayload) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Cihaz Teslim Edildi & Tahsilat Kasaya İşlendi!
            </h2>
            <p className="text-xs text-slate-400">
              {ticket.ticket_number} nolu servis kaydı tamamlanmış ve teknik servis geliri kaydedilmiştir.
            </p>
          </div>

          {/* Özet Bilgiler */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2.5 text-left">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Kasa İşlem No (Trx):</span>
              <span className="font-mono font-bold text-cyan-300">{completedResult.transactionNumber}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Teslim Alan:</span>
              <span className="font-bold text-white">{lastPayload.deliveredTo}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Ödeme Yöntemi:</span>
              <span className="font-bold text-slate-200 uppercase">{lastPayload.paymentMethod}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-300 font-bold">Kasaya Giren Net Tutar:</span>
              <span className="font-mono font-black text-emerald-400 text-base">
                {formatCurrency(lastPayload.netAmount)}
              </span>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {onPrintReceipt && (
              <Button
                onClick={() => onPrintReceipt(completedResult, lastPayload)}
                className="w-full sm:flex-1 h-11 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs gap-2 shadow-lg shadow-cyan-600/25"
              >
                <Printer className="w-4 h-4" />
                80mm Termal Makbuz Yazdır
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto h-11 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-6"
            >
              Tamamla & Kapat
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 2. TAHSİLAT VE TESLİMAT FORMU
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Başlığı */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Cihaz Teslimi ve Kasa Tahsilatı
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Kasa Girişi
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {ticket.ticket_number} • {ticket.customer_name} ({ticket.customer_phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Gövdesi */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-140px)]">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Cihaz ve Kalem Özeti */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                {ticket.device_brand} {ticket.device_model}
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                {ticket.imei ? `IMEI: ${ticket.imei}` : "IMEI Belirtilmedi"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-850 text-[11px]">
              <div className="text-slate-400 flex items-center gap-1">
                <Boxes className="w-3.5 h-3.5 text-purple-400" />
                Parça Kalemleri: <strong className="text-slate-200">{ticket.parts_used?.length || 0} Adet</strong>
              </div>
              <div className="text-slate-400 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                İşçilik: <strong className="text-slate-200">{formatCurrency(ticket.labor_cost || 0)}</strong>
              </div>
            </div>
          </div>

          {/* Maliyet ve İskonto Hesaplama */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">İşlem ve Parça Toplamı:</span>
              <span className="font-mono font-bold text-slate-200 text-sm">{formatCurrency(baseCost)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-xs text-slate-400">İskonto / İndirim (TL):</label>
              <div className="w-36 relative">
                <input
                  type="number"
                  min="0"
                  max={baseCost}
                  value={discountAmount || ""}
                  placeholder="0"
                  onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full h-9 px-3 rounded-lg border border-slate-700 bg-slate-900 text-right font-mono font-bold text-white text-xs focus:ring-2 focus:ring-cyan-500"
                />
                <span className="absolute left-2.5 top-2 text-slate-500 text-xs font-bold">₺</span>
              </div>
            </div>

            {/* Tahsil Edilecek Net Tutar */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide block">
                  Kasaya Tahsil Edilecek Net Tutar:
                </span>
                <span className="text-[10px] text-slate-500">KDV Dahil Nihai Tutar</span>
              </div>
              <div className="font-mono font-black text-2xl text-emerald-400 tracking-tight">
                {formatCurrency(netAmount)}
              </div>
            </div>
          </div>

          {/* Ödeme Yöntemi Seçimi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Ödeme Yöntemi:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  paymentMethod === "cash"
                    ? "bg-emerald-950/50 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500 shadow-md shadow-emerald-950/30"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>Nakit (Kasa)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("credit_card")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  paymentMethod === "credit_card"
                    ? "bg-cyan-950/50 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500 shadow-md shadow-cyan-950/30"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <span>Kredi Kartı / POS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("bank_transfer")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  paymentMethod === "bank_transfer"
                    ? "bg-blue-950/50 border-blue-500 text-blue-300 ring-1 ring-blue-500 shadow-md shadow-blue-950/30"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>Havale / EFT</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("on_account")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  paymentMethod === "on_account"
                    ? "bg-amber-950/50 border-amber-500 text-amber-300 ring-1 ring-amber-500 shadow-md shadow-amber-950/30"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Cari / Veresiye</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("split")}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all sm:col-span-2 ${
                  paymentMethod === "split"
                    ? "bg-purple-950/50 border-purple-500 text-purple-300 ring-1 ring-purple-500 shadow-md shadow-purple-950/30"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <DollarSign className="w-4 h-4 text-purple-400" />
                <span>Parçalı Ödeme (Nakit + Kart)</span>
              </button>
            </div>
          </div>

          {/* Garanti ve Teslim Alan Bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Servis Garanti Süresi:
              </label>
              <select
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-slate-700 bg-slate-950 text-xs font-bold text-slate-200 focus:ring-2 focus:ring-cyan-500"
              >
                <option value={1}>1 Ay Servis Garantisi</option>
                <option value={3}>3 Ay Servis Garantisi</option>
                <option value={6}>6 Ay (Standart Parça Garantisi)</option>
                <option value={12}>12 Ay (1 Yıl Kapsamlı Garanti)</option>
                <option value={0}>Garantisiz Teslimat</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Cihazı Teslim Alan Kişi:
              </label>
              <input
                type="text"
                value={deliveredTo}
                onChange={(e) => setDeliveredTo(e.target.value)}
                placeholder="Müşteri Ad Soyad"
                className="w-full h-9 px-3 rounded-lg border border-slate-700 bg-slate-950 text-xs font-semibold text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Teslimat Notu */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 block">
              Teslimat & Kasa Açıklama Notu:
            </label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Müşteriye bilgi notu veya kasa açıklaması..."
              className="w-full h-9 px-3 rounded-lg border border-slate-700 bg-slate-950 text-xs text-slate-300 focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Kasa İşlem Bilgilendirme Bannerı */}
          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/50 flex items-start gap-2.5 text-xs text-cyan-200">
            <FileCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-white block font-semibold">Kasaya Otomatik Kayıt Yapılacak:</strong>
              Bu işlem onaylandığında <code>transactions</code> tablosuna <strong>repair_payment</strong> (Teknik Servis Geliri) olarak <strong>{formatCurrency(netAmount)}</strong> tutarında kayıt açılacak ve bilet durumu <strong>Teslim Edildi</strong> olacaktır.
            </div>
          </div>
        </div>

        {/* Modal Altı Butonlar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white text-xs"
          >
            Vazgeç
          </Button>

          <Button
            onClick={handleDeliverySubmit}
            disabled={isSubmitting}
            className="h-11 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-600/25"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Kasaya Kaydediliyor...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Teslim Et & Tahsilatı Kaydet ({formatCurrency(netAmount)})</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
