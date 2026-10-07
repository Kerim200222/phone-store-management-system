"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Store, 
  User, 
  Calendar, 
  Wrench, 
  Plus, 
  ShieldCheck, 
  Smartphone, 
  FileText, 
  Eye, 
  EyeOff, 
  AlertTriangle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceTicketReceiptData } from "@/types/service"

interface ServiceTicketModalProps {
  data: ServiceTicketReceiptData | null
  isOpen: boolean
  onClose: () => void
  onNewTicket: () => void
}

export function ServiceTicketModal({
  data,
  isOpen,
  onClose,
  onNewTicket,
}: ServiceTicketModalProps) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [printFormat, setPrintFormat] = useState<"a4" | "thermal">("a4")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !data) return null

  const handlePrint = () => {
    window.print()
  }

  const formatTL = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(val)
  }

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return isoStr
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`relative w-full ${
          printFormat === "thermal" ? "max-w-md print:w-[80mm] print:max-w-[80mm]" : "max-w-2xl print:max-w-none print:w-full"
        } bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200 print:m-0 print:border-none print:shadow-none print:p-0`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başarı Bildirim Şeridi (Ekranda görünür, yazdırmada gizlenir) */}
        <div className="bg-cyan-600 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-cyan-200" />
            <div>
              <span className="text-sm font-bold tracking-wide uppercase">Teknik Servis Kaydı Başarıyla Açıldı!</span>
              <p className="text-xs text-cyan-100 font-normal">Cihaz kabul fişi oluşturuldu ve sisteme işlendi.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-cyan-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Yazdırma Formatı Seçimi Toolbar'ı */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-cyan-600" />
            Çıktı Formatı:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPrintFormat("a4")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                printFormat === "a4"
                  ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              📄 A4 Servis Teslim Fişi
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat("thermal")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                printFormat === "thermal"
                  ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              🧾 80mm Termal Makbuz
            </button>
          </div>
        </div>

        {/* Cihaz Kabul ve Servis Fişi İçeriği */}
        <div className="p-6 sm:p-8 space-y-5 text-xs text-slate-800">
          
          {/* Üst Başlık & Mağaza Bilgileri */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b-2 border-slate-900 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-black text-lg tracking-tight text-slate-950">
                <Store className="w-5 h-5 text-cyan-600" />
                {data.store.name}
              </div>
              <p className="text-xs text-slate-600 font-medium">{data.store.branch}</p>
              <p className="text-[11px] text-slate-500">{data.store.address} • Tel: {data.store.phone}</p>
              <p className="text-[10px] text-slate-400">VKN: {data.store.taxNumber}</p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block bg-slate-900 text-white font-bold text-xs uppercase px-2.5 py-1 rounded">
                CİHAZ KABUL VE SERVİS FİŞİ
              </span>
              <div className="text-xs font-mono font-bold text-slate-900">
                Takip No: <span className="text-cyan-600 font-black">{data.ticketNumber}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center sm:justify-end gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(data.date)}
              </div>
            </div>
          </div>

          {/* İki Kolonlu Müşteri & Servis Detayları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Müşteri Bilgileri */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-cyan-600" />
                Cihaz Sahibi (Müşteri)
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ad Soyad:</span>
                  <span className="font-bold text-slate-900">{data.customer.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Telefon:</span>
                  <span className="font-mono text-slate-800">{data.customer.phone}</span>
                </div>
                {data.customer.tckn && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">TC Kimlik No:</span>
                    <span className="font-mono">{data.customer.tckn}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Servis & Maliyet Özeti */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                Servis & Maliyet Durumu
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Arıza Kategorisi:</span>
                  <span className="font-semibold text-slate-900">{data.service.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Öncelik Seviyesi:</span>
                  <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                    {data.service.priority === "critical" ? "Acil (2 Saat)" : data.service.priority === "high" ? "Yüksek Öncelik" : "Normal Sıra"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">Ön Fiyat / Tahmini Tutar:</span>
                  <span className="font-mono font-black text-sm text-cyan-700">
                    {formatTL(data.service.estimatedCost)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cihaz Donanım, IMEI ve Şifre Kartı */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-cyan-600" />
                Cihaz Kimlik & Kilit Bilgileri
              </div>
              {data.device.imei && (
                <span className="font-mono text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                  IMEI: {data.device.imei}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">Cihaz Marka & Model:</span>
                <span className="font-bold text-slate-900">{data.device.brand} {data.device.model}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Ekran Kilidi / Cihaz Şifresi:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-xs">
                    {showPassword ? data.device.devicePassword || "Şifresiz" : "••••••"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-500 hover:text-slate-900 print:hidden"
                    title={showPassword ? "Gizle" : "Göster"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Teslim Alınan Aksesuarlar:</span>
                <span className="font-medium text-slate-800">
                  {data.device.accessories.length > 0 ? data.device.accessories.join(", ") : "Yalnız Cihaz"}
                </span>
              </div>
            </div>
          </div>

          {/* Arıza Şikayeti ve Dış Görünüm Notları */}
          <div className="space-y-3">
            {/* Şikayet */}
            <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-[11px] space-y-1">
              <span className="font-bold text-red-950 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                Müşteri Arıza Beyanı & Şikayeti:
              </span>
              <p className="text-slate-800 leading-relaxed pl-4">
                {data.service.issueDescription}
              </p>
            </div>

            {/* Dış Görünüm Notları (Kusur Tespiti) */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-[11px] space-y-1">
              <span className="font-bold text-amber-950 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                Teslim Anı Dış Görünüm / Kozmetik Notları:
              </span>
              <p className="text-slate-800 leading-relaxed pl-4">
                {data.device.physicalCondition}
              </p>
            </div>
          </div>

          {/* Yasal Hükümler ve Veri Kaybı Onayı */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[10px] text-slate-600 leading-relaxed text-justify space-y-1">
            <span className="font-bold text-slate-800 block">Servis Şartları ve Taahhütname:</span>
            <p>
              1. Onarım veya parça değişimi esnasında cihazdaki verilerin (fotoğraf, rehber, uygulama vb.) yedeklenmesi münhasıran müşteriye aittir. Olası veri kayıplarından servisimiz sorumlu tutulamaz.
              <br />
              2. Arızalı cihazın onarım onayı verildikten sonra parça siparişi iptal edilemez. 90 gün içerisinde teslim alınmayan cihazlardan dolayı hukuki ve cezai sorumluluk kabul edilmez.
            </p>
          </div>

          {/* İmza Blokları */}
          <div className="grid grid-cols-2 gap-8 pt-4 pb-2 border-t border-slate-300 text-center">
            <div className="space-y-10">
              <div>
                <p className="font-bold text-xs text-slate-900">CİHAZI TESLİM EDEN (MÜŞTERİ)</p>
                <p className="text-[11px] text-slate-500">{data.customer.full_name}</p>
              </div>
              <div className="pt-2 border-t border-dashed border-slate-400 text-[10px] text-slate-400">
                İmza
              </div>
            </div>

            <div className="space-y-10">
              <div>
                <p className="font-bold text-xs text-slate-900">TESLİM ALAN (SERVİS DANIŞMANI)</p>
                <p className="text-[11px] text-slate-500">{data.store.name}</p>
              </div>
              <div className="pt-2 border-t border-dashed border-slate-400 text-[10px] text-slate-400">
                Kaşe / İmza
              </div>
            </div>
          </div>

          {/* Barkod & Sistem Notu */}
          <div className="text-center pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-400">
            *{data.ticketNumber}* • Supabase Repair_Tickets Senkronize Edildi
          </div>
        </div>

        {/* Modal Alt Butonları (Yazdırma anında gizlenir) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 border-slate-300 font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Fişi Yazdır / PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/repairs")}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 border-slate-300 font-semibold text-cyan-700 hover:bg-cyan-50"
            >
              <FileText className="w-4 h-4 text-cyan-600" />
              Servis Listesinde Gör
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onClose()
                onNewTicket()
              }}
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Yeni Servis Kaydı Aç
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
