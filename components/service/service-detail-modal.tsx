"use client"

import React, { useState } from "react"
import { 
  X, 
  Smartphone, 
  User, 
  Phone, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Wrench, 
  Printer, 
  Save, 
  Tag 
} from "lucide-react"
import { ServiceTicketDisplay, KanbanColumnId } from "@/types/service"
import { Button } from "@/components/ui/button"

interface ServiceDetailModalProps {
  ticket: ServiceTicketDisplay | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (ticketId: string, newStatus: KanbanColumnId) => void
  onPrintTicket: (ticket: ServiceTicketDisplay) => void
}

export function ServiceDetailModal({
  ticket,
  isOpen,
  onClose,
  onStatusChange,
  onPrintTicket,
}: ServiceDetailModalProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [notes, setNotes] = useState(ticket?.technician_notes || "")
  const [isSavedNotes, setIsSavedNotes] = useState(false)

  if (!isOpen || !ticket) return null

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(val)
  }

  const handleSaveNotes = () => {
    setIsSavedNotes(true)
    setTimeout(() => setIsSavedNotes(false), 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "bekliyor":
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">Bekliyor</span>
      case "islemde":
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">İşlemde</span>
      case "parca_bekliyor":
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-950 text-purple-300 border border-purple-800">Parça Bekliyor</span>
      case "tamamlandi":
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">Tamamlandı</span>
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">{status}</span>
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Başlık */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/40 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Servis Kayıt Detayı: {ticket.ticket_number}
                </h2>
                {getStatusBadge(ticket.status)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Kabul: {new Date(ticket.created_at).toLocaleString("tr-TR")}</span>
                <span>•</span>
                <span>Teknisyen: {ticket.assigned_technician || "Genel Servis"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gövde */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-300">
          {/* Müşteri ve Cihaz Kartları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Müşteri Bilgisi */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Müşteri Bilgileri
              </span>
              <div className="space-y-1">
                <p className="font-bold text-white text-sm">{ticket.customer_name}</p>
                <p className="text-slate-400 flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  {ticket.customer_phone}
                </p>
                {ticket.customer_email && (
                  <p className="text-slate-400">{ticket.customer_email}</p>
                )}
              </div>
            </div>

            {/* Cihaz Bilgisi */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                Cihaz & Donanım
              </span>
              <div className="space-y-1">
                <p className="font-bold text-white text-sm">{ticket.device_brand} {ticket.device_model}</p>
                {ticket.imei && (
                  <p className="font-mono text-cyan-400 text-[11px]">IMEI: {ticket.imei}</p>
                )}
                {ticket.serial_number && (
                  <p className="font-mono text-slate-400 text-[11px]">Seri No: {ticket.serial_number}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cihaz Şifresi */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[11px] font-bold text-amber-300 block">Ekran Kilidi / Cihaz Şifresi:</span>
                <span className="font-mono font-bold text-amber-200 text-sm">
                  {showPassword ? (ticket.device_password || "Yok") : (ticket.device_password ? "••••••••" : "Şifresiz")}
                </span>
              </div>
            </div>

            {ticket.device_password && ticket.device_password !== "Şifresiz / Ekran Kilidi Açık" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPassword(!showPassword)}
                className="h-8 border-amber-800/60 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 text-xs gap-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? "Gizle" : "Görüntüle"}
              </Button>
            )}
          </div>

          {/* Şikayet & Arıza Açıklaması */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Müşteri Şikayeti / Arıza Beyanı
            </span>
            <p className="text-white text-xs leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              {ticket.issue_description}
            </p>
          </div>

          {/* Dış Görünüm & Teslim Alınan Aksesuarlar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Fiziksel Durum / Ekspertiz:</span>
              <p className="text-slate-200 text-xs mt-1">
                {ticket.physical_condition || "Belirgin çizik/darbe bildirilmedi."}
              </p>
            </div>
            <div className="space-y-1 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Teslim Alınan Aksesuarlar:</span>
              <p className="text-slate-200 text-xs mt-1">
                {ticket.has_accessories || "Yalnızca cihaz teslim alındı."}
              </p>
            </div>
          </div>

          {/* Teknisyen Notları Düzenleme */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">
              Teknisyen Müdahale & Teşhis Notları:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Yapılan işlemler, parça kodları, lehim kontrolleri..."
              className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSaveNotes}
                className="h-7 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 gap-1"
              >
                <Save className="w-3 h-3 text-cyan-400" />
                {isSavedNotes ? "Kaydedildi!" : "Notu Kaydet"}
              </Button>
            </div>
          </div>

          {/* Maliyet ve Durum Değiştirme */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Tahmini Onarım Bedeli</span>
              <span className="font-mono text-emerald-400 font-black text-lg">
                {formatCurrency(ticket.estimated_cost)}
              </span>
            </div>

            {/* Durum Değiştirici */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Durum:</span>
              <select
                value={ticket.status}
                onChange={(e) => onStatusChange(ticket.id, e.target.value as KanbanColumnId)}
                className="h-9 px-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-xs font-bold focus:ring-2 focus:ring-cyan-500"
              >
                <option value="bekliyor">🕒 Bekliyor</option>
                <option value="islemde">⚙️ İşlemde</option>
                <option value="parca_bekliyor">📦 Parça Bekliyor</option>
                <option value="tamamlandi">✅ Tamamlandı</option>
              </select>
            </div>
          </div>
        </div>

        {/* Alt Butonlar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={() => onPrintTicket(ticket)}
            className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs gap-1.5"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            Servis Kabul Fişi Yazdır
          </Button>

          <Button
            onClick={onClose}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-5"
          >
            Kapat
          </Button>
        </div>
      </div>
    </div>
  )
}
