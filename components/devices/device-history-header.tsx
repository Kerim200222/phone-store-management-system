"use client"

import React, { useState } from "react"
import { 
  Smartphone, 
  Copy, 
  Check, 
  ShieldCheck, 
  Wrench, 
  User, 
  Printer, 
  CheckCircle2,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeviceSummary, DeviceCurrentStatus } from "@/types/device-history"

interface DeviceHistoryHeaderProps {
  device: DeviceSummary
  onPrintReport: () => void
}

export function DeviceHistoryHeader({
  device,
  onPrintReport,
}: DeviceHistoryHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyImei = async () => {
    try {
      await navigator.clipboard.writeText(device.imei)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // sessizce devam et
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Durum rozeti
  const getStatusBadge = (status: DeviceCurrentStatus) => {
    switch (status) {
      case "in_stock":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-950/80 text-blue-300 border border-blue-700/60 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Vitrinde / Satışa Hazır Stokta
          </span>
        )
      case "sold":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Müşteride (Satıldı)
          </span>
        )
      case "in_service":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Teknik Serviste (Masada)
          </span>
        )
      case "ready_for_pickup":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-700/60 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Onarım Bitti (Teslim Bekliyor)
          </span>
        )
      case "delivered":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-950/80 text-teal-300 border border-teal-700/60 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            Onarıldı & Teslim Edildi
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-5">
      {/* Üst Şerit: Cihaz Modeli, IMEI ve Rapor Yazdır */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-cyan-400" />
              <span>{device.brand} {device.model}</span>
            </h1>
            {getStatusBadge(device.currentStatus)}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            {/* IMEI Kopyalama Rozeti */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
              <span className="text-slate-400">IMEI:</span>
              <strong className="text-cyan-300 font-bold tracking-wider">{device.imei}</strong>
              <button
                type="button"
                onClick={handleCopyImei}
                className="text-slate-400 hover:text-white p-0.5 ml-0.5"
                title="IMEI Kopyala"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {device.storage && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                {device.storage}
              </span>
            )}
            {device.color && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                {device.color}
              </span>
            )}
            {device.condition && (
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-bold text-[10px]">
                {device.condition}
              </span>
            )}
          </div>
        </div>

        {/* Aksiyon: Rapor Yazdır */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={onPrintReport}
            variant="outline"
            className="h-10 border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-semibold gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Cihaz Geçmiş Raporunu Yazdır</span>
          </Button>
        </div>
      </div>

      {/* İstatistik ve Künye Kartları (4 Kolon) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Kart 1: Toplam Servis Sayısı */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            Servis Giriş Sayısı
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {device.totalRepairsCount}
            </span>
            <span className="text-xs text-slate-400">kez serviste</span>
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            Toplam Onarım Bedeli: <strong className="text-emerald-400">{formatCurrency(device.totalRepairSpent)}</strong>
          </span>
        </div>

        {/* Kart 2: Garanti Durumu */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Garanti Durumu
          </span>
          {device.activeWarranty?.isActive ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {device.activeWarranty.remainingDays}
                </span>
                <span className="text-xs text-emerald-300 font-bold">gün kaldı</span>
              </div>
              <span className="text-[11px] text-cyan-300 block truncate font-medium">
                {device.activeWarranty.type}
              </span>
            </>
          ) : (
            <>
              <span className="text-base font-bold text-slate-400 block pt-1">
                Garanti Kapsamı Dışı
              </span>
              <span className="text-[11px] text-slate-400 block">
                Süresi doldu veya garantisiz
              </span>
            </>
          )}
        </div>

        {/* Kart 3: Mevcut Cihaz Sahibi / Müşteri */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-purple-400" />
            Kayıtlı Müşteri / Sahip
          </span>
          <span className="text-sm sm:text-base font-bold text-white block truncate pt-0.5">
            {device.currentOwner?.name || "Bilinmiyor / Mağaza"}
          </span>
          <span className="text-[11px] text-slate-400 font-mono block">
            {device.currentOwner?.phone || "İletişim no yok"}
          </span>
        </div>

        {/* Kart 4: Mağazaya İlk Giriş ve Son İşlem */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            Sistem Kayıt Tarihi
          </span>
          <span className="text-sm sm:text-base font-bold text-white block pt-0.5">
            {new Date(device.firstSeenDate).toLocaleDateString("tr-TR")}
          </span>
          <span className="text-[11px] text-slate-400 block truncate">
            Son İşlem: {new Date(device.lastActivityDate).toLocaleDateString("tr-TR")}
          </span>
        </div>
      </div>
    </div>
  )
}
