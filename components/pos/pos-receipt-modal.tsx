"use client"

import React, { useEffect } from "react"
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Store, 
  User, 
  Calendar, 
  CreditCard,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SaleReceipt, formatCurrency } from "@/types/pos"

interface POSReceiptModalProps {
  receipt: SaleReceipt | null
  isOpen: boolean
  onClose: () => void
  onNewSale: () => void
}

export function POSReceiptModal({
  receipt,
  isOpen,
  onClose,
  onNewSale,
}: POSReceiptModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !receipt) return null

  const handlePrint = () => {
    window.print()
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Nakit Ödeme"
      case "credit_card":
        return "Kredi / Banka Kartı (POS)"
      case "split":
        return "Parçalı Ödeme (Nakit + Kart)"
      case "on_account":
        return "Cari Hesap / Veresiye"
      default:
        return "Diğer"
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200 print:m-0 print:border-none print:shadow-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başarı Bildirim Şeridi */}
        <div className="bg-emerald-600 text-white px-5 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold tracking-wide uppercase">Satış Başarıyla Tamamlandı</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fiş İçeriği (Termal Fiş Simülasyonu) */}
        <div className="p-6 space-y-4 font-mono text-xs">
          {/* Mağaza Başlığı */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <div className="flex items-center justify-center gap-1.5 font-bold text-sm tracking-tight text-slate-950 font-sans">
              <Store className="w-4 h-4 text-emerald-600" />
              TELEFON MAĞAZASI A.Ş.
            </div>
            <p className="text-[11px] text-slate-500">Kadıköy Şubesi • Bağdat Cad. No:42/A</p>
            <p className="text-[10px] text-slate-400">Tel: (0216) 555 12 34 • VKN: 1948201938</p>
            <div className="pt-1.5 flex items-center justify-center gap-2 text-[10px] text-slate-600">
              <span className="font-bold">FİŞ NO: {receipt.receipt_no}</span>
            </div>
          </div>

          {/* Tarih ve Kasiyer Bilgileri */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pb-2 border-b border-dashed border-slate-300">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{receipt.date}</span>
            </div>
            <div className="text-right flex items-center justify-end gap-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>Kasiyer: {receipt.cashier_name}</span>
            </div>
            {receipt.customer && (
              <div className="col-span-2 pt-1 text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="font-bold text-slate-800">Müşteri:</span> {receipt.customer.full_name} ({receipt.customer.phone})
              </div>
            )}
          </div>

          {/* Kalemler Tablosu */}
          <div className="space-y-2 py-1">
            <div className="flex justify-between font-bold text-[10px] uppercase text-slate-400 border-b border-slate-200 pb-1">
              <span>Ürün / Açıklama</span>
              <span>Tutar</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {receipt.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span className="truncate max-w-[240px]">{item.product.name}</span>
                    <span className="font-bold">{formatCurrency(item.total_price)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>
                      {item.quantity} Adet x {formatCurrency(item.unit_price)}
                    </span>
                    {item.discount > 0 && (
                      <span className="text-emerald-600 font-semibold">
                        -{formatCurrency(item.discount)} İnd.
                      </span>
                    )}
                  </div>
                  {item.product.imei && (
                    <div className="text-[9px] text-slate-400 font-mono">
                      IMEI: {item.product.imei}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Toplamlar ve KDV */}
          <div className="space-y-1 pt-3 border-t border-dashed border-slate-300 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Ara Toplam (KDV Hariç):</span>
              <span>{formatCurrency(receipt.summary.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Hesaplanan KDV (%{receipt.summary.tax_rate}):</span>
              <span>{formatCurrency(receipt.summary.tax_amount)}</span>
            </div>
            {receipt.summary.discount_total > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Uygulanan İndirim:</span>
                <span>-{formatCurrency(receipt.summary.discount_total)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t-2 border-slate-900 font-sans">
              <span>ÖDENEN TOPLAM:</span>
              <span className="text-emerald-700">{formatCurrency(receipt.summary.grand_total)}</span>
            </div>
          </div>

          {/* Ödeme Bilgisi */}
          <div className="p-2 rounded bg-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-700">
            <span className="flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              Ödeme Şekli:
            </span>
            <span className="text-slate-900">{getPaymentMethodLabel(receipt.payment_method)}</span>
          </div>

          {/* Barkod ve Alt Not */}
          <div className="text-center pt-2 space-y-1">
            <div className="inline-block bg-slate-900 text-white font-mono text-[10px] tracking-widest px-4 py-1 rounded">
              *{receipt.receipt_no}*
            </div>
            <p className="text-[10px] text-slate-500 font-sans pt-1">
              Mali Değeri Yoktur • Bilgi Fişidir
            </p>
            <p className="text-[9px] text-slate-400 font-sans">
              İade ve değişimler için 14 gün içinde fişinizle başvurunuz.
            </p>
          </div>
        </div>

        {/* Eylem Butonları */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex-1 text-xs h-9 gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Fiş Yazdır
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              onClose()
              onNewSale()
            }}
            className="flex-1 text-xs h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            Yeni Satış
          </Button>
        </div>
      </div>
    </div>
  )
}
