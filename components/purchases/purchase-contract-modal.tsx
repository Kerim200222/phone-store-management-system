"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Store, 
  User, 
  Calendar, 
  CreditCard,
  Plus,
  ShieldCheck,
  Smartphone,
  FileText,
  Boxes
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { PurchaseContractData } from "@/types/purchase"

interface PurchaseContractModalProps {
  data: PurchaseContractData | null
  isOpen: boolean
  onClose: () => void
  onNewPurchase: () => void
}

export function PurchaseContractModal({
  data,
  isOpen,
  onClose,
  onNewPurchase,
}: PurchaseContractModalProps) {
  const router = useRouter()

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

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Nakit Ödeme (Kasadan Para Çıkışı)"
      case "bank_transfer":
        return "Banka Transferi / Havale-EFT"
      case "on_account":
        return "Cari Mahsup (Müşteri Alacağı)"
      default:
        return "Diğer"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200 print:m-0 print:border-none print:shadow-none print:max-w-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başarı Bildirim Şeridi (Ekranda görünür, yazdırmada gizlenir) */}
        <div className="bg-emerald-600 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <div>
              <span className="text-sm font-bold tracking-wide uppercase">Cihaz Alımı ve Kasa Çıkışı Başarılı!</span>
              <p className="text-xs text-emerald-100 font-normal">Ürün envantere eklendi ve kasa çıkış fişi işlendi.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sözleşme & Gider Pusulası İçeriği */}
        <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-800">
          {/* Üst Başlık & Mağaza Bilgileri */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-4 border-b-2 border-slate-900 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-black text-lg tracking-tight text-slate-950">
                <Store className="w-5 h-5 text-indigo-600" />
                TELEFON MAĞAZASI A.Ş.
              </div>
              <p className="text-xs text-slate-600 font-medium">Merkez Şube • Kadıköy / İstanbul</p>
              <p className="text-[11px] text-slate-500">Tel: (0216) 555 12 34 • VKN: 1948201938</p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block bg-slate-900 text-white font-bold text-xs uppercase px-2.5 py-1 rounded">
                GİDER PUSULASI & ALIM SÖZLEŞMESİ
              </span>
              <div className="text-xs font-mono font-semibold text-slate-900">
                Belge No: <span className="text-indigo-600">{data.receiptNo}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center sm:justify-end gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(data.date).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>
            </div>
          </div>

          {/* İki Sütunlu Bilgi Kartları: Satıcı ve Kasa/İşlem Bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Satıcı Müşteri Bilgileri */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                Satıcı (Müşteri) Bilgileri
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ad Soyad:</span>
                  <span className="font-semibold text-slate-900">{data.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Telefon:</span>
                  <span className="font-mono text-slate-800">{data.customerPhone}</span>
                </div>
                {data.customerTckn && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">TC Kimlik No:</span>
                    <span className="font-mono font-semibold text-slate-900">{data.customerTckn}</span>
                  </div>
                )}
                {data.customerAddress && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Adres / Şehir:</span>
                    <span className="text-slate-700">{data.customerAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mali & Ödeme Detayları */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                Mali Bilgiler & Kasa Çıkışı
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">İşlem Türü:</span>
                  <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    İkinci El Alım (Gider)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ödeme Şekli:</span>
                  <span className="font-semibold text-slate-800">{getPaymentMethodLabel(data.paymentMethod)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">Ödenen Alış Bedeli:</span>
                  <span className="font-mono font-black text-sm text-emerald-700">
                    {formatTL(data.purchasePrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cihaz Detay Tablosu */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                Alınan Cihazın Donanım & Kimlik Bilgileri
              </div>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-semibold text-[10px]">
                Durum: İkinci El Cihaz
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Marka & Model</th>
                    <th className="py-2 px-3">IMEI Numarası</th>
                    <th className="py-2 px-3">Kapasite / Renk</th>
                    <th className="py-2 px-3 text-center">Pil Sağlığı</th>
                    <th className="py-2 px-3 text-center">Kozmetik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr className="bg-white">
                    <td className="py-2.5 px-3 font-bold text-slate-950">
                      {data.brand} {data.model}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700 tracking-wider">
                      {data.imei}
                    </td>
                    <td className="py-2.5 px-3">
                      {data.storage || "-"} / {data.color || "-"}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold">
                      {data.batteryHealth ? `%${data.batteryHealth}` : "Belirtilmedi"}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-medium">
                        {data.cosmeticCondition}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Aksesuar Durumu */}
              <div className="p-3 bg-slate-50/60 border-t border-slate-200 flex flex-wrap items-center gap-4 text-[11px]">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-slate-500" />
                  Teslim Alınan Aksesuarlar:
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${data.hasBox ? "bg-emerald-100 text-emerald-800 font-medium" : "bg-slate-100 text-slate-400"}`}>
                  {data.hasBox ? "✓ Orijinal Kutu Var" : "✗ Kutu Yok"}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${data.hasInvoice ? "bg-emerald-100 text-emerald-800 font-medium" : "bg-slate-100 text-slate-400"}`}>
                  {data.hasInvoice ? "✓ Fatura Var" : "✗ Fatura Yok"}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${data.hasCharger ? "bg-emerald-100 text-emerald-800 font-medium" : "bg-slate-100 text-slate-400"}`}>
                  {data.hasCharger ? "✓ Şarj Aleti Var" : "✗ Şarj Aleti Yok"}
                </span>
              </div>

              {data.technicalNotes && (
                <div className="p-3 bg-white border-t border-slate-200 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">Teknik İnceleme / Ekspertiz Notu: </span>
                  {data.technicalNotes}
                </div>
              )}
            </div>
          </div>

          {/* Yasal Beyan ve Taahhütname */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5 text-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              Yasal Mülkiyet ve Taahhüt Beyannamesi
            </div>
            <p className="text-[10px] leading-relaxed text-amber-950 text-justify">
              <strong>Satıcı Beyanı:</strong> Satıcı ({data.customerName}), yukarıda marka, model ve 15 haneli IMEI numarası belirtilen 
              ikinci el cihazın tek ve meşru sahibi olduğunu, cihaz üzerinde herhangi bir rehin, haciz, çalıntı/kayıp kaydı veya takyidat 
              bulunmadığını, cihazın yasal yollarla temin edildiğini beyan ve taahhüt eder. Cihaz bedeli olan <strong>{formatTL(data.purchasePrice)}</strong> tutarı 
              tarafına eksiksiz ödenmiştir. Cihazın geçmiş kullanımına ve yasal durumuna ilişkin hukuki ve cezai sorumluluk münhasıran Satıcıya aittir.
            </p>
          </div>

          {/* İmza Alanları */}
          <div className="grid grid-cols-2 gap-8 pt-4 pb-2 border-t border-slate-200 text-center">
            <div className="space-y-12">
              <div>
                <p className="font-bold text-xs text-slate-900">TESLİM EDEN (SATICI)</p>
                <p className="text-[11px] text-slate-500">{data.customerName}</p>
                {data.customerTckn && <p className="text-[10px] text-slate-400 font-mono">TC: {data.customerTckn}</p>}
              </div>
              <div className="pt-2 border-t border-dashed border-slate-400 text-[10px] text-slate-400">
                İmza
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <p className="font-bold text-xs text-slate-900">TESLİM ALAN (MAĞAZA YETKİLİSİ)</p>
                <p className="text-[11px] text-slate-500">TELEFON MAĞAZASI A.Ş.</p>
                <p className="text-[10px] text-slate-400">Kaşe & Yetkili İmza</p>
              </div>
              <div className="pt-2 border-t border-dashed border-slate-400 text-[10px] text-slate-400">
                Kaşe / İmza
              </div>
            </div>
          </div>

          {/* Sistem Bilgisi */}
          <div className="text-center text-[10px] text-slate-400 print:block">
            İşlem Kayıt Kodu: {data.productId} • Supabase Senkronize Edildi
          </div>
        </div>

        {/* Modal Alt Butonları (Yazdırma esnasında gizlenir) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 border-slate-300 font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Sözleşmeyi Yazdır / PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/inventory")}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 border-slate-300 font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              Envanterde Gör
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onClose()
                onNewPurchase()
              }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Yeni Cihaz Alımı Yap
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
