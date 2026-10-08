"use client"

import React, { useRef } from "react"
import { 
  X, 
  Printer, 
  Download, 
  Smartphone, 
  Barcode, 
  ShieldCheck, 
  FileText,
  Calendar,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeviceSummary, DeviceTimelineEvent } from "@/types/device-history"

interface DeviceHistoryReportModalProps {
  isOpen: boolean
  onClose: () => void
  device: DeviceSummary
  events: DeviceTimelineEvent[]
}

export function DeviceHistoryReportModal({
  isOpen,
  onClose,
  device,
  events,
}: DeviceHistoryReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Üst Eylem Şeridi (Yazdırma esnasında gizlenir: print:hidden) */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Cihaz Ekspertiz & Servis Geçmiş Raporu Önizleme</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-cyan-600/25"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır (A4 / Fiş)</span>
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* YAZDIRILABİLİR BELGE GÖVDESİ (A4 Sayfa Formatı) */}
        <div 
          ref={reportRef} 
          className="p-6 sm:p-8 bg-white text-slate-900 overflow-y-auto max-h-[calc(92vh-70px)] print:p-0 print:max-h-none print:overflow-visible font-sans"
        >
          {/* Rapor Başlığı & Mağaza Künyesi */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                TELEFON MAĞAZASI A.Ş.
              </h1>
              <p className="text-xs text-slate-600">
                Resmi Cihaz Yaşam Döngüsü ve Teknik Servis Ekspertiz Raporu
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Bağdat Cad. No:42/A Kadıköy / İstanbul • Tel: 0212 555 00 24
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5">
              <span className="font-mono font-bold text-slate-900 block text-sm">
                RAPOR NO: RPR-{device.imei.slice(-6)}
              </span>
              <span className="text-slate-600 block">
                Tarih: {new Date().toLocaleDateString("tr-TR")}
              </span>
              <span className="text-slate-500 block text-[11px]">
                Yetkili: Kerim Aydın (Teknik Servis Müdürü)
              </span>
            </div>
          </div>

          {/* Cihaz Künye Tablosu */}
          <div className="bg-slate-50 rounded-xl border border-slate-300 p-4 mb-5 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 pb-1 border-b border-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-900" />
              Cihaz Kimlik ve Donanım Bilgileri
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Marka / Model:</span>
                <strong className="text-slate-900 font-bold text-xs">{device.brand} {device.model}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">15 Haneli IMEI:</span>
                <strong className="text-slate-900 font-mono font-bold text-xs">{device.imei}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Kapasite / Renk:</span>
                <span className="text-slate-900">{device.storage || "-"} / {device.color || "-"}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Mevcut Durum:</span>
                <span className="font-bold text-emerald-700 uppercase">{device.currentStatus}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2.5 mt-2.5 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Kayıtlı Sahip:</span>
                <strong className="text-slate-900">{device.currentOwner?.name || "Bilinmiyor"}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">İletişim:</span>
                <span className="text-slate-800 font-mono">{device.currentOwner?.phone || "-"}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Toplam Servis Sayısı:</span>
                <strong className="text-slate-900 font-mono">{device.totalRepairsCount} Kez</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Aktif Garanti:</span>
                <strong className={device.activeWarranty?.isActive ? "text-emerald-700" : "text-slate-500"}>
                  {device.activeWarranty?.isActive ? `${device.activeWarranty.remainingDays} Gün (${device.activeWarranty.type})` : "Garantisiz"}
                </strong>
              </div>
            </div>
          </div>

          {/* Kronolojik İşlem ve Zaman Çizelgesi Tablosu */}
          <div className="space-y-2 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-900" />
              Cihaz Yaşam Döngüsü ve İşlem Dökümü
            </h3>

            <div className="rounded-xl border border-slate-300 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3">Tarih</th>
                    <th className="py-2 px-3">İşlem Türü</th>
                    <th className="py-2 px-3">Açıklama / Müdahale Detayı</th>
                    <th className="py-2 px-3">Müşteri / Sorumlu</th>
                    <th className="py-2 px-3 text-right">Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {events.map((ev, idx) => (
                    <tr key={ev.id || idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {new Date(ev.date).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-900 block">{ev.badgeText}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{ev.title}</span>
                      </td>
                      <td className="py-2 px-3 text-slate-700 leading-tight">
                        <p className="text-[11px]">{ev.description}</p>
                        {ev.metadata?.partsUsed && ev.metadata.partsUsed.length > 0 && (
                          <span className="text-[10px] text-purple-700 block mt-0.5">
                            Parça: {ev.metadata.partsUsed.map((p) => p.partName).join(", ")}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-600 whitespace-nowrap">
                        <span className="font-medium text-slate-900 block">{ev.customer?.name || "-"}</span>
                        <span className="text-[10px] text-slate-500">{ev.staffName || ""}</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {ev.amount ? formatCurrency(ev.amount) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Garanti Şartları ve İmza Alanı */}
          <div className="border-t-2 border-slate-900 pt-4 text-xs space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] text-slate-600 leading-relaxed">
              <strong>Yasal Bilgilendirme:</strong> Bu belge, cihazın mağazamızda gerçekleştirilen tüm alım, satım, ekspertiz ve teknik servis işlemlerinin resmi dijital dökümüdür. Servis garantisi sıvı teması, kullanıcı kaynaklı darbe, ekran kırılması veya yetkisiz müdahaleleri kapsamaz.
            </div>

            <div className="grid grid-cols-2 gap-8 pt-4 text-center">
              <div>
                <span className="text-[11px] font-bold text-slate-700 block">Ekspertizi Yapan Teknisyen</span>
                <span className="text-xs font-semibold text-slate-900 block mt-1">Kerim Aydın</span>
                <div className="mt-8 border-b border-dashed border-slate-400 w-36 mx-auto" />
                <span className="text-[10px] text-slate-400 mt-1 block">İmza / Kaşe</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 block">Müşteri / Teslim Alan</span>
                <span className="text-xs font-semibold text-slate-900 block mt-1">{device.currentOwner?.name || "Ad Soyad"}</span>
                <div className="mt-8 border-b border-dashed border-slate-400 w-36 mx-auto" />
                <span className="text-[10px] text-slate-400 mt-1 block">İmza</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
