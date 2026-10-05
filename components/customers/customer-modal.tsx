"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  X, 
  User, 
  Phone, 
  FileText, 
  Mail, 
  MapPin, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  customerFormSchema, 
  CustomerFormValues, 
  CustomerItem, 
  splitFullName
} from "@/types/customer"

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CustomerFormValues, id?: string) => Promise<boolean>
  initialCustomer?: CustomerItem | null
  mode: "create" | "edit"
}

export function CustomerModal({
  isOpen,
  onClose,
  onSave,
  initialCustomer,
  mode,
}: CustomerModalProps) {
  const isEdit = mode === "edit" && !!initialCustomer

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      identity_number: "",
      address: "",
      notes: "",
      balance: 0,
      customer_type: "bireysel",
      is_active: true,
    }
  })

  // Modal her açıldığında veya seçili müşteri değiştiğinde formu doldur
  useEffect(() => {
    if (isOpen) {
      if (initialCustomer) {
        const { firstName, lastName } = splitFullName(initialCustomer.full_name)
        reset({
          first_name: initialCustomer.first_name || firstName,
          last_name: initialCustomer.last_name || lastName,
          phone: initialCustomer.phone || "",
          email: initialCustomer.email || "",
          identity_number: initialCustomer.identity_number || "",
          address: initialCustomer.address || "",
          notes: initialCustomer.notes || "",
          balance: Number(initialCustomer.balance) || 0,
          customer_type: initialCustomer.customer_type || (initialCustomer.full_name.includes("Ltd") || initialCustomer.full_name.includes("A.Ş") ? "kurumsal" : "bireysel"),
          is_active: initialCustomer.is_active ?? true,
        })
      } else {
        reset({
          first_name: "",
          last_name: "",
          phone: "",
          email: "",
          identity_number: "",
          address: "",
          notes: "",
          balance: 0,
          customer_type: "bireysel",
          is_active: true,
        })
      }
    }
  }, [isOpen, initialCustomer, reset])

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  const selectedType = watch("customer_type")
  const currentBalance = watch("balance")

  // Hızlı test şablonları
  const applyPreset = (presetType: "individual" | "corporate" | "repair") => {
    if (presetType === "individual") {
      setValue("first_name", "Burak")
      setValue("last_name", "Yıldız")
      setValue("phone", "0533 888 77 66")
      setValue("email", "burak.yildiz@gmail.com")
      setValue("identity_number", "48291038291")
      setValue("address", "Beşiktaş / İstanbul (Ortaköy Mah.)")
      setValue("notes", "iPhone 13 kullanıcısı. Orijinal batarya ve Deji 20W şarj seti aldı. Düzenli müşteri.")
      setValue("balance", 0)
      setValue("customer_type", "bireysel")
      setValue("is_active", true)
    } else if (presetType === "corporate") {
      setValue("first_name", "MobilPlus")
      setValue("last_name", "İletişim Hizmetleri")
      setValue("phone", "0216 444 33 22")
      setValue("email", "siparis@mobilplus.com.tr")
      setValue("identity_number", "6230491823")
      setValue("address", "Ataşehir / İstanbul (Barbaros Mah. No:12)")
      setValue("notes", "Yetkili telefon bayi cari hesabı. Toptan ekran paneli ve orijinal şarj adaptörü tedariği yapılıyor. 15 gün vadeli.")
      setValue("balance", -4500)
      setValue("customer_type", "kurumsal")
      setValue("is_active", true)
    } else if (presetType === "repair") {
      setValue("first_name", "Merve")
      setValue("last_name", "Aydın")
      setValue("phone", "0541 222 33 44")
      setValue("email", "merve.aydin@hotmail.com")
      setValue("identity_number", "31928475920")
      setValue("address", "Bornova / İzmir (Küçükpark)")
      setValue("notes", "Samsung Galaxy S22 sıvı teması arıza kaydı açıldı. Anakart onarımı ve ekran değişimi yapıldı. 500 TL ön avans alındı.")
      setValue("balance", 500)
      setValue("customer_type", "bireysel")
      setValue("is_active", true)
    }
  }

  const onSubmit = async (values: CustomerFormValues) => {
    const success = await onSave(values, initialCustomer?.id)
    if (success) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Başlık Çubuğu */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              {isEdit ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {isEdit ? "Müşteri Bilgilerini Düzenle" : "Yeni Müşteri Kaydet"}
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                  {isEdit ? "Cari Güncelleme" : "Supabase CRUD"}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isEdit 
                  ? "Kayıtlı müşterinin iletişim, borç/alacak ve mağaza notlarını güncelleyin." 
                  : "Dükkanınıza yeni bir bireysel veya kurumsal müşteri kaydı oluşturun."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hızlı Şablonlar (Yalnızca yeni kayıtta) */}
        {!isEdit && (
          <div className="px-5 py-2.5 bg-slate-950/50 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Hızlı Şablonlar:
            </span>
            <button
              type="button"
              onClick={() => applyPreset("individual")}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-colors whitespace-nowrap"
            >
              👤 Bireysel Müşteri
            </button>
            <button
              type="button"
              onClick={() => applyPreset("corporate")}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-colors whitespace-nowrap"
            >
              🏢 Kurumsal Bayi (Cari)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("repair")}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 transition-colors whitespace-nowrap"
            >
              🔧 Tamir & Servis Kaydı
            </button>
          </div>
        )}

        {/* Modal Form İçeriği */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-5 space-y-5 flex-1">
          {/* Müşteri Türü Seçici */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">Müşteri Türü</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue("customer_type", "bireysel")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  selectedType === "bireysel"
                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <User className="w-4 h-4" />
                Bireysel Müşteri (Şahıs)
              </button>
              <button
                type="button"
                onClick={() => setValue("customer_type", "kurumsal")}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                  selectedType === "kurumsal"
                    ? "bg-purple-500/10 border-purple-500/50 text-purple-300 shadow-sm shadow-purple-500/20"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                }`}
              >
                <Building2 className="w-4 h-4" />
                Kurumsal Müşteri / Bayi
              </button>
            </div>
          </div>

          {/* Ad ve Soyad Alanları (Zorunlu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Adı <span className="text-rose-400">*</span></span>
                {errors.first_name && (
                  <span className="text-[11px] text-rose-400 flex items-center gap-1 font-normal">
                    <AlertCircle className="w-3 h-3" /> {errors.first_name.message}
                  </span>
                )}
              </Label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="first_name"
                  placeholder="Örn: Ahmet veya Firma Ünvanı"
                  {...register("first_name")}
                  className={`pl-9 bg-slate-950/60 border-slate-800 text-xs h-9 text-white placeholder:text-slate-500 ${
                    errors.first_name ? "border-rose-500/60 focus:border-rose-500" : "focus:border-cyan-500"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="last_name" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Soyadı <span className="text-rose-400">*</span></span>
                {errors.last_name && (
                  <span className="text-[11px] text-rose-400 flex items-center gap-1 font-normal">
                    <AlertCircle className="w-3 h-3" /> {errors.last_name.message}
                  </span>
                )}
              </Label>
              <Input
                id="last_name"
                placeholder="Örn: Yılmaz veya Ltd. Şti."
                {...register("last_name")}
                className={`bg-slate-950/60 border-slate-800 text-xs h-9 text-white placeholder:text-slate-500 ${
                  errors.last_name ? "border-rose-500/60 focus:border-rose-500" : "focus:border-cyan-500"
                }`}
              />
            </div>
          </div>

          {/* İletişim: Telefon (Zorunlu) & E-posta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>İletişim Telefonu <span className="text-rose-400">*</span></span>
                {errors.phone && (
                  <span className="text-[11px] text-rose-400 flex items-center gap-1 font-normal">
                    <AlertCircle className="w-3 h-3" /> {errors.phone.message}
                  </span>
                )}
              </Label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="phone"
                  placeholder="0532 123 45 67"
                  {...register("phone")}
                  onChange={(e) => {
                    setValue("phone", e.target.value)
                  }}
                  className={`pl-9 bg-slate-950/60 border-slate-800 text-xs h-9 text-white font-mono placeholder:text-slate-500 ${
                    errors.phone ? "border-rose-500/60 focus:border-rose-500" : "focus:border-cyan-500"
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>E-posta Adresi <span className="text-slate-500 font-normal">(Opsiyonel)</span></span>
                {errors.email && (
                  <span className="text-[11px] text-rose-400 flex items-center gap-1 font-normal">
                    <AlertCircle className="w-3 h-3" /> {errors.email.message}
                  </span>
                )}
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="musteri@ornek.com"
                  {...register("email")}
                  className="pl-9 bg-slate-950/60 border-slate-800 text-xs h-9 text-white placeholder:text-slate-500 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* T.C. Kimlik / Vergi No & Cari Bakiye */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="identity_number" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>T.C. Kimlik / Vergi No <span className="text-slate-500 font-normal">(İkinci el cihaz alım fişi için)</span></span>
                {errors.identity_number && (
                  <span className="text-[11px] text-rose-400 flex items-center gap-1 font-normal">
                    <AlertCircle className="w-3 h-3" /> {errors.identity_number.message}
                  </span>
                )}
              </Label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="identity_number"
                  placeholder="11 haneli TCKN veya 10 haneli VKN"
                  maxLength={11}
                  {...register("identity_number")}
                  className="pl-9 bg-slate-950/60 border-slate-800 text-xs h-9 text-white font-mono placeholder:text-slate-500 focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="balance" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Cari Hesap Bakiyesi (TL)</span>
                <span className={`text-[11px] font-mono ${
                  currentBalance < 0 ? "text-rose-400" : currentBalance > 0 ? "text-emerald-400" : "text-slate-400"
                }`}>
                  {currentBalance < 0 ? "Borç (Veresiye)" : currentBalance > 0 ? "Müşteri Alacağı (Avans)" : "Bakiye Sıfır"}
                </span>
              </Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance", { valueAsNumber: true })}
                className="bg-slate-950/60 border-slate-800 text-xs h-9 text-white font-mono placeholder:text-slate-500 focus:border-cyan-500"
              />
              <p className="text-[10px] text-slate-400">
                Eksi (-) değerler müşterinin borcunu (veresiye), artı (+) değerler mağazadaki avansını ifade eder.
              </p>
            </div>
          </div>

          {/* Adres / Şehir Bilgisi */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold text-slate-300">
              Şehir / Adres Detayı <span className="text-slate-500 font-normal">(Opsiyonel)</span>
            </Label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
              <Input
                id="address"
                placeholder="Örn: Kadıköy / İstanbul (Cadde, sokak, no)"
                {...register("address")}
                className="pl-9 bg-slate-950/60 border-slate-800 text-xs h-9 text-white placeholder:text-slate-500 focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Notlar Alanı (Gereksinimde belirtilen önemli alan) */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Müşteri Notları & Cihaz / Servis Geçmişi
              </span>
              <span className="text-[10px] text-slate-500">Maks. 1000 karakter</span>
            </Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Örn: iPhone 14 Pro Max ekran değişimi yapıldı (Orijinal GX Panel). 6 ay ekran garantisi tanımlandı. VIP Müşteri..."
              {...register("notes")}
              className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Aktiflik Durumu */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40 border border-slate-800/80">
            <div>
              <div className="text-xs font-medium text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Aktif Müşteri Kaydı
              </div>
              <p className="text-[11px] text-slate-400">
                Pasife alınan müşteriler arama sonuçlarında gizlenir ve yeni fiş/fatura kesilemez.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("is_active")}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Modal Butonları */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs h-9"
            >
              İptal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs h-9 px-4 gap-2 shadow-md shadow-cyan-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : isEdit ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Değişiklikleri Kaydet
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Müşteriyi Kaydet
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
