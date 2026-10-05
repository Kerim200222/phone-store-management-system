"use client"

import React, { useEffect } from "react"
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CreditCard, 
  Calendar, 
  Edit3, 
  Trash2, 
  MessageCircle,
  ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomAvatar } from "@/components/ui/custom-avatar"
import { CustomerItem, formatCurrency, formatPhoneNumber } from "@/types/customer"

interface CustomerDetailModalProps {
  customer: CustomerItem | null
  isOpen: boolean
  onClose: () => void
  onEdit: (customer: CustomerItem) => void
  onDelete: (customer: CustomerItem) => void
}

export function CustomerDetailModal({
  customer,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: CustomerDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !customer) return null

  const isDebt = customer.balance < 0
  const isCredit = customer.balance > 0
  const isCorporate = customer.customer_type === "kurumsal" || customer.full_name.includes("Ltd") || customer.full_name.includes("A.Ş")

  // WhatsApp için telefon formatı (905xxxxxxxxx)
  const cleanPhoneForWa = customer.phone.replace(/\D/g, "")
  const waNumber = cleanPhoneForWa.startsWith("0") 
    ? `9${cleanPhoneForWa}` 
    : cleanPhoneForWa.startsWith("90") 
      ? cleanPhoneForWa 
      : `90${cleanPhoneForWa}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <CustomAvatar
              name={customer.full_name}
              size={52}
              showBadge={true}
              badgeColor={customer.is_active ? "emerald" : "rose"}
              className="border-2 border-cyan-500/30 shadow-lg shadow-cyan-500/10"
            />
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-white truncate">
                  {customer.full_name}
                </h2>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  isCorporate 
                    ? "bg-purple-950/80 text-purple-300 border-purple-800/60" 
                    : "bg-cyan-950/80 text-cyan-300 border-cyan-800/60"
                }`}>
                  {isCorporate ? "🏢 Kurumsal Bayi" : "👤 Bireysel Müşteri"}
                </span>
                {customer.is_active ? (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Aktif
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Pasif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {formatPhoneNumber(customer.phone)}
              </p>
            </div>
          </div>

          {/* Hızlı İletişim Aksiyon Butonları */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/60">
            <a
              href={`tel:${customer.phone.replace(/\s+/g, "")}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              Hemen Ara
            </a>
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 text-xs font-medium border border-emerald-800/60 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              WhatsApp
            </a>
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                E-posta
              </a>
            )}
          </div>
        </div>

        {/* Modal Gövdesi */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Cari Bakiye Kartı */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isDebt 
              ? "bg-rose-950/20 border-rose-900/40" 
              : isCredit 
                ? "bg-emerald-950/20 border-emerald-900/40" 
                : "bg-slate-950/40 border-slate-800"
          }`}>
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <CreditCard className="w-4 h-4 text-slate-400" />
                Cari Hesap Bakiyesi
              </div>
              <div className={`text-xl font-bold font-mono mt-1 ${
                isDebt ? "text-rose-400" : isCredit ? "text-emerald-400" : "text-slate-200"
              }`}>
                {formatCurrency(customer.balance)}
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                isDebt 
                  ? "bg-rose-900/40 text-rose-300 border border-rose-700/50" 
                  : isCredit 
                    ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50" 
                    : "bg-slate-800 text-slate-300 border border-slate-700"
              }`}>
                {isDebt ? "Açık Veresiye (Borç)" : isCredit ? "Müşteri Alacağı (Avans)" : "Hesap Dengeli"}
              </span>
              <p className="text-[10px] text-slate-400 mt-1">
                {isDebt ? "Tahsil edilmesi gereken bakiye" : isCredit ? "Gelecek alışveriş için kullanılabilir" : "Borç veya alacak bulunmuyor"}
              </p>
            </div>
          </div>

          {/* İletişim & Kimlik Detayları Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                Telefon
              </span>
              <p className="font-mono text-slate-200 font-medium">
                {formatPhoneNumber(customer.phone)}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                E-posta
              </span>
              <p className="text-slate-200 truncate">
                {customer.email || "Belirtilmemiş"}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                T.C. Kimlik / Vergi No
              </span>
              <p className="font-mono text-slate-200">
                {customer.identity_number || "Belirtilmemiş"}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Kayıt Tarihi
              </span>
              <p className="text-slate-200">
                {new Date(customer.created_at).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>
          </div>

          {/* Adres Bilgisi */}
          {customer.address && (
            <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-1 text-xs">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Kayıtlı Adres & Şehir
              </span>
              <p className="text-slate-200">
                {customer.address}
              </p>
            </div>
          )}

          {/* Notlar & Cihaz Geçmişi (Gereksinimde istenen alan) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                Dükkan Notları, Cihaz & Garanti Geçmişi
              </span>
              <span className="text-[10px] text-cyan-400/80 font-mono">Dükkan Hafızası</span>
            </div>
            {customer.notes ? (
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/80 p-3 rounded-lg border border-slate-800/60">
                {customer.notes}
              </p>
            ) : (
              <p className="text-xs text-slate-500 italic p-2">
                Bu müşteri için henüz özel bir cihaz veya servis notu eklenmemiş.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer Eylemleri */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-900/90">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(customer)}
            className="border-rose-900/40 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800 text-xs h-9 gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Müşteriyi Sil
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-9"
            >
              Kapat
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onClose()
                onEdit(customer)
              }}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs h-9 px-4 gap-1.5 shadow-md shadow-cyan-600/20"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Müşteriyi Düzenle
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
