"use client"

import React, { useState } from "react"
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  User, 
  Tag, 
  ArrowRight, 
  Receipt,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomImage } from "@/components/ui/custom-image"
import { 
  CartItem, 
  CartSummary, 
  POSCustomerSelect, 
  POSPaymentMethod, 
  formatCurrency 
} from "@/types/pos"

interface POSCartProps {
  items: CartItem[]
  summary: CartSummary
  onUpdateQuantity: (id: string, delta: number) => void
  onSetQuantity: (id: string, qty: number) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
  customers: POSCustomerSelect[]
  selectedCustomer: POSCustomerSelect | null
  onSelectCustomer: (customer: POSCustomerSelect | null) => void
  paymentMethod: POSPaymentMethod
  onSelectPaymentMethod: (method: POSPaymentMethod) => void
  discountAmount: number
  onApplyDiscount: (amount: number) => void
  onCheckout: () => void
  isCheckingOut: boolean
}

export function POSCart({
  items,
  summary,
  onUpdateQuantity,
  onSetQuantity,
  onRemoveItem,
  onClearCart,
  customers,
  selectedCustomer,
  onSelectCustomer,
  paymentMethod,
  onSelectPaymentMethod,
  discountAmount,
  onApplyDiscount,
  onCheckout,
  isCheckingOut,
}: POSCartProps) {
  const [showDiscountInput, setShowDiscountInput] = useState(false)
  const [tempDiscount, setTempDiscount] = useState(discountAmount > 0 ? discountAmount.toString() : "")

  const handleApplyDiscountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(tempDiscount) || 0
    onApplyDiscount(parsed)
    setShowDiscountInput(false)
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-800/90 rounded-xl overflow-hidden shadow-xl">
      {/* Sepet Başlığı */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Alışveriş Sepeti
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-800/60">
                {summary.total_quantity} Ürün
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Anlık sipariş ve kasa hesabı
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearCart}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 h-7 px-2 gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Temizle
          </Button>
        )}
      </div>

      {/* Müşteri Seçimi Dropdown */}
      <div className="p-3 border-b border-slate-800/70 bg-slate-950/30">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedCustomer?.id || ""}
            onChange={(e) => {
              const found = customers.find((c) => c.id === e.target.value)
              onSelectCustomer(found || null)
            }}
            aria-label="Satış Yapılacak Müşteri"
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="">👤 Ayaküstü / Perakende Müşteri (Anonim)</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.phone}) - {c.balance < 0 ? `Borç: ${formatCurrency(Math.abs(c.balance))}` : c.balance > 0 ? `Alacak: ${formatCurrency(c.balance)}` : "Bakiye: 0 TL"}
              </option>
            ))}
          </select>
        </div>

        {selectedCustomer && (
          <div className="mt-2 px-2.5 py-1.5 rounded-md bg-cyan-950/30 border border-cyan-800/40 text-[11px] flex items-center justify-between text-slate-300">
            <span>Seçili Müşteri: <strong className="text-white">{selectedCustomer.full_name}</strong></span>
            <span className={`font-mono font-medium ${
              selectedCustomer.balance < 0 ? "text-rose-400" : selectedCustomer.balance > 0 ? "text-emerald-400" : "text-slate-400"
            }`}>
              {selectedCustomer.balance < 0 ? "Açık Borcu Var" : selectedCustomer.balance > 0 ? "Avansı Var" : "Dengeli"}
            </span>
          </div>
        )}
      </div>

      {/* Sepet Kalemleri Listesi */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[220px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-500 space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-800 flex items-center justify-center text-slate-600">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300">Sepetiniz Boş</p>
              <p className="text-[11px] text-slate-500 max-w-[200px] mt-0.5">
                Sol panelden ürün seçerek veya barkod okutarak sepete ekleyebilirsiniz.
              </p>
            </div>
          </div>
        ) : (
          items.map((item) => {
            const isPhone = item.product.category === "Telefon"
            const maxStock = item.product.stock_quantity

            return (
              <div
                key={item.id}
                className="group relative flex items-center gap-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all"
              >
                {/* Ürün Görseli */}
                <div className="relative w-12 h-12 rounded-md overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                  {item.product.image_url ? (
                    <CustomImage
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                      📱
                    </div>
                  )}
                </div>

                {/* Ürün Detayı */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 
                      className="text-xs font-semibold text-white truncate leading-snug"
                      title={item.product.name}
                    >
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                      title="Sepetten Çıkar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                    <span className="text-emerald-400 font-semibold">
                      {formatCurrency(item.unit_price)}
                    </span>
                    {isPhone && item.product.imei && (
                      <span className="text-slate-500">
                        IMEI: ...{item.product.imei.slice(-4)}
                      </span>
                    )}
                  </div>

                  {/* Adet Kontrolleri ve Satır Toplamı */}
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-800/40">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold transition-colors disabled:opacity-50"
                        title="Adet Azalt"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <input
                        type="number"
                        min={1}
                        max={maxStock}
                        value={item.quantity}
                        onChange={(e) => onSetQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-10 h-6 text-center text-xs font-mono font-bold bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-cyan-500"
                      />

                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        disabled={item.quantity >= maxStock}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={item.quantity >= maxStock ? "Stok Sınırına Ulaşıldı" : "Adet Artır"}
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      {item.quantity >= maxStock && (
                        <span className="text-[9px] text-amber-400 ml-1">
                          (Maks)
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-white font-mono">
                      {formatCurrency(item.total_price)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Finansal Özet & Ödeme Bölümü */}
      {items.length > 0 && (
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/70 space-y-3">
          {/* İndirim Alanı */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              İndirim / Kampanya
            </span>

            {showDiscountInput ? (
              <form onSubmit={handleApplyDiscountSubmit} className="flex items-center gap-1.5">
                <Input
                  type="number"
                  placeholder="TL tutar"
                  value={tempDiscount}
                  onChange={(e) => setTempDiscount(e.target.value)}
                  className="h-7 w-20 text-xs px-2 bg-slate-900 border-slate-700 text-white font-mono"
                  autoFocus
                />
                <Button type="submit" size="sm" className="h-7 px-2 text-[11px] bg-cyan-600 hover:bg-cyan-500">
                  Uygula
                </Button>
                <button
                  type="button"
                  onClick={() => setShowDiscountInput(false)}
                  className="text-slate-500 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowDiscountInput(true)}
                className="text-cyan-400 hover:text-cyan-300 text-[11px] font-medium underline"
              >
                {discountAmount > 0 ? `-${formatCurrency(discountAmount)} (Değiştir)` : "+ İndirim Tanımla"}
              </button>
            )}
          </div>

          {/* Finansal Kırılım */}
          <div className="space-y-1.5 text-xs pt-1 border-t border-slate-800/60 font-medium">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Ara Toplam (KDV Hariç)</span>
              <span className="font-mono text-slate-300">{formatCurrency(summary.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Hesaplanan KDV (%{summary.tax_rate})</span>
              <span className="font-mono text-slate-300">{formatCurrency(summary.tax_amount)}</span>
            </div>
            {summary.discount_total > 0 && (
              <div className="flex items-center justify-between text-emerald-400 text-[11px]">
                <span>Toplam İndirim</span>
                <span className="font-mono">-{formatCurrency(summary.discount_total)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-white pt-2 border-t border-slate-800 text-base font-bold">
              <span>Genel Toplam</span>
              <span className="text-emerald-400 font-mono text-lg font-extrabold">
                {formatCurrency(summary.grand_total)}
              </span>
            </div>
          </div>

          {/* Ödeme Yöntemi Seçici */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400">Ödeme Yöntemi</span>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => onSelectPaymentMethod("cash")}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[11px] font-semibold transition-all ${
                  paymentMethod === "cash"
                    ? "bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Banknote className="w-4 h-4 mb-1" />
                Nakit
              </button>

              <button
                type="button"
                onClick={() => onSelectPaymentMethod("credit_card")}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[11px] font-semibold transition-all ${
                  paymentMethod === "credit_card"
                    ? "bg-cyan-500/15 border-cyan-500/60 text-cyan-300 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <CreditCard className="w-4 h-4 mb-1" />
                Kredi Kartı
              </button>

              <button
                type="button"
                onClick={() => onSelectPaymentMethod("split")}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[11px] font-semibold transition-all ${
                  paymentMethod === "split"
                    ? "bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Sparkles className="w-4 h-4 mb-1" />
                Parçalı
              </button>

              <button
                type="button"
                onClick={() => onSelectPaymentMethod("on_account")}
                disabled={!selectedCustomer}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[11px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  paymentMethod === "on_account"
                    ? "bg-purple-500/15 border-purple-500/60 text-purple-300 shadow-sm"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                }`}
                title={!selectedCustomer ? "Veresiye için müşteri seçmelisiniz" : "Cari Hesaba Borç Kaydet"}
              >
                <User className="w-4 h-4 mb-1" />
                Veresiye
              </button>
            </div>
            {!selectedCustomer && paymentMethod === "on_account" && (
              <p className="text-[10px] text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Veresiye için üstten müşteri seçiniz.
              </p>
            )}
          </div>

          {/* Satışı Tamamla Butonu */}
          <Button
            type="button"
            disabled={isCheckingOut || items.length === 0}
            onClick={onCheckout}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75"
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>İşleniyor (Supabase Transaction)...</span>
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                <span>Satışı Tamamla & Fiş Kes ({formatCurrency(summary.grand_total)})</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
