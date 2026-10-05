"use client"

import React, { useEffect } from "react"
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomerItem, formatCurrency } from "@/types/customer"

interface DeleteConfirmModalProps {
  isOpen: boolean
  customer: CustomerItem | null
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

export function DeleteConfirmModal({
  isOpen,
  customer,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isDeleting, onClose])

  if (!isOpen || !customer) return null

  const hasBalance = customer.balance !== 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white">
              Müşteri Kaydını Sil?
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              <span className="font-semibold text-slate-200">{customer.full_name}</span> adlı müşterinin veritabanı kaydı kalıcı olarak silinecektir.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bakiye Varsa Kritik Uyarı */}
        {hasBalance && (
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/60 text-xs text-amber-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              ⚠️ Dikkat: Aktif Cari Bakiye Mevcut!
            </div>
            <p className="text-[11px] text-amber-300/80">
              Bu müşterinin <span className="font-mono font-bold">{formatCurrency(customer.balance)}</span> tutarında açık cari bakiyesi bulunmaktadır. Kaydı sildiğinizde bu borç/alacak takibi kaybolabilir.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-9"
          >
            Vazgeç
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs h-9 px-4 gap-1.5 shadow-md shadow-rose-600/20"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Siliniyor...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Evet, Kalıcı Olarak Sil
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
