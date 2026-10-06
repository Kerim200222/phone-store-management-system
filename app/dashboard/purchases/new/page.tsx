"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  Smartphone, 
  User, 
  DollarSign, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Plus, 
  Barcode, 
  RefreshCw, 
  Wallet, 
  Building, 
  CreditCard, 
  Sliders, 
  Battery, 
  ChevronRight, 
  Info 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  purchaseFormSchema, 
  PurchaseFormValues, 
  PURCHASE_PRESETS, 
  PurchasePreset,
  PurchaseContractData
} from "@/types/purchase"
import { POSCustomerSelect } from "@/types/pos"
import { INITIAL_CUSTOMERS, CustomerFormValues } from "@/types/customer"
import { generateLuhnIMEI } from "@/types/inventory"
import { createClient } from "@/utils/supabase/client"
import { processSecondhandDevicePurchase } from "@/lib/purchase-service"
import { PurchaseContractModal } from "@/components/purchases/purchase-contract-modal"
import { CustomerModal } from "@/components/customers/customer-modal"

interface CustomerDbClient {
  from(table: string): {
    select(query?: string): {
      order(column: string, options?: { ascending?: boolean }): Promise<{
        data: Record<string, unknown>[] | null
        error: { message: string } | null
      }>
    }
    insert(payload: unknown[]): {
      select(): Promise<{
        data: Record<string, unknown>[] | null
        error: { message: string } | null
      }>
    }
  }
}

