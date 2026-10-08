"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { 
  ShoppingBag, 
  CreditCard, 
  Wrench, 
  Boxes, 
  CheckCircle2, 
  ShieldCheck, 
  RotateCcw, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Clock, 
  ExternalLink,
  ArrowUpDown
} from "lucide-react"
import { DeviceTimelineEvent } from "@/types/device-history"

interface DeviceHistoryTimelineProps {
  events: DeviceTimelineEvent[]
}

export function DeviceHistoryTimeline({ events }: DeviceHistoryTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "repair" | "trade" | "warranty">("all")
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc") // Varsayılan en yeniden eskiye
  const [expandedEventIds, setExpandedEventIds] = useState<Record<string, boolean>>({
    // Varsayılan olarak en son olayı açık tut
    [events[events.length - 1]?.id || ""]: true,
  })

  // Para birimi formatlayıcı
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Geçen zaman formatlayıcı
  const getRelativeTime = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "Bugün"
    if (diffDays === 1) return "Dün"
    if (diffDays < 30) return `${diffDays} gün önce`
    const diffMonths = Math.floor(diffDays / 30)
    if (diffMonths < 12) return `${diffMonths} ay önce`
    const diffYears = Math.floor(diffMonths / 12)
    return `${diffYears} yıl önce`
  }

  // Filtreleme
  const filteredEvents = useMemo(() => {
    let result = [...events]

    if (activeFilter === "repair") {
      result = result.filter((e) => 
        e.type === "repair_intake" || 
        e.type === "repair_parts_added" || 
        e.type === "repair_completed" || 
        e.type === "repair_delivered"
      )
    } else if (activeFilter === "trade") {
      result = result.filter((e) => e.type === "purchase" || e.type === "sale" || e.type === "return")
    } else if (activeFilter === "warranty") {
      result = result.filter((e) => e.type === "warranty_check" || e.metadata?.warrantyMonths)
    }

    // Sıralama
    result.sort((a, b) => {
      const timeA = new Date(a.date).getTime()
      const timeB = new Date(b.date).getTime()
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB
    })

    return result
  }, [events, activeFilter, sortOrder])

  // Akordeon Aç / Kapat
  const toggleAccordion = (id: string) => {
    setExpandedEventIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Olay Türüne Göre İkon ve Renk Seçimi
  const getEventVisuals = (event: DeviceTimelineEvent) => {
    switch (event.type) {
      case "purchase":
        return {
          icon: <ShoppingBag className="w-4 h-4 text-blue-400" />,
          nodeBg: "bg-blue-950 border-blue-500/80 shadow-blue-500/30",
          badgeBg: "bg-blue-950/80 text-blue-300 border-blue-700/60",
          cardBorder: "hover:border-blue-700/50",
        }
      case "sale":
        return {
          icon: <CreditCard className="w-4 h-4 text-emerald-400" />,
          nodeBg: "bg-emerald-950 border-emerald-500/80 shadow-emerald-500/30",
          badgeBg: "bg-emerald-950/80 text-emerald-300 border-emerald-700/60",
          cardBorder: "hover:border-emerald-700/50",
        }
      case "repair_intake":
        return {
          icon: <Wrench className="w-4 h-4 text-amber-400" />,
          nodeBg: "bg-amber-950 border-amber-500/80 shadow-amber-500/30",
          badgeBg: "bg-amber-950/80 text-amber-300 border-amber-700/60",
          cardBorder: "hover:border-amber-700/50",
        }
      case "repair_parts_added":
        return {
          icon: <Boxes className="w-4 h-4 text-purple-400" />,
          nodeBg: "bg-purple-950 border-purple-500/80 shadow-purple-500/30",
          badgeBg: "bg-purple-950/80 text-purple-300 border-purple-700/60",
          cardBorder: "hover:border-purple-700/50",
        }
      case "repair_delivered":
      case "repair_completed":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-teal-400" />,
          nodeBg: "bg-teal-950 border-teal-500/80 shadow-teal-500/30",
          badgeBg: "bg-teal-950/80 text-teal-300 border-teal-700/60",
          cardBorder: "hover:border-teal-700/50",
        }
      case "warranty_check":
        return {
          icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
          nodeBg: "bg-cyan-950 border-cyan-500/80 shadow-cyan-500/30",
          badgeBg: "bg-cyan-950/80 text-cyan-300 border-cyan-700/60",
          cardBorder: "hover:border-cyan-700/50",
        }
      case "return":
        return {
          icon: <RotateCcw className="w-4 h-4 text-rose-400" />,
          nodeBg: "bg-rose-950 border-rose-500/80 shadow-rose-500/30",
          badgeBg: "bg-rose-950/80 text-rose-300 border-rose-700/60",
          cardBorder: "hover:border-rose-700/50",
        }
      default:
        return {
          icon: <Tag className="w-4 h-4 text-slate-400" />,
          nodeBg: "bg-slate-900 border-slate-700 shadow-slate-700/30",
          badgeBg: "bg-slate-800 text-slate-300 border-slate-700",
          cardBorder: "hover:border-slate-700",
        }
    }
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-6">
      {/* Üst Başlık & Filtreler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>Cihaz Yaşam Döngüsü Zaman Çizelgesi</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-cyan-300">
              {filteredEvents.length} Kayıt
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Kronolojik sırayla gerçekleştirilen tüm alım, satım, teknik müdahale ve teslimat adımları.
          </p>
        </div>

        {/* Filtre Butonları ve Sıralama */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeFilter === "all" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Tümü ({events.length})
            </button>
            <button
              onClick={() => setActiveFilter("trade")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeFilter === "trade" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Alış / Satış
            </button>
            <button
              onClick={() => setActiveFilter("repair")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeFilter === "repair" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Teknik Servis
            </button>
            <button
              onClick={() => setActiveFilter("warranty")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                activeFilter === "warranty" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Garanti
            </button>
          </div>

          {/* Sıralama Yönü Değiştirici */}
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="h-8 px-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Sıralama yönünü değiştir"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span>{sortOrder === "desc" ? "En Yeni İlk" : "En Eski İlk"}</span>
          </button>
        </div>
      </div>

      {/* DİKEY ZAMAN ÇİZELGESİ (TIMELINE) */}
      <div className="relative pl-6 sm:pl-8 space-y-6 sm:space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-indigo-500 before:to-emerald-500">
        {filteredEvents.map((event, index) => {
          const visuals = getEventVisuals(event)
          const isExpanded = !!expandedEventIds[event.id]
          const isLatest = index === 0 && sortOrder === "desc"

          return (
            <div key={event.id} className="relative group">
              {/* Zaman Çizelgesi Düğümü (Node) */}
              <div className={`absolute -left-[30px] sm:-left-[38px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 z-10 ${visuals.nodeBg}`}>
                {visuals.icon}
                {isLatest && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>

              {/* Olay Kartı */}
              <div className={`bg-slate-950/80 rounded-2xl border border-slate-800/90 p-4 sm:p-5 shadow-md transition-all ${visuals.cardBorder}`}>
                {/* Kart Başlık Alanı */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-850">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${visuals.badgeBg}`}>
                        {event.badgeText}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {event.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        {new Date(event.date).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-900 text-slate-400">
                        {getRelativeTime(event.date)}
                      </span>
                      {event.staffName && (
                        <span className="text-[11px] text-slate-400">
                          İşlemi Yapan: <strong className="text-slate-300">{event.staffName}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tutar Rozeti ve Detay Aç/Kapat */}
                  <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1 sm:pt-0">
                    {event.amount !== undefined && event.amount !== null && (
                      <span className="font-mono font-black text-sm sm:text-base text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-800/50">
                        {formatCurrency(event.amount)}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleAccordion(event.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
                      title={isExpanded ? "Detayları Gizle" : "Detayları Göster"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Açıklama Metni */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2.5">
                  {event.description}
                </p>

                {/* Akordeon Genişletilebilir Detaylar */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-150">
                    {/* Müşteri ve Belge Künyesi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                      {event.customer && (
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                            İlgili Müşteri:
                          </span>
                          <span className="font-bold text-white text-xs mt-0.5 block">
                            {event.customer.name}
                          </span>
                          {event.customer.phone && (
                            <span className="text-slate-400 text-[11px] font-mono">
                              {event.customer.phone}
                            </span>
                          )}
                        </div>
                      )}

                      {event.metadata?.transactionNumber && (
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                            Kasa İşlem No:
                          </span>
                          <span className="font-mono font-bold text-cyan-300 text-xs mt-0.5 block">
                            {event.metadata.transactionNumber}
                          </span>
                          {event.metadata.paymentMethod && (
                            <span className="text-slate-400 text-[11px] uppercase">
                              Ödeme: {event.metadata.paymentMethod}
                            </span>
                          )}
                        </div>
                      )}

                      {event.metadata?.ticketNumber && (
                        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                            Servis Fiş Takip No:
                          </span>
                          <span className="font-mono font-bold text-amber-300 text-xs mt-0.5 block">
                            {event.metadata.ticketNumber}
                          </span>
                          <Link
                            href={`/dashboard/service/${event.metadata.ticketNumber}`}
                            className="text-cyan-400 hover:text-cyan-300 text-[11px] font-bold flex items-center gap-1 mt-0.5"
                          >
                            <span>Bileti İncele</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Değiştirilen Parçalar Tablosu (Varsa) */}
                    {event.metadata?.partsUsed && event.metadata.partsUsed.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                          <Boxes className="w-3.5 h-3.5 text-purple-400" />
                          Onarımda Montajı Yapılan Yedek Parçalar:
                        </span>
                        <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold">
                              <tr>
                                <th className="py-2 px-3">Parça Tanımı</th>
                                <th className="py-2 px-3 text-center">Adet</th>
                                <th className="py-2 px-3 text-right">Birim Fiyat</th>
                                <th className="py-2 px-3 text-right">Toplam</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {event.metadata.partsUsed.map((part, pIdx) => (
                                <tr key={pIdx} className="hover:bg-slate-800/30">
                                  <td className="py-2 px-3 font-medium text-slate-200">{part.partName}</td>
                                  <td className="py-2 px-3 text-center font-mono">{part.quantity}</td>
                                  <td className="py-2 px-3 text-right font-mono text-slate-400">{formatCurrency(part.unitPrice)}</td>
                                  <td className="py-2 px-3 text-right font-mono font-bold text-purple-300">{formatCurrency(part.totalPrice)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Garanti ve Ekstra Notlar */}
                    {(event.metadata?.warrantyMonths || event.metadata?.notes) && (
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start justify-between gap-3 flex-wrap">
                        {event.metadata?.warrantyMonths ? (
                          <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Tanımlanan Garanti: <strong>{event.metadata.warrantyMonths} Ay</strong> {event.metadata.warrantyEndDate && `(Bitiş: ${event.metadata.warrantyEndDate})`}</span>
                          </div>
                        ) : null}

                        {event.metadata?.notes && (
                          <p className="text-[11px] text-slate-400 italic">
                            Not: {event.metadata.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
