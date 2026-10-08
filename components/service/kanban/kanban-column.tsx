"use client"

import React from "react"
import Link from "next/link"
import { 
  Clock, 
  Wrench, 
  Boxes, 
  CheckCircle2, 
  Plus, 
  AlertCircle 
} from "lucide-react"
import { KanbanColumnConfig, ServiceTicketDisplay, KanbanColumnId } from "@/types/service"
import { KanbanTicketCard } from "./kanban-ticket-card"

interface KanbanColumnProps {
  config: KanbanColumnConfig
  tickets: ServiceTicketDisplay[]
  onStatusChange: (ticketId: string, newStatus: KanbanColumnId) => void
  onPrintTicket: (ticket: ServiceTicketDisplay) => void
  onViewDetails: (ticket: ServiceTicketDisplay) => void
  onDeliverTicket?: (ticket: ServiceTicketDisplay) => void
  onNotifyCustomer?: (ticket: ServiceTicketDisplay) => void
}

export function KanbanColumn({
  config,
  tickets,
  onStatusChange,
  onPrintTicket,
  onViewDetails,
  onDeliverTicket,
  onNotifyCustomer,
}: KanbanColumnProps) {
  // Kolon ikonunu seç
  const getColumnIcon = () => {
    switch (config.id) {
      case "bekliyor":
        return <Clock className="w-4 h-4 text-amber-400" />
      case "islemde":
        return <Wrench className="w-4 h-4 text-cyan-400" />
      case "parca_bekliyor":
        return <Boxes className="w-4 h-4 text-purple-400" />
      case "tamamlandi":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    }
  }

  // Kolondaki toplam tahmini tutar
  const totalCost = tickets.reduce((sum, t) => sum + (Number(t.estimated_cost) || 0), 0)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className={`flex flex-col bg-slate-900/60 rounded-2xl border ${config.columnBorder} overflow-hidden shadow-lg min-w-[280px] lg:min-w-0 flex-1`}>
      {/* Kolon Başlığı */}
      <div className={`p-3.5 border-b border-slate-800 ${config.headerBg}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              {getColumnIcon()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {config.title}
                </h3>
                <span className={`px-2 py-0.2 rounded-full text-[11px] font-bold border ${config.badgeClass}`}>
                  {tickets.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {config.subtitle}
              </p>
            </div>
          </div>

          {/* Kolon toplam tutarı */}
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Hacim</span>
            <span className="font-mono text-xs font-bold text-white">
              {formatCurrency(totalCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Biletler Listesi */}
      <div className="p-3 flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[380px]">
        {tickets.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-slate-800/80 bg-slate-950/30">
            <AlertCircle className="w-6 h-6 text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-400">Bu aşamada bilet yok</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {config.id === "bekliyor" ? "Yeni kabul edilen cihazlar burada listelenir." : "Durumu bu sütuna taşınan cihazlar görünür."}
            </p>
            {config.id === "bekliyor" && (
              <Link href="/dashboard/service/new" className="mt-3">
                <button className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900 font-medium flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  Yeni Bilet Aç
                </button>
              </Link>
            )}
          </div>
        ) : (
          tickets.map((ticket) => (
            <KanbanTicketCard
              key={ticket.id}
              ticket={ticket}
              onStatusChange={onStatusChange}
              onPrintTicket={onPrintTicket}
              onViewDetails={onViewDetails}
              onDeliverTicket={onDeliverTicket}
              onNotifyCustomer={onNotifyCustomer}
            />
          ))
        )}
      </div>

      {/* Kolon Altı: Yeni Bilet Aç Butonu (yalnızca Bekliyor kolonunda) */}
      {config.id === "bekliyor" && (
        <div className="p-2.5 border-t border-slate-800 bg-slate-950/40">
          <Link href="/dashboard/service/new" className="block">
            <button className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/60 text-xs font-medium text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-1.5 transition-all">
              <Plus className="w-3.5 h-3.5" />
              Yeni Servis Kaydı Aç
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