export default function NewPurchasePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<POSCustomerSelect[]>(INITIAL_CUSTOMERS)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const [contractData, setContractData] = useState<PurchaseContractData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  // React Hook Form Kurulumu
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      customerId: INITIAL_CUSTOMERS[0]?.id || "",
      brand: "Apple",
      model: "iPhone 13 (A2633)",
      imei: generateLuhnIMEI(),
      batteryHealth: 88,
      cosmeticCondition: "A (Çok Temiz / Mikro Kılcal)",
      storage: "128 GB",
      color: "Gece Yarısı",
      purchasePrice: 21500,
      targetSalePrice: 28500,
      paymentMethod: "cash",
      hasBox: true,
      hasInvoice: true,
      hasOriginalCharger: false,
      shelfLocation: "İkinci El Vitrin A-1",
      technicalNotes: "Orijinal ekran ve batarya. Değişen parça yok. FaceID ve TrueTone çalışıyor.",
      imageUrl: "",
    }
  })

  // Canlı İzlenen Alanlar
  const watchedCustomerId = watch("customerId")
  const watchedBrand = watch("brand")
  const watchedModel = watch("model")
  const watchedImei = watch("imei")
  const watchedBatteryHealth = watch("batteryHealth")
  const watchedCosmetic = watch("cosmeticCondition")
  const watchedStorage = watch("storage")
  const watchedColor = watch("color")
  const watchedPurchasePrice = watch("purchasePrice") || 0
  const watchedTargetSalePrice = watch("targetSalePrice") || 0
  const watchedPaymentMethod = watch("paymentMethod")
  const watchedHasBox = watch("hasBox")
  const watchedHasInvoice = watch("hasInvoice")
  const watchedHasCharger = watch("hasOriginalCharger")

  // Seçili Müşteri
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === watchedCustomerId) || customers[0] || null
  }, [customers, watchedCustomerId])

  // Supabase'den Müşterileri Çekme
  useEffect(() => {
    async function loadCustomers() {
      try {
        const supabase = createClient()
        const db = supabase as unknown as CustomerDbClient
        const { data, error } = await db
          .from("customers")
          .select("*")
          .order("full_name", { ascending: true })

        if (data && Array.isArray(data) && data.length > 0 && !error) {
          const mapped: POSCustomerSelect[] = data.map((c) => ({
            id: String(c.id || ""),
            full_name: String(c.full_name || `${c.first_name || ""} ${c.last_name || ""}`.trim()),
            phone: String(c.phone || ""),
            tckn: c.tckn ? String(c.tckn) : undefined,
            balance: Number(c.balance) || 0,
            city: c.city ? String(c.city) : undefined,
            address: c.address ? String(c.address) : undefined,
          }))
          setCustomers(mapped)
          if (!watchedCustomerId) {
            setValue("customerId", mapped[0].id)
          }
        }
      } catch (err) {
        console.warn("Müşteri listesi çekilirken yerel mock veriler kullanılıyor:", err)
      }
    }
    loadCustomers()
  }, [setValue, watchedCustomerId])

  // Luhn IMEI Doğrulama Mantığı
  const isImeiValid = useMemo(() => {
    if (!watchedImei || watchedImei.length !== 15 || !/^\d{15}$/.test(watchedImei)) {
      return false
    }
    let sum = 0
    for (let i = 0; i < 15; i++) {
      let digit = parseInt(watchedImei.charAt(i), 10)
      if (i % 2 === 1) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
    }
    return sum % 10 === 0
  }, [watchedImei])

  // Kâr ve Marj Hesaplama
  const financialSummary = useMemo(() => {
    const buy = Number(watchedPurchasePrice) || 0
    const sell = Number(watchedTargetSalePrice) || 0
    const profit = sell - buy
    const margin = sell > 0 ? (profit / sell) * 100 : 0
    return {
      buy,
      sell,
      profit,
      margin: Math.round(margin * 10) / 10
    }
  }, [watchedPurchasePrice, watchedTargetSalePrice])

  // Şablon Seçildiğinde Doldur
  const handleApplyPreset = (preset: PurchasePreset) => {
    setActivePreset(preset.id)
    setValue("brand", preset.brand, { shouldValidate: true })
    setValue("model", preset.model, { shouldValidate: true })
    setValue("imei", generateLuhnIMEI(), { shouldValidate: true })
    setValue("batteryHealth", preset.batteryHealth, { shouldValidate: true })
    setValue("cosmeticCondition", preset.cosmeticCondition, { shouldValidate: true })
    setValue("storage", preset.storage, { shouldValidate: true })
    setValue("color", preset.color, { shouldValidate: true })
    setValue("purchasePrice", preset.purchasePrice, { shouldValidate: true })
    setValue("targetSalePrice", preset.targetSalePrice, { shouldValidate: true })
    setValue("hasBox", preset.hasBox, { shouldValidate: true })
    setValue("hasInvoice", preset.hasInvoice, { shouldValidate: true })
    setValue("hasOriginalCharger", preset.hasOriginalCharger, { shouldValidate: true })
    setValue("shelfLocation", preset.shelfLocation, { shouldValidate: true })
    setValue("technicalNotes", preset.technicalNotes, { shouldValidate: true })
  }

  // Yeni Müşteri Ekleme Callback'i
  const handleSaveNewCustomer = async (data: CustomerFormValues): Promise<boolean> => {
    try {
      const newCust: POSCustomerSelect = {
        id: "cust-" + Date.now(),
        full_name: `${data.first_name} ${data.last_name}`.trim(),
        phone: data.phone,
        tckn: data.identity_number || null,
        city: null,
        address: data.address || null,
        balance: 0,
      }
      setCustomers((prev) => [newCust, ...prev])
      setValue("customerId", newCust.id, { shouldValidate: true })
      setIsCustomerModalOpen(false)
      return true
    } catch {
      return false
    }
  }

  // Form Gönderimi (Satın Alma İşlemi)
  const onSubmit = async (values: PurchaseFormValues) => {
    if (!selectedCustomer) {
      setSubmitError("Lütfen cihazı satın alacağınız müşteriyi seçiniz.")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await processSecondhandDevicePurchase(values, selectedCustomer)

      if (result.success) {
        // Sözleşme Modalı Verisini Hazırla
        const contract: PurchaseContractData = {
          contractNumber: result.transactionNumber,
          receiptNo: result.transactionNumber,
          productId: result.productId,
          date: new Date().toISOString(),
          customer: selectedCustomer,
          customerName: selectedCustomer.full_name,
          customerPhone: selectedCustomer.phone,
          customerTckn: selectedCustomer.tckn,
          customerAddress: selectedCustomer.address || selectedCustomer.city,
          brand: values.brand,
          model: values.model,
          imei: values.imei,
          batteryHealth: values.batteryHealth,
          cosmeticCondition: values.cosmeticCondition,
          storage: values.storage,
          color: values.color,
          hasBox: values.hasBox,
          hasInvoice: values.hasInvoice,
          hasCharger: values.hasOriginalCharger,
          technicalNotes: values.technicalNotes,
          purchasePrice: values.purchasePrice,
          targetSalePrice: values.targetSalePrice,
          paymentMethod: values.paymentMethod,
          estimatedProfit: values.targetSalePrice - values.purchasePrice,
          profitMarginPercent: Math.round(((values.targetSalePrice - values.purchasePrice) / (values.targetSalePrice || 1)) * 100),
          storeName: "Telefon Mağazası A.Ş.",
          storeAddress: "Bağdat Cad. No:42/A Kadıköy / İstanbul",
          storePhone: "(0216) 555 12 34",
        }

        setContractData(contract)
        setIsContractModalOpen(true)
      } else {
        setSubmitError(result.error || "İşlem kaydedilirken bir hata oluştu.")
      }
    } catch (err: unknown) {
      console.error("Purchase error:", err)
      const errorMsg = err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu."
      setSubmitError(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetForNew = () => {
    reset({
      customerId: customers[0]?.id || "",
      brand: "Apple",
      model: "iPhone 14 Pro",
      imei: generateLuhnIMEI(),
      batteryHealth: 92,
      cosmeticCondition: "A+ (Kusursuz / Sıfır Ayarında)",
      storage: "128 GB",
      color: "Derin Mor",
      purchasePrice: 38000,
      targetSalePrice: 47500,
      paymentMethod: "cash",
      hasBox: true,
      hasInvoice: true,
      hasOriginalCharger: true,
      shelfLocation: "İkinci El Vitrin A-1",
      technicalNotes: "Temiz cihaz. Kozmetik sıfır ayarında.",
      imageUrl: "",
    })
    setActivePreset(null)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Üst Başlık & Eylemler */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span 
              onClick={() => router.push("/dashboard")} 
              className="hover:text-indigo-600 cursor-pointer"
            >
              Yönetim Paneli
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span 
              onClick={() => router.push("/dashboard/inventory")} 
              className="hover:text-indigo-600 cursor-pointer"
            >
              Envanter
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-bold">İkinci El Cihaz Alımı</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Smartphone className="w-8 h-8 text-indigo-600" />
            İkinci El Cihaz Alım İşlemi
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Müşteriden ikinci el cihaz satın alıp envantere ekleyin ve kasadan çıkış tutarını işleyin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/inventory")}
            className="flex items-center gap-1.5 border-slate-300 font-semibold text-slate-700 bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Envantere Dön
          </Button>
        </div>
      </div>

      {/* Hızlı Test Şablonları Çubuğu */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Hızlı Alım Şablonları (Tek Tıkla Doldur):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {PURCHASE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                activePreset === preset.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Hata Bildirimi */}
      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">Hata: </span>
            {submitError}
          </div>
        </div>
      )}

      {/* Ana Grid: Sol Form (2 sütun), Sağ Önizleme & Kasa Kartı (1 sütun) */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* SOL FORM ALANI (lg:col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* BÖLÜM 1: MÜŞTERİ (SATICI) SEÇİMİ */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    1. Satıcı (Müşteri) Bilgileri
                  </h2>
                  <p className="text-xs text-slate-500">Cihazı satan müşteriyi seçin veya sisteme yeni müşteri kaydedin.</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCustomerModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Yeni Müşteri Ekle
              </Button>
            </div>

            <div className="space-y-3">
              <Label htmlFor="customerId" className="text-xs font-bold text-slate-700">
                Sistemde Kayıtlı Müşteri <span className="text-red-500">*</span>
              </Label>
              <select
                id="customerId"
                {...register("customerId")}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.phone}) {c.tckn ? `- TCKN: ${c.tckn}` : ""}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="text-xs text-red-600 font-medium">{errors.customerId.message}</p>
              )}

              {/* Seçili Müşteri Bilgi Rozeti */}
              {selectedCustomer && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{selectedCustomer.full_name}</span>
                    <span className="text-slate-500 ml-2 font-mono">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCustomer.tckn && (
                      <span className="px-2 py-0.5 bg-slate-200/80 rounded font-mono text-[11px] text-slate-700">
                        TCKN: {selectedCustomer.tckn}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      selectedCustomer.balance < 0 
                        ? "bg-red-100 text-red-700" 
                        : selectedCustomer.balance > 0 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-slate-200 text-slate-700"
                    }`}>
                      Bakiye: {formatCurrency(selectedCustomer.balance)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BÖLÜM 2: CİHAZ MARKA, MODEL & 15 HANELİ IMEI */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Barcode className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  2. Cihaz Kimlik & Donanım Bilgileri
                </h2>
                <p className="text-xs text-slate-500">Cihazın modeli, 15 haneli benzersiz IMEI numarası ve fiziksel nitelikleri.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Marka */}
              <div className="space-y-1.5">
                <Label htmlFor="brand" className="text-xs font-bold text-slate-700">
                  Marka <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="brand"
                  placeholder="Örn: Apple, Samsung, Xiaomi"
                  {...register("brand")}
                  className="h-10 text-sm"
                />
                {errors.brand && <p className="text-xs text-red-600">{errors.brand.message}</p>}
              </div>

              {/* Model */}
              <div className="space-y-1.5">
                <Label htmlFor="model" className="text-xs font-bold text-slate-700">
                  Model Adı / Kod <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="model"
                  placeholder="Örn: iPhone 13 128GB (A2633)"
                  {...register("model")}
                  className="h-10 text-sm"
                />
                {errors.model && <p className="text-xs text-red-600">{errors.model.message}</p>}
              </div>

              {/* 15 Haneli IMEI Numarası */}
              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="imei" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    15 Haneli IMEI Numarası <span className="text-red-500">*</span>
                    {watchedImei && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isImeiValid 
                          ? "bg-emerald-100 text-emerald-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {isImeiValid ? "✓ Luhn Geçerli" : `${watchedImei.length}/15 Hane`}
                      </span>
                    )}
                  </Label>
                  <button
                    type="button"
                    onClick={() => setValue("imei", generateLuhnIMEI(), { shouldValidate: true })}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Rastgele Geçerli IMEI Üret
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="imei"
                    maxLength={15}
                    placeholder="358921098412345 (15 Hane)"
                    {...register("imei")}
                    className={`h-11 font-mono tracking-widest text-sm font-bold ${
                      isImeiValid ? "border-emerald-500 ring-emerald-50" : ""
                    }`}
                  />
                  <div className="absolute right-3 top-3 text-slate-400">
                    <Barcode className="w-5 h-5" />
                  </div>
                </div>
                {errors.imei && <p className="text-xs text-red-600">{errors.imei.message}</p>}
                <p className="text-[11px] text-slate-400">
                  Cihazın arama ekranına *#06# yazılarak öğrenilen 15 haneli kimlik numarasıdır. Envanterde bu IMEI ile tekil izlenecektir.
                </p>
              </div>

              {/* Hafıza Kapasitesi */}
              <div className="space-y-1.5">
                <Label htmlFor="storage" className="text-xs font-bold text-slate-700">
                  Depolama Alanı <span className="text-red-500">*</span>
                </Label>
                <select
                  id="storage"
                  {...register("storage")}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="64 GB">64 GB</option>
                  <option value="128 GB">128 GB</option>
                  <option value="256 GB">256 GB</option>
                  <option value="512 GB">512 GB</option>
                  <option value="1 TB">1 TB</option>
                </select>
                {errors.storage && <p className="text-xs text-red-600">{errors.storage.message}</p>}
              </div>

              {/* Renk */}
              <div className="space-y-1.5">
                <Label htmlFor="color" className="text-xs font-bold text-slate-700">
                  Kasa Rengi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="color"
                  placeholder="Örn: Gece Yarısı, Grafit, Mavi"
                  {...register("color")}
                  className="h-10 text-sm"
                />
                {errors.color && <p className="text-xs text-red-600">{errors.color.message}</p>}
              </div>
            </div>
          </div>

          {/* BÖLÜM 3: KOZMETİK VE EKSPERTİZ DURUMU */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  3. Donanım & Kozmetik Ekspertiz
                </h2>
                <p className="text-xs text-slate-500">Batarya sağlığı, kozmetik sınıflandırma ve kutu/fatura varlığı.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Batarya Sağlığı */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="batteryHealth" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-slate-500" />
                    Batarya Sağlığı (%) <span className="text-red-500">*</span>
                  </Label>
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                    watchedBatteryHealth >= 85 
                      ? "bg-emerald-100 text-emerald-800" 
                      : watchedBatteryHealth >= 75 
                      ? "bg-amber-100 text-amber-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    %{watchedBatteryHealth}
                  </span>
                </div>
                <Controller
                  control={control}
                  name="batteryHealth"
                  render={({ field }) => (
                    <div className="space-y-1">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                        className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
                      />
                    </div>
                  )}
                />
                {errors.batteryHealth && <p className="text-xs text-red-600">{errors.batteryHealth.message}</p>}
              </div>

              {/* Kozmetik Durum */}
              <div className="space-y-1.5">
                <Label htmlFor="cosmeticCondition" className="text-xs font-bold text-slate-700">
                  Kozmetik Durum Derecesi <span className="text-red-500">*</span>
                </Label>
                <select
                  id="cosmeticCondition"
                  {...register("cosmeticCondition")}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="A+ (Kusursuz / Sıfır Ayarında)">A+ (Kusursuz / Sıfır Ayarında)</option>
                  <option value="A (Çok Temiz / Mikro Kılcal)">A (Çok Temiz / Mikro Kılcal)</option>
                  <option value="B (Hafif Kılcal Çizikler)">B (Hafif Kılcal Çizikler)</option>
                  <option value="C (Darbeli / Kasada Ezik Var)">C (Darbeli / Kasada Ezik Var)</option>
                </select>
                {errors.cosmeticCondition && <p className="text-xs text-red-600">{errors.cosmeticCondition.message}</p>}
              </div>

              {/* Aksesuar Checkboxları */}
              <div className="sm:col-span-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Teslim Alınan Kutu & Aksesuarlar
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("hasBox")}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>📦 Orijinal Kutu</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("hasInvoice")}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>🧾 Orijinal Fatura</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("hasOriginalCharger")}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>🔌 Orijinal Şarj Cihazı</span>
                  </label>
                </div>
              </div>

              {/* Raf / Vitrin Konumu */}
              <div className="space-y-1.5">
                <Label htmlFor="shelfLocation" className="text-xs font-bold text-slate-700">
                  Depo / Vitrin Konumu
                </Label>
                <Input
                  id="shelfLocation"
                  placeholder="Örn: İkinci El Vitrin A-1"
                  {...register("shelfLocation")}
                  className="h-10 text-sm"
                />
              </div>

              {/* Teknik / Ekspertiz Notları */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="technicalNotes" className="text-xs font-bold text-slate-700">
                  Ekspertiz ve Teknik Notlar
                </Label>
                <textarea
                  id="technicalNotes"
                  rows={2}
                  placeholder="Örn: TrueTone ve FaceID aktif. Ekran değişmemiş, sağ köşede kılcal çizik mevcut."
                  {...register("technicalNotes")}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* BÖLÜM 4: ALIŞ VE HEDEF SATIŞ FİYATI & KASA ÇIKIŞI */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  4. Maliyet & Kasa Çıkış Ayarları
                </h2>
                <p className="text-xs text-slate-500">Müşteriye ödenecek tutar (kasa çıkışı) ve satış hedef fiyatı.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Alış Fiyatı (Kasadan Çıkacak Tutar) */}
              <div className="space-y-1.5">
                <Label htmlFor="purchasePrice" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  Alış Fiyatı (₺) <span className="text-red-500">*</span>
                  <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.2 rounded font-semibold">
                    Kasadan Çıkacak
                  </span>
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="10"
                  placeholder="21500"
                  {...register("purchasePrice", { valueAsNumber: true })}
                  className="h-11 font-mono font-bold text-base text-red-600"
                />
                {errors.purchasePrice && <p className="text-xs text-red-600">{errors.purchasePrice.message}</p>}
              </div>

              {/* Hedef Satış Fiyatı */}
              <div className="space-y-1.5">
                <Label htmlFor="targetSalePrice" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  Hedef Satış Fiyatı (₺) <span className="text-red-500">*</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                    Etiket Fiyatı
                  </span>
                </Label>
                <Input
                  id="targetSalePrice"
                  type="number"
                  step="10"
                  placeholder="28500"
                  {...register("targetSalePrice", { valueAsNumber: true })}
                  className="h-11 font-mono font-bold text-base text-emerald-700"
                />
                {errors.targetSalePrice && <p className="text-xs text-red-600">{errors.targetSalePrice.message}</p>}
              </div>

              {/* Ödeme Yöntemi */}
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-xs font-bold text-slate-700 block">
                  Ödeme Türü (Paranın Çıkış Kanalı) <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    watchedPaymentMethod === "cash" 
                      ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold shadow-sm" 
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                  }`}>
                    <input
                      type="radio"
                      value="cash"
                      {...register("paymentMethod")}
                      className="sr-only"
                    />
                    <Wallet className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs">Nakit Ödeme</div>
                      <div className="text-[10px] font-normal text-slate-500">Ana Kasa Nakit Çıkışı</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    watchedPaymentMethod === "bank_transfer" 
                      ? "border-indigo-500 bg-indigo-50/50 text-indigo-950 font-bold shadow-sm" 
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                  }`}>
                    <input
                      type="radio"
                      value="bank_transfer"
                      {...register("paymentMethod")}
                      className="sr-only"
                    />
                    <Building className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <div className="text-xs">Havale / EFT</div>
                      <div className="text-[10px] font-normal text-slate-500">Banka Hesabı Çıkışı</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    watchedPaymentMethod === "on_account" 
                      ? "border-amber-500 bg-amber-50/50 text-amber-950 font-bold shadow-sm" 
                      : "border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
                  }`}>
                    <input
                      type="radio"
                      value="on_account"
                      {...register("paymentMethod")}
                      className="sr-only"
                    />
                    <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-xs">Cari Mahsup</div>
                      <div className="text-[10px] font-normal text-slate-500">Müşteri Cari Alacağı</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ SÜTUN: CANLI ÖNİZLEME, MARJ ANALİZİ VE İŞLEMİ ONAYLA (lg:col-span-1) */}
        <div className="space-y-6">
          {/* Canlı Cihaz Önizleme Kartı */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-900 text-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Cihaz Önizleme Kartı
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/30">
                  İkinci El
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-1">
                {watchedBrand || "Marka"} {watchedModel || "Model"}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {watchedStorage} • {watchedColor || "Belirtilmedi"}
              </p>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">IMEI:</span>
                <span className="font-mono font-bold text-slate-900">
                  {watchedImei || "Henüz girilmedi"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Batarya Sağlığı:</span>
                <span className="font-bold text-slate-900">%{watchedBatteryHealth}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Kozmetik:</span>
                <span className="font-semibold text-slate-800 text-[11px]">{watchedCosmetic}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Aksesuarlar:</span>
                <div className="flex items-center gap-1.5 font-bold text-[10px]">
                  {watchedHasBox && <span className="text-emerald-700 bg-emerald-50 px-1 rounded">Kutu</span>}
                  {watchedHasInvoice && <span className="text-emerald-700 bg-emerald-50 px-1 rounded">Fatura</span>}
                  {watchedHasCharger && <span className="text-emerald-700 bg-emerald-50 px-1 rounded">Şarj</span>}
                  {!watchedHasBox && !watchedHasInvoice && !watchedHasCharger && <span className="text-slate-400">Yalnız Cihaz</span>}
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">Satıcı Müşteri:</span>
                <span className="font-bold text-indigo-700">{selectedCustomer?.full_name || "-"}</span>
              </div>
            </div>
          </div>

          {/* Kâr ve Kasa Analiz Kartı */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" />
              Mali Özet & Kâr Tahmini
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Alış Bedeli (Gider):</span>
                <span className="font-mono font-bold text-red-600">
                  - {formatCurrency(financialSummary.buy)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">Hedef Satış:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatCurrency(financialSummary.sell)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-slate-800 font-bold">Tahmini Brüt Kâr:</span>
                <span className={`font-mono font-black text-sm ${
                  financialSummary.profit >= 0 ? "text-emerald-700" : "text-red-600"
                }`}>
                  {financialSummary.profit >= 0 ? "+" : ""}{formatCurrency(financialSummary.profit)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Brüt Kâr Marjı:</span>
                <span className="font-bold text-slate-800">%{financialSummary.margin}</span>
              </div>
            </div>

            {/* Kasa Para Çıkış Notu */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Kasa Entegrasyonu:</strong> İşlem onaylandığında kasadan{" "}
                <span className="font-bold underline">{formatCurrency(financialSummary.buy)}</span> tutarında 
                para çıkış fişi kesilecek ve cihaz 1 adet stokla envantere eklenecektir.
              </div>
            </div>

            {/* Satın Alma Butonu */}
            <Button
              type="submit"
              disabled={isSubmitting || !isImeiValid || financialSummary.buy <= 0}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  İşlem Yapılıyor & Kasa Güncelleniyor...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Cihazı Satın Al & Kasadan Çık ({formatCurrency(financialSummary.buy)})
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Sözleşme & Gider Pusulası Modalı */}
      <PurchaseContractModal
        isOpen={isContractModalOpen}
        data={contractData}
        onClose={() => setIsContractModalOpen(false)}
        onNewPurchase={handleResetForNew}
      />

      {/* Hızlı Müşteri Oluşturma Modalı */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        mode="create"
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveNewCustomer}
      />
    </div>
  )
}
