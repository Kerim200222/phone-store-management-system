"use client"

import React, { useState } from "react"
import { 
  Smartphone, 
  User, 
  Phone, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Printer, 
  MoreVertical,
  CheckCircle2,
  Wrench,
  Boxes,
  Info
} from "lucide-react"
import { ServiceTicketDisplay, KanbanColumnId } from "@/types/service"
import { Button } from "@/components/ui/button"

interface KanbanTicketCardProps {
  ticket: ServiceTicketDisplay
  onStatusChange: (ticketId: string, newStatus: KanbanColumnId) => void
  onPrintTicket: (ticket: ServiceTicketDisplay) => void
  onViewDetails: (ticket: ServiceTicketDisplay) => void
}

export function KanbanTicketCard({
  ticket,
  onStatusChange,
  onPrintTicket,
  onViewDetails,
}: KanbanTicketCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  // Para birimi formatlama
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Geçen süre formatı
  const getTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    if (diffMinutes < 60) return `${Math.max(1, diffMinutes)} dk önce`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} sa önce`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} gün önce`
  }

  // Öncelik rozeti
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800/80 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Acil / Kritik
          </span>
        )
      case "high":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/80">
            Yüksek
          </span>
        )
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            Normal
          </span>
        )
    }
  }

  // Sıradaki durum belirleme
  const getNextStatus = (current: KanbanColumnId): KanbanColumnId | null => {
    if (current === "bekliyor") return "islemde"
    if (current === "islemde") return "tamamlandi"
    if (current === "parca_bekliyor") return "islemde"
    return null
  }

  // Önceki durum belirleme
  const getPrevStatus = (current: KanbanColumnId): KanbanColumnId | null => {
    if (current === "tamamlandi") return "islemde"
    if (current === "islemde") return "bekliyor"
    if (current === "parca_bekliyor") return "bekliyor"
    return null
  }

  const nextStatus = getNextStatus(ticket.status as KanbanColumnId)
  const prevStatus = getPrevStatus(ticket.status as KanbanColumnId)

  return (
    <div className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 shadow-md hover:shadow-xl transition-all duration-200 space-y-3">
      {/* 1. Başlık: Takip Kodu, Öncelik & Menü */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-mono text-[11px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50 truncate">
            {ticket.ticket_number}
          </span>
          {getPriorityBadge(ticket.priority)}
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            {getTimeAgo(ticket.created_at)}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Seçenekler"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showActionsMenu && (
            <div 
              className="absolute right-0 top-6 z-30 w-44 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1 text-xs text-slate-200"
              onMouseLeave={() => setShowActionsMenu(false)}
            >
              <button
                onClick={() => {
                  setShowActionsMenu(false)
                  onViewDetails(ticket)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
              >
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Detayları İncele
              </button>
              <button
                onClick={() => {
                  setShowActionsMenu(false)
                  onPrintTicket(ticket)
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                Servis Fişi Yazdır
              </button>
              <div className="border-t border-slate-800 my-1" />
              <div className="px-3 py-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Durumu Değiştir
              </div>
              <button
                onClick={() => {
                  setShowActionsMenu(false)
                  onStatusChange(ticket.id, "bekliyor")
                }}
                className={`w-full text-left px-3 py-1 hover:bg-slate-800 flex items-center gap-2 ${ticket.status === "bekliyor" ? "text-amber-400 font-bold" : ""}`}
              >
                <Clock className="w-3 h-3 text-amber-400" />
                Bekliyor
              </button>
              <button
                onClick={() => {
                  setShowActionsMenu(false)
                  onStatusChange(ticket.id, "islemde")
                }}
                className={`w-full text-left px-3 py-1 hover:bg-slate-800 flex items-center gap-2 ${ticket.status === "islemde" ? "text-cyan-400 font-bold" : ""}`}
              >
                <Wrench className="w-3 h-3 text-cyan-400" />
                İşlemde
              </button>
              <button
                onClick={() => {
                  setShowActionsMenu(false)
                  onStatusChange(ticket.id, "parca_bekliyor")
                }}
                className={`w-full text-left px-3 py-1 hover:bg-slate-800 flex items-center gap-2 ${ticket.status === "parca_bekliyor" ? "text-purple-400 font-bold" : ""}`}
              >
                <Boxes className="w-3 h-3 text-purple-400" />
                Parça Bekliyor
              </button>
              <button
                onClick={() => {
                  setShowActionsMenu(false)
                  onStatusChange(ticket.id, "tamamlandi")
                }}
                className={`w-full text-left px-3 py-1 hover:bg-slate-800 flex items-center gap-2 ${ticket.status === "tamamlandi" ? "text-emerald-400 font-bold" : ""}`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Tamamlandı
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Cihaz Modeli & Markası */}
      <div>
        <div className="flex items-center gap-1.5 text-white font-bold text-sm tracking-tight">
          <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate">{ticket.device_brand} {ticket.device_model}</span>
        </div>
        {ticket.imei && (
          <p className="text-[11px] font-mono text-slate-400 pl-5">
            IMEI: {ticket.imei}
          </p>
        )}
      </div>

      {/* 3. Müşteri Bilgisi */}
      <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 text-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-300 truncate">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold truncate">{ticket.customer_name}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0">
          <Phone className="w-3 h-3 text-emerald-400" />
          <span>{ticket.customer_phone}</span>
        </div>
      </div>

      {/* 4. Arıza & Şikayet */}
      <div className="space-y-1">
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {ticket.issue_description}
        </p>
        {ticket.issue_category && (
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 font-medium">
            {ticket.issue_category}
          </span>
        )}
      </div>

      {/* 5. Cihaz Şifresi (Göster / Gizle) */}
      <div className="flex items-center justify-between text-[11px] bg-slate-950/80 px-2 py-1.5 rounded border border-slate-800/80">
        <div className="flex items-center gap-1 text-slate-400">
          <KeyRound className="w-3 h-3 text-amber-400" />
          <span>Cihaz Şifresi:</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="font-bold text-amber-300">
            {showPassword 
              ? (ticket.device_password || "Yok") 
              : (ticket.device_password ? "••••••" : "Şifresiz")}
          </span>
          {ticket.device_password && ticket.device_password !== "Şifresiz / Ekran Kilidi Açık" && (
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-500 hover:text-slate-300 p-0.5"
              title={showPassword ? "Gizle" : "Göster"}
            >
              {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* 6. Alt Bilgi: Maliyet, Geçen Süre & Hızlı Geçiş Butonları */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-500 block">Tahmini Bedel</span>
          <span className="font-mono font-bold text-emerald-400 text-xs">
            {formatCurrency(ticket.estimated_cost)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Fiş Yazdır */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onPrintTicket(ticket)}
            className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
            title="Kabul Fişi Yazdır"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
          </Button>

          {/* Geri Taşı Butonu */}
          {prevStatus && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(ticket.id, prevStatus)}
              className="h-7 px-2 text-[11px] border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 gap-1"
              title="Önceki Aşamaya Geri Al"
            >
              <ArrowLeft className="w-3 h-3" />
            </Button>
          )}

          {/* İleri Taşı Butonu */}
          {nextStatus && (
            <Button
              size="sm"
              onClick={() => onStatusChange(ticket.id, nextStatus)}
              className="h-7 px-2.5 text-[11px] font-semibold bg-cyan-600 hover:bg-cyan-500 text-white gap-1 shadow-sm"
              title="Sonraki Aşamaya İlerlet"
            >
              <span>{nextStatus === "islemde" ? "İşleme Al" : nextStatus === "tamamlandi" ? "Tamamla" : "İlerlet"}</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
