"use client"

import React, { useState, useEffect } from "react"
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Copy, 
  Check, 
  SlidersHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { UniversalReceiptData, ReceiptPrintFormat } from "@/types/receipt"
import { ThermalReceiptView } from "@/components/receipt/thermal-receipt-view"

interface UniversalReceiptModalProps {
  data: UniversalReceiptData | null
  isOpen: boolean
  onClose: () => void
  onNewTransaction?: () => void
  title?: string
}

export function UniversalReceiptModal({
  data,
  isOpen,
  onClose,
  onNewTransaction,
  title = "İşlem Başarıyla Tamamlandı",
}: UniversalReceiptModalProps) {
  const [printFormat, setPrintFormat] = useState<ReceiptPrintFormat>("80mm")
  const [showBarcode, setShowBarcode] = useState(true)
  const [showQrCode, setShowQrCode] = useState(true)
  const [fontSize, setFontSize] = useState<"compact" | "standard" | "large">("standard")
  const [isCopied, setIsCopied] = useState(false)

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

  // window.print() Tetikleme
  const handlePrint = () => {
    window.print()
  }

  // Ham Metin / ESC-POS Fiş Çıktısı Kopyalama
  const handleCopyRawText = () => {
    const formatTL = (val: number) => `${val.toLocaleString("tr-TR")},00 TL`

    let text = `========================================\n`
    text += `       ${data.store.name}\n`
    text += `       ${data.store.branchName}\n`
    text += `  ${data.store.address}\n`
    text += `  Tel: ${data.store.phone}\n`
    text += `  ${data.store.taxOffice} - VKN: ${data.store.taxNumber}\n`
    text += `========================================\n`
    text += `BELGE NO : ${data.receiptNo}\n`
    text += `TARİH    : ${new Date(data.date).toLocaleString("tr-TR")}\n`
    text += `KASİYER  : ${data.cashierName}\n`
    if (data.customer) {
      text += `MÜŞTERİ  : ${data.customer.name} (${data.customer.phone || ""})\n`
    }
    text += `----------------------------------------\n`
    text += `ÜRÜN                   ADxFYT      TUTAR\n`
    text += `----------------------------------------\n`
    data.items.forEach((item) => {
      text += `${item.name.padEnd(20).slice(0, 20)} ${String(item.quantity).padStart(2)}x${String(item.unitPrice).padStart(7)} ${formatTL(item.totalPrice)}\n`
      if (item.imei) {
        text += `  [IMEI: ${item.imei}]\n`
      }
    })
    text += `----------------------------------------\n`
    text += `ARA TOPLAM      : ${formatTL(data.subtotal)}\n`
    if (data.discountTotal > 0) {
      text += `İNDİRİM         : -${formatTL(data.discountTotal)}\n`
    }
    text += `KDV TOPLAMI     : ${formatTL(data.taxTotal)}\n`
    text += `GENEL TOPLAM    : ${formatTL(data.grandTotal)}\n`
    text += `ÖDEME YÖNTEMİ   : ${data.paymentMethod.toUpperCase()}\n`
    text += `========================================\n`
    text += `${data.legalText || ""}\n`
    text += `${data.footerMessage || ""}\n`

    navigator.clipboard.writeText(text)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 text-slate-100 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8 border border-slate-800 flex flex-col max-h-[92vh] print:m-0 print:p-0 print:border-none print:shadow-none print:bg-transparent print:max-h-none print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Başlık Şeridi (Ekranda görünür, yazdırmada gizlenir) */}
        <div className="bg-slate-800/90 px-5 py-3.5 border-b border-slate-700/60 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
              <p className="text-xs text-slate-400 font-mono">İşlem Belge No: {data.receiptNo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 h-8 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Yazdır (Print)
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Orta Alan: Sol Denetim Paneli, Sağ Fiş Önizleme Alanı */}
        <div className="grid grid-cols-1 md:grid-cols-12 overflow-y-auto p-4 sm:p-6 gap-6 print:block print:p-0">
          
          {/* SOL: Yazıcı Formatı & Görünüm Ayarları (md:col-span-5) */}
          <div className="md:col-span-5 space-y-4 print:hidden">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                Yazıcı & Çıktı Ayarları
              </div>

              {/* Kağıt Formatı Seçimi */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 block">
                  Kağıt Genişliği / Format:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrintFormat("80mm")}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                      printFormat === "80mm"
                        ? "bg-cyan-600 text-white border-cyan-500 shadow-sm"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    🧾 80mm Termal Fiş
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintFormat("a4")}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                      printFormat === "a4"
                        ? "bg-cyan-600 text-white border-cyan-500 shadow-sm"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    📄 A4 Fatura Modu
                  </button>
                </div>
              </div>

              {/* Yazı Boyutu */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 block">
                  Yazı Tipi & Karakter Sıklığı:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["compact", "standard", "large"] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFontSize(size)}
                      className={`py-1.5 px-2 rounded-md text-[11px] font-semibold border ${
                        fontSize === size
                          ? "bg-slate-800 text-white border-slate-600"
                          : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {size === "compact" ? "Kompakt" : size === "standard" ? "Normal" : "Geniş"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ekstra Unsurlar Checkbox */}
              <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showBarcode}
                    onChange={(e) => setShowBarcode(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-900 border-slate-700"
                  />
                  <span>Code128 Barkodunu Göster</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={showQrCode}
                    onChange={(e) => setShowQrCode(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 bg-slate-900 border-slate-700"
                  />
                  <span>e-Belge Doğrulama QR Kodunu Göster</span>
                </label>
              </div>
            </div>

            {/* İpuçları ve Bilgi */}
            <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-bold text-slate-200 block">🖨️ Yazıcı Uyum Notu:</span>
              <p className="text-[11px] leading-relaxed">
                Tasarım tüm 80mm ESC/POS termal fiş yazıcılarıyla (Epson TM-T20, Bixolon, Sewoo vb.) tam uyumludur. 
                Tarayıcı yazdırma iletişim kutusunda <strong>&quot;Kenar Boşlukları: Yok&quot;</strong> seçilmesi tavsiye edilir.
              </p>
            </div>

            {/* Hızlı Aksiyonlar */}
            <div className="flex flex-col gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyRawText}
                className="w-full border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs gap-1.5 h-9"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Ham Fiş Metni Panoya Kopyalandı!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Ham Fiş Metnini Kopyala (ESC/POS)
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* SAĞ: Canlı 80mm Fiş Önizleme Alanı (md:col-span-7) */}
          <div className="md:col-span-7 flex flex-col items-center justify-start overflow-y-visible print:w-full print:block">
            <div className="w-full flex items-center justify-between pb-2 text-xs font-semibold text-slate-400 print:hidden">
              <span>80mm Canlı Fiş Görünümü:</span>
              <span className="text-[11px] text-cyan-400 font-mono">Baskı Önizleme</span>
            </div>

            <div className="w-full flex justify-center py-2 bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 sm:p-4 print:p-0 print:bg-transparent print:border-none">
              <ThermalReceiptView
                data={data}
                showBarcode={showBarcode}
                showQrCode={showQrCode}
                fontSize={fontSize}
              />
            </div>
          </div>
        </div>

        {/* Alt Butonlar Barı */}
        <div className="bg-slate-950 px-5 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Kasa & Envanter Kaydı Başarılı</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onNewTransaction && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  onNewTransaction()
                }}
                className="w-full sm:w-auto border-slate-700 bg-slate-800 text-slate-200 text-xs h-9 hover:bg-slate-700"
              >
                Yeni İşlem Başlat
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Printer className="w-4 h-4" />
              Yazdır / PDF Olarak Kaydet
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
