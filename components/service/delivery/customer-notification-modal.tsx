"use client"

import React, { useState } from "react"
import { 
  X, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  PhoneCall, 
  ArrowRight, 
  Smartphone, 
  DollarSign, 
  ExternalLink,
  ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceTicketDisplay, generateCompletionNotificationText } from "@/types/service"

interface CustomerNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: ServiceTicketDisplay | null
  actualCost: number
  onProceedToDelivery?: () => void
}

export function CustomerNotificationModal({
  isOpen,
  onClose,
  ticket,
  actualCost,
  onProceedToDelivery,
}: CustomerNotificationModalProps) {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "sms">("whatsapp")
  const [copied, setCopied] = useState(false)

  if (!isOpen || !ticket) return null

  const cost = actualCost || ticket.actual_cost || ticket.estimated_cost || 0
  const cleanPhone = (ticket.customer_phone || "").replace(/[^0-9]/g, "")
  const internationalPhone = cleanPhone.startsWith("90")
    ? cleanPhone
    : cleanPhone.startsWith("0")
    ? `9${cleanPhone}`
    : `90${cleanPhone}`

  const messageText = generateCompletionNotificationText({
    customerName: ticket.customer_name,
    customerPhone: ticket.customer_phone,
    ticketNumber: ticket.ticket_number,
    deviceBrand: ticket.device_brand,
    deviceModel: ticket.device_model,
    totalAmount: cost,
    storeName: "Phone Store Kadıköy Teknik Servis",
    storePhone: "0212 555 00 24",
    storeAddress: "Bağdat Cad. No:42/A Kadıköy / İstanbul",
  })

  // SMS için daha kısa ve öz format
  const smsText = `Sayın ${ticket.customer_name}, ${ticket.device_brand} ${ticket.device_model} cihazınızın onarımı tamamlanmıştır. Tutar: ₺${cost.toLocaleString("tr-TR")}. Fiş No: ${ticket.ticket_number}. Mağazamızdan teslim alabilirsiniz. Phone Store: 0212 555 00 24`

  const activeMessage = activeTab === "whatsapp" ? messageText : smsText

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
    }
  }

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(messageText)}`
    window.open(url, "_blank")
  }

  const handleOpenSMS = () => {
    const url = `sms:${ticket.customer_phone}?body=${encodeURIComponent(smsText)}`
    window.open(url, "_blank")
  }

  const handleCall = () => {
    window.open(`tel:${ticket.customer_phone}`, "_self")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Başlığı */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Müşteri Onarım Bildirimi
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tamamlandı
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {ticket.customer_name} • {ticket.device_brand} {ticket.device_model}
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

        {/* Cihaz ve Tutar Bilgi Şeridi */}
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="font-medium">{ticket.ticket_number}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Tahsil Edilecek:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              ₺{cost.toLocaleString("tr-TR")}
            </span>
          </div>
        </div>

        {/* İçerik */}
        <div className="p-5 space-y-4">
          {/* Kanal Seçim Sekmeleri */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "whatsapp"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              WhatsApp Mesajı
            </button>
            <button
              onClick={() => setActiveTab("sms")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "sms"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              SMS Mesajı
            </button>
          </div>

          {/* Mesaj Önizleme Kutusu */}
          <div className="relative">
            <div className={`p-4 rounded-xl border text-xs leading-relaxed font-sans select-all ${
              activeTab === "whatsapp"
                ? "bg-emerald-950/20 border-emerald-800/50 text-emerald-100"
                : "bg-cyan-950/20 border-cyan-800/50 text-cyan-100"
            }`}>
              <pre className="whitespace-pre-wrap font-sans text-xs">
                {activeMessage}
              </pre>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                Alıcı: <strong className="text-slate-200">{ticket.customer_phone}</strong>
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium py-0.5 px-1.5 rounded hover:bg-cyan-950/40 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Metni Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Hızlı Eylem Butonları */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {activeTab === "whatsapp" ? (
              <Button
                onClick={handleOpenWhatsApp}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-600/20"
              >
                <ExternalLink className="w-4 h-4" />
                WhatsApp Web / Uygulama Aç
              </Button>
            ) : (
              <Button
                onClick={handleOpenSMS}
                className="w-full h-10 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs gap-2 shadow-lg shadow-cyan-600/20"
              >
                <ExternalLink className="w-4 h-4" />
                SMS Uygulamasını Aç
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleCall}
              className="w-full h-10 border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-200 font-semibold text-xs gap-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              Müşteriyi Ara ({ticket.customer_phone})
            </Button>
          </div>
        </div>

        {/* Modal Altı - Teslimat Akışına İlerleme */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs"
          >
            Kapat
          </Button>

          {onProceedToDelivery && (
            <Button
              onClick={() => {
                onClose()
                onProceedToDelivery()
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs gap-2 shadow-md shadow-emerald-600/25"
            >
              <DollarSign className="w-4 h-4" />
              <span>Teslim Et & Tahsilat Yap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
