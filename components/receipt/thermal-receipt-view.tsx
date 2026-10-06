"use client"

import React from "react"
import { 
  Store, 
  Scissors 
} from "lucide-react"
import { UniversalReceiptData } from "@/types/receipt"

interface ThermalReceiptViewProps {
  data: UniversalReceiptData
  showBarcode?: boolean
  showQrCode?: boolean
  showCutLine?: boolean
  fontSize?: "compact" | "standard" | "large"
  className?: string
}

export function ThermalReceiptView({
  data,
  showBarcode = true,
  showQrCode = true,
  showCutLine = true,
  fontSize = "standard",
  className = "",
}: ThermalReceiptViewProps) {
  const formatTL = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(val)
  }

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    } catch {
      return isoString
    }
  }

  // Dinamik Barkod Çubukları Simülasyonu (Code128 Deseni)
  const renderBarcodeBars = (code: string) => {
    const bars = []
    const seed = code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    for (let i = 0; i < 48; i++) {
      const width = ((seed * (i + 13)) % 3) + 1
      const isSpace = ((seed * (i + 7)) % 4) === 0
      bars.push(
        <div
          key={i}
          className={`h-11 ${
            isSpace 
              ? "bg-transparent w-1" 
              : "thermal-barcode-line bg-black"
          }`}
          style={{ width: `${width * 1.5}px` }}
        />
      )
    }
    return bars
  }

  const getTitleByType = () => {
    switch (data.type) {
      case "sale":
        return "BİLGİ FİŞİ / SATIŞ MAKBUZU"
      case "purchase":
        return "GİDER PUSULASI & 2. EL ALIM FİŞİ"
      case "repair":
        return "TEKNİK SERVİS TESLİM FİŞİ"
      case "refund":
        return "İADE / İPTAL MAKBUZU"
      default:
        return "İŞLEM FİŞİ"
    }
  }

  const getPaymentLabel = () => {
    switch (data.paymentMethod) {
      case "cash":
        return "NAKİT ÖDEME"
      case "credit_card":
        return "KREDİ KARTI (POS)"
      case "bank_transfer":
        return "HAVALE / EFT"
      case "split":
        return "PARÇALI (NAKİT + KART)"
      case "on_account":
        return "CARİ HESAP / VERESİYE"
      default:
        return "DİĞER"
    }
  }

  const textSizeClass = {
    compact: "text-[10px]",
    standard: "text-[11px]",
    large: "text-xs",
  }[fontSize]

  return (
    <div 
      className={`thermal-receipt-printable bg-white text-slate-950 font-mono ${textSizeClass} w-full max-w-[320px] sm:max-w-[340px] mx-auto p-4 sm:p-5 shadow-lg border border-slate-200 rounded-sm print:max-w-[80mm] print:w-[76mm] print:p-1 print:m-0 print:border-none print:shadow-none print:rounded-none select-text ${className}`}
    >
      {/* Üst Kağıt Kesim Süsü (Yalnızca ekranda) */}
      {showCutLine && (
        <div className="flex items-center justify-between text-[9px] text-slate-400 pb-2 mb-2 border-b border-dashed border-slate-300 print:hidden">
          <span className="flex items-center gap-1 font-sans">
            <Scissors className="w-3 h-3 text-slate-400" />
            80mm Termal Kağıt Formatı
          </span>
          <span className="font-mono">ESC/POS Ready</span>
        </div>
      )}

      {/* 1. MAĞAZA BAŞLIĞI */}
      <div className="text-center space-y-0.5 pb-2.5 border-b border-dashed border-slate-900">
        <div className="flex items-center justify-center gap-1.5 font-black text-xs sm:text-sm tracking-tight text-slate-950 uppercase font-sans">
          <Store className="w-4 h-4 text-slate-900 print:hidden shrink-0" />
          {data.store.name}
        </div>
        <div className="text-[10px] font-semibold text-slate-800">{data.store.branchName}</div>
        <div className="text-[9px] text-slate-600 leading-tight px-2">{data.store.address}</div>
        <div className="text-[9px] text-slate-700">Tel: {data.store.phone}</div>
        <div className="text-[9px] text-slate-700 font-semibold">
          {data.store.taxOffice} • VKN: {data.store.taxNumber}
        </div>
        {data.store.mersisNo && (
          <div className="text-[8px] text-slate-500">Mersis: {data.store.mersisNo}</div>
        )}
      </div>

      {/* 2. FİŞ BELGE TÜRÜ VE İŞLEM NUMARASI */}
      <div className="py-2 text-center border-b border-dashed border-slate-900 space-y-1">
        <div className="inline-block px-2 py-0.5 font-bold text-[10px] tracking-wider uppercase border border-slate-900">
          *** {getTitleByType()} ***
        </div>
        <div className="flex justify-between items-center text-[10px] font-semibold pt-0.5">
          <span>BELGE NO:</span>
          <span className="font-bold tracking-wider">{data.receiptNo}</span>
        </div>
        <div className="flex justify-between items-center text-[9px] text-slate-700">
          <span>TARİH & SAAT:</span>
          <span>{formatDate(data.date)}</span>
        </div>
        <div className="flex justify-between items-center text-[9px] text-slate-700">
          <span>KASİYER:</span>
          <span className="truncate max-w-[170px]">{data.cashierName}</span>
        </div>
      </div>

      {/* 3. MÜŞTERİ BİLGİLERİ (Varsa) */}
      {data.customer && (
        <div className="py-2 border-b border-dashed border-slate-900 space-y-0.5 text-[9px]">
          <div className="font-bold uppercase text-[10px] text-slate-900">
            {data.type === "purchase" ? "SATICI (MÜŞTERİ):" : "MÜŞTERİ BİLGİSİ:"}
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">İsim:</span>
            <span className="font-bold text-slate-950 truncate max-w-[190px]">{data.customer.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Telefon:</span>
            <span>{data.customer.phone || "-"}</span>
          </div>
          {data.customer.tckn && (
            <div className="flex justify-between">
              <span className="text-slate-600">TCKN / VKN:</span>
              <span className="font-bold">{data.customer.tckn}</span>
            </div>
          )}
          {data.customer.address && (
            <div className="text-[8px] text-slate-600 pt-0.5 truncate">
              {data.customer.address}
            </div>
          )}
        </div>
      )}

      {/* 4. KALEMLER TABLOSU */}
      <div className="py-2 border-b border-dashed border-slate-900 space-y-1.5">
        {/* Tablo Başlığı */}
        <div className="flex justify-between text-[9px] font-bold pb-1 border-b border-slate-300 uppercase">
          <span className="w-1/2">ÜRÜN / AÇIKLAMA</span>
          <span className="w-1/4 text-center">AD x FYT</span>
          <span className="w-1/4 text-right">TUTAR</span>
        </div>

        {/* Kalemler */}
        <div className="space-y-1.5">
          {data.items.map((item, idx) => (
            <div key={item.id || idx} className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-950 leading-tight">
                <span className="w-1/2 break-words pr-1">{item.name}</span>
                <span className="w-1/4 text-center font-normal text-[9px]">
                  {item.quantity} x {Number(item.unitPrice).toLocaleString("tr-TR")}
                </span>
                <span className="w-1/4 text-right font-bold">
                  {formatTL(item.totalPrice)}
                </span>
              </div>

              {/* Varsa 15 Haneli IMEI ve Seri No */}
              {item.imei && (
                <div className="text-[9px] bg-slate-100 px-1 py-0.2 rounded inline-block font-bold text-slate-900 border border-slate-200">
                  IMEI: {item.imei}
                </div>
              )}

              {/* Varsa Garanti Bilgisi */}
              {item.warrantyPeriod && (
                <div className="text-[8px] text-slate-600 pl-1">
                  • {item.warrantyPeriod}
                </div>
              )}

              {/* Varsa Kalem İndirimi */}
              {item.discount && item.discount > 0 && (
                <div className="text-[9px] text-emerald-700 flex justify-between pl-1">
                  <span>Satır İndirimi:</span>
                  <span>-{formatTL(item.discount)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. MALİ TOPLAMLAR VE KDV KIRILIMI */}
      <div className="py-2 border-b border-dashed border-slate-900 space-y-1 text-[10px]">
        <div className="flex justify-between text-slate-700">
          <span>ARA TOPLAM:</span>
          <span>{formatTL(data.subtotal)}</span>
        </div>

        {data.discountTotal > 0 && (
          <div className="flex justify-between text-emerald-800 font-semibold">
            <span>TOPLAM İNDİRİM:</span>
            <span>-{formatTL(data.discountTotal)}</span>
          </div>
        )}

        {/* KDV Matrah ve Tutarları */}
        {data.taxes && data.taxes.length > 0 && (
          <div className="pt-0.5 space-y-0.5 border-t border-dotted border-slate-300">
            {data.taxes.map((t, idx) => (
              <div key={idx} className="flex justify-between text-[9px] text-slate-600">
                <span>% {t.taxRate} KDV (%{t.taxRate} Matrah: {formatTL(t.taxableAmount)}):</span>
                <span>{formatTL(t.taxAmount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* GENEL TOPLAM (Büyük ve Kalın) */}
        <div className="flex justify-between items-center pt-1.5 border-t-2 border-slate-900 text-xs sm:text-sm font-black">
          <span className="uppercase">GENEL TOPLAM:</span>
          <span className="text-slate-950 font-bold">{formatTL(data.grandTotal)}</span>
        </div>
      </div>

      {/* 6. ÖDEME DETAYLARI */}
      <div className="py-2 border-b border-dashed border-slate-900 space-y-1 text-[9px]">
        <div className="flex justify-between font-bold text-[10px]">
          <span>ÖDEME ŞEKLİ:</span>
          <span>{getPaymentLabel()}</span>
        </div>

        {data.paymentDetails?.cashAmount && data.paymentDetails.cashAmount > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600">Nakit Tahsilat:</span>
            <span>{formatTL(data.paymentDetails.cashAmount)}</span>
          </div>
        )}

        {data.paymentDetails?.cardAmount && data.paymentDetails.cardAmount > 0 && (
          <div className="space-y-0.5">
            <div className="flex justify-between">
              <span className="text-slate-600">Kredi Kartı POS:</span>
              <span>{formatTL(data.paymentDetails.cardAmount)}</span>
            </div>
            {data.paymentDetails.cardLast4 && (
              <div className="flex justify-between text-[8px] text-slate-500">
                <span>Kart No: **** **** **** {data.paymentDetails.cardLast4}</span>
                {data.paymentDetails.posAuthCode && (
                  <span>Onay: {data.paymentDetails.posAuthCode}</span>
                )}
              </div>
            )}
          </div>
        )}

        {data.paymentDetails?.changeAmount && data.paymentDetails.changeAmount > 0 && (
          <div className="flex justify-between font-bold text-slate-900 pt-0.5">
            <span>PARA ÜSTÜ:</span>
            <span>{formatTL(data.paymentDetails.changeAmount)}</span>
          </div>
        )}
      </div>

      {/* 7. İKİNCİ EL ALIM İÇİN İMZA BLOKLARI (Gider Pusulası Modu) */}
      {data.type === "purchase" && (
        <div className="py-2.5 border-b border-dashed border-slate-900 space-y-8 text-[9px]">
          <div className="text-[8px] leading-tight text-slate-700 text-justify">
            <strong>BEYAN:</strong> Satıcı, yukarıda IMEI ve modeli kayıtlı cihazın kendisine ait olduğunu, çalıntı/kayıp olmadığını ve bedelini eksiksiz aldığını beyan eder.
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="font-bold text-[9px]">TESLİM EDEN (SATICI)</div>
              <div className="text-[8px] text-slate-500">{data.customer?.name || "Müşteri"}</div>
              <div className="mt-6 border-t border-dashed border-slate-400 pt-1 text-[8px] text-slate-400">
                İmza
              </div>
            </div>
            <div>
              <div className="font-bold text-[9px]">TESLİM ALAN (MAĞAZA)</div>
              <div className="text-[8px] text-slate-500">{data.store.name}</div>
              <div className="mt-6 border-t border-dashed border-slate-400 pt-1 text-[8px] text-slate-400">
                Kaşe / İmza
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. YASAL BİLGİ VE İADE KOŞULLARI */}
      <div className="py-2 space-y-1 text-center text-[8px] text-slate-600 leading-tight">
        {data.legalText && (
          <p className="font-semibold text-slate-800">{data.legalText}</p>
        )}
        {data.footerMessage && (
          <p className="whitespace-pre-line text-slate-700 font-medium">{data.footerMessage}</p>
        )}
      </div>

      {/* 9. GERÇEKÇİ ÇUBUK BARKOD SİMÜLASYONU */}
      {showBarcode && (
        <div className="py-2 flex flex-col items-center justify-center space-y-1 border-t border-dashed border-slate-900">
          <div className="flex items-center justify-center gap-[1.5px] overflow-hidden max-w-full px-2 py-1 bg-white">
            {renderBarcodeBars(data.barcode || data.receiptNo)}
          </div>
          <div className="text-[9px] font-mono tracking-widest font-bold text-slate-900">
            *{data.barcode || data.receiptNo}*
          </div>
        </div>
      )}

      {/* 10. QR KOD DOĞRULAMA (Simülasyon) */}
      {showQrCode && (
        <div className="pt-1 pb-2 flex flex-col items-center justify-center space-y-1">
          <div className="w-16 h-16 border-2 border-slate-900 p-1 flex items-center justify-center bg-white">
            <div className="grid grid-cols-6 gap-0.5 w-full h-full">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className={`${
                    (i % 2 === 0 || i % 5 === 0 || i < 7 || i > 28) 
                      ? "bg-slate-950" 
                      : "bg-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-[7.5px] text-slate-500 uppercase tracking-tighter">
            e-Belge Doğrulama QR Kodu
          </div>
        </div>
      )}

      {/* 11. KAĞIT KESİM BİTİŞ ÇİZGİSİ */}
      <div className="thermal-cut-line pt-2 text-center text-[9px] text-slate-400">
        ✂ - - - - - - - - - - - - - - - - - - - - -
      </div>
    </div>
  )
}
