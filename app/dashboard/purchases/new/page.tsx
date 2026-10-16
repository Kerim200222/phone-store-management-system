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
  Info,
  TrendingUp
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
import { toast } from "sonner"
import { parseAppError } from "@/lib/error-handler"

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
          .select("id, full_name, phone, identity_number, balance, address")
          .order("full_name", { ascending: true })

        if (data && Array.isArray(data) && data.length > 0 && !error) {
          const mapped: POSCustomerSelect[] = data.map((c) => ({
            id: String(c.id || ""),
            full_name: String(c.full_name || "İsimsiz Müşteri"),
            phone: String(c.phone || ""),
            tckn: c.identity_number ? String(c.identity_number) : undefined,
            balance: Number(c.balance) || 0,
            address: c.address ? String(c.address) : undefined,
          }))
          setCustomers(mapped)
          if (!watchedCustomerId) {
            setValue("customerId", mapped[0].id)
          }
        }
      } catch (err) {
        console.warn("Müşteri listesi çekilirken yerel veriler kullanılıyor:", err)
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

  // Finansal Marj Analizi
  const financialSummary = useMemo(() => {
    const buy = Number(watchedPurchasePrice) || 0
    const sell = Number(watchedTargetSalePrice) || 0
    const profit = sell - buy
    const margin = sell > 0 ? Math.round((profit / sell) * 100) : 0
    return { buy, sell, profit, margin }
  }, [watchedPurchasePrice, watchedTargetSalePrice])

  // Şablon (Preset) Uygulama Handler'ı
  const handleApplyPreset = (preset: PurchasePreset) => {
    setActivePreset(preset.id)
    setValue("brand", preset.brand, { shouldValidate: true })
    setValue("model", preset.model, { shouldValidate: true })
    setValue("imei", generateLuhnIMEI(), { shouldValidate: true })
    setValue("batteryHealth", preset.batteryHealth, { shouldValidate: true })
    setValue("cosmeticCondition", preset.cosmeticCondition as PurchaseFormValues["cosmeticCondition"], { shouldValidate: true })
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
      toast.success("Müşteri Başarıyla Eklendi", {
        description: `${newCust.full_name} müşteri listesine kaydedildi.`
      })
      return true
    } catch {
      toast.error("Müşteri Eklenemedi", {
        description: "Lütfen müşteri bilgilerini kontrol ediniz."
      })
      return false
    }
  }

  // Form Gönderimi (Satın Alma İşlemi)
  const onSubmit = async (values: PurchaseFormValues) => {
    if (!selectedCustomer) {
      setSubmitError("Lütfen cihazı satın alacağınız müşteriyi seçiniz.")
      toast.error("Müşteri Seçilmedi", {
        description: "Lütfen cihazı satın alacağınız müşteriyi seçiniz."
      })
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await processSecondhandDevicePurchase(values, selectedCustomer)

      if (result.success) {
        toast.success("2. El Cihaz Alımı Tamamlandı", {
          description: `${values.brand} ${values.model} envantere kaydedildi. Sözleşme No: ${result.transactionNumber}`
        })
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
          storeName: "PhoneStore Pro",
          storeAddress: "Bağdat Cad. No:42/A Kadıköy / İstanbul",
          storePhone: "(0216) 555 12 34",
        }

        setContractData(contract)
        setIsContractModalOpen(true)
      } else {
        const parsed = parseAppError(result.error, "Satın Alma Başarısız")
        setSubmitError(parsed.userMessage)
        toast.error(parsed.title, { description: parsed.userMessage })
      }
    } catch (err: unknown) {
      console.error("Purchase error:", err)
      const parsed = parseAppError(err, "Alım İşlemi Hatası")
      setSubmitError(parsed.userMessage)
      toast.error(parsed.title, { 
        description: parsed.isNetwork
          ? "İnternet bağlantısı koptu. Sözleşme taslağınız yerel hafızada korundu, lütfen bağlantınızı kontrol edip tekrar deneyin."
          : parsed.userMessage 
      })
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
    <div className="space-y-6">
      {/* Üst Başlık & Eylemler */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span 
              onClick={() => router.push("/dashboard")} 
              className="hover:text-cyan-400 cursor-pointer transition-colors"
            >
              Yönetim Paneli
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span 
              onClick={() => router.push("/dashboard/inventory")} 
              className="hover:text-cyan-400 cursor-pointer transition-colors"
            >
              Envanter
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-cyan-400 font-bold">2. El Alımı</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Smartphone className="w-6 h-6 text-cyan-400" />
            İkinci El Cihaz Satın Alım & Ekspertiz
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Müşteriden ikinci el cihaz satın alıp envantere ekleyin, ekspertiz yapın ve kasa çıkışını kaydedin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/inventory")}
            className="flex items-center gap-1.5 border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 font-medium text-xs h-9"
          >
            <ArrowLeft className="w-4 h-4" />
            Envantere Dön
          </Button>
        </div>
      </div>

      {/* Hızlı Test Şablonları Çubuğu */}
      <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Hızlı Alım Şablonları:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {PURCHASE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                activePreset === preset.id
                  ? "bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20"
                  : "bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Hata Bildirimi */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 flex items-start gap-3 text-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
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
          <div className="bg-slate-900/70 p-5 sm:p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                    1. Satıcı (Müşteri) Bilgileri
                  </h2>
                  <p className="text-[11px] text-slate-400">Cihazı satan müşteriyi seçin veya sisteme yeni müşteri kaydedin.</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCustomerModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 border-cyan-800/80 bg-cyan-950/40 hover:bg-cyan-900/60 h-8"
              >
                <Plus className="w-3.5 h-3.5" />
                Yeni Müşteri Ekle
              </Button>
            </div>

            <div className="space-y-3">
              <Label htmlFor="customerId" className="text-xs font-semibold text-slate-300">
                Sistemde Kayıtlı Müşteri <span className="text-rose-400">*</span>
              </Label>
              <select
                id="customerId"
                {...register("customerId")}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                    {c.full_name} ({c.phone}) {c.tckn ? `- TCKN: ${c.tckn}` : ""}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="text-xs text-rose-400 font-medium">{errors.customerId.message}</p>
              )}

              {/* Seçili Müşteri Bilgi Rozeti */}
              {selectedCustomer && (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-white">{selectedCustomer.full_name}</span>
                    <span className="text-slate-400 ml-2 font-mono text-[11px]">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCustomer.tckn && (
                      <span className="px-2 py-0.5 bg-slate-800 rounded font-mono text-[11px] text-slate-300">
                        TCKN: {selectedCustomer.tckn}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      selectedCustomer.balance < 0 
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" 
                        : selectedCustomer.balance > 0 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      Bakiye: {formatCurrency(selectedCustomer.balance)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BÖLÜM 2: CİHAZ MARKA, MODEL & 15 HANELİ IMEI */}
          <div className="bg-slate-900/70 p-5 sm:p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                <Barcode className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  2. Cihaz Kimlik & Donanım Bilgileri
                </h2>
                <p className="text-[11px] text-slate-400">Cihazın modeli, 15 haneli benzersiz IMEI numarası ve fiziksel nitelikleri.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Marka */}
              <div className="space-y-1.5">
                <Label htmlFor="brand" className="text-xs font-semibold text-slate-300">
                  Marka <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="brand"
                  placeholder="Örn: Apple, Samsung, Xiaomi"
                  {...register("brand")}
                  className="h-10 text-sm bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500"
                />
                {errors.brand && <p className="text-xs text-rose-400">{errors.brand.message}</p>}
              </div>

              {/* Model */}
              <div className="space-y-1.5">
                <Label htmlFor="model" className="text-xs font-semibold text-slate-300">
                  Model Adı / Kod <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="model"
                  placeholder="Örn: iPhone 13 128GB (A2633)"
                  {...register("model")}
                  className="h-10 text-sm bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500"
                />
                {errors.model && <p className="text-xs text-rose-400">{errors.model.message}</p>}
              </div>

              {/* 15 Haneli IMEI Numarası */}
              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="imei" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    15 Haneli IMEI Numarası <span className="text-rose-400">*</span>
                    {watchedImei && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isImeiValid 
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {isImeiValid ? "✓ Luhn Geçerli" : `${watchedImei.length}/15 Hane`}
                      </span>
                    )}
                  </Label>
                  <button
                    type="button"
                    onClick={() => setValue("imei", generateLuhnIMEI(), { shouldValidate: true })}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
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
                    className={`h-11 font-mono tracking-widest text-sm font-bold bg-slate-950 border-slate-800 text-cyan-300 ${
                      isImeiValid ? "border-emerald-500/60 focus:border-emerald-400" : ""
                    }`}
                  />
                  <div className="absolute right-3 top-3 text-slate-500">
                    <Barcode className="w-5 h-5" />
                  </div>
                </div>
                {errors.imei && <p className="text-xs text-rose-400">{errors.imei.message}</p>}
                <p className="text-[11px] text-slate-500">
                  Cihazın arama ekranına *#06# tuşlanarak öğrenilen 15 haneli kimlik numarasıdır. Envanterde tekil izlenecektir.
                </p>
              </div>

              {/* Hafıza Kapasitesi */}
              <div className="space-y-1.5">
                <Label htmlFor="storage" className="text-xs font-semibold text-slate-300">
                  Depolama Alanı <span className="text-rose-400">*</span>
                </Label>
                <select
                  id="storage"
                  {...register("storage")}
                  className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="64 GB" className="bg-slate-900 text-slate-200">64 GB</option>
                  <option value="128 GB" className="bg-slate-900 text-slate-200">128 GB</option>
                  <option value="256 GB" className="bg-slate-900 text-slate-200">256 GB</option>
                  <option value="512 GB" className="bg-slate-900 text-slate-200">512 GB</option>
                  <option value="1 TB" className="bg-slate-900 text-slate-200">1 TB</option>
                </select>
                {errors.storage && <p className="text-xs text-rose-400">{errors.storage.message}</p>}
              </div>

              {/* Renk */}
              <div className="space-y-1.5">
                <Label htmlFor="color" className="text-xs font-semibold text-slate-300">
                  Kasa Rengi <span className="text-rose-400">*</span>
                </Label>
                <Input
                  id="color"
                  placeholder="Örn: Gece Yarısı, Grafit, Mavi"
                  {...register("color")}
                  className="h-10 text-sm bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500"
                />
                {errors.color && <p className="text-xs text-rose-400">{errors.color.message}</p>}
              </div>
            </div>
          </div>

          {/* BÖLÜM 3: KOZMETİK VE EKSPERTİZ DURUMU */}
          <div className="bg-slate-900/70 p-5 sm:p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-950/70 border border-amber-800/50 flex items-center justify-center text-amber-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  3. Donanım & Kozmetik Ekspertiz
                </h2>
                <p className="text-[11px] text-slate-400">Batarya sağlığı, kozmetik sınıflandırma ve kutu/fatura varlığı.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Batarya Sağlığı */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="batteryHealth" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-slate-400" />
                    Batarya Sağlığı (%) <span className="text-rose-400">*</span>
                  </Label>
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                    watchedBatteryHealth >= 85 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                      : watchedBatteryHealth >= 75 
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
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
                        className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                      />
                    </div>
                  )}
                />
                {errors.batteryHealth && <p className="text-xs text-rose-400">{errors.batteryHealth.message}</p>}
              </div>

              {/* Kozmetik Durum */}
              <div className="space-y-1.5">
                <Label htmlFor="cosmeticCondition" className="text-xs font-semibold text-slate-300">
                  Kozmetik Durum Derecesi <span className="text-rose-400">*</span>
                </Label>
                <select
                  id="cosmeticCondition"
                  {...register("cosmeticCondition")}
                  className="w-full h-10 px-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="A+ (Kusursuz / Sıfır Ayarında)" className="bg-slate-900 text-slate-200">A+ (Kusursuz / Sıfır Ayarında)</option>
                  <option value="A (Çok Temiz / Mikro Kılcal)" className="bg-slate-900 text-slate-200">A (Çok Temiz / Mikro Kılcal)</option>
                  <option value="B (Hafif Kılcal Çizikler)" className="bg-slate-900 text-slate-200">B (Hafif Kılcal Çizikler)</option>
                  <option value="C (Darbeli / Kasada Ezik Var)" className="bg-slate-900 text-slate-200">C (Darbeli / Kasada Ezik Var)</option>
                </select>
                {errors.cosmeticCondition && <p className="text-xs text-rose-400">{errors.cosmeticCondition.message}</p>}
              </div>

              {/* Aksesuar Checkboxları */}
              <div className="sm:col-span-2 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Teslim Alınan Kutu & Aksesuarlar
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      {...register("hasBox")}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950"
                    />
                    <span>📦 Orijinal Kutu</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      {...register("hasInvoice")}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950"
                    />
                    <span>🧾 Orijinal Fatura</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      {...register("hasOriginalCharger")}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-950"
                    />
                    <span>🔌 Orijinal Şarj Cihazı</span>
                  </label>
                </div>
              </div>

              {/* Raf / Vitrin Konumu */}
              <div className="space-y-1.5">
                <Label htmlFor="shelfLocation" className="text-xs font-semibold text-slate-300">
                  Depo / Vitrin Konumu
                </Label>
                <Input
                  id="shelfLocation"
                  placeholder="Örn: İkinci El Vitrin A-1"
                  {...register("shelfLocation")}
                  className="h-10 text-sm bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-cyan-500"
                />
              </div>

              {/* Teknik / Ekspertiz Notları */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="technicalNotes" className="text-xs font-semibold text-slate-300">
                  Ekspertiz ve Teknik Notlar
                </Label>
                <textarea
                  id="technicalNotes"
                  rows={2}
                  placeholder="Örn: TrueTone ve FaceID aktif. Ekran değişmemiş, sağ köşede kılcal çizik mevcut."
                  {...register("technicalNotes")}
                  className="w-full p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 text-sm font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* BÖLÜM 4: ALIŞ VE HEDEF SATIŞ FİYATI & KASA ÇIKIŞI */}
          <div className="bg-slate-900/70 p-5 sm:p-6 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  4. Maliyet & Kasa Çıkış Ayarları
                </h2>
                <p className="text-[11px] text-slate-400">Müşteriye ödenecek tutar (kasa çıkışı) ve satış hedef fiyatı.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Alış Fiyatı (Kasadan Çıkacak Tutar) */}
              <div className="space-y-1.5">
                <Label htmlFor="purchasePrice" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  Alış Fiyatı (₺) <span className="text-rose-400">*</span>
                  <span className="text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded font-semibold">
                    Kasadan Çıkacak
                  </span>
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="10"
                  placeholder="21500"
                  {...register("purchasePrice", { valueAsNumber: true })}
                  className="h-11 font-mono font-bold text-base text-rose-400 bg-slate-950 border-slate-800 focus:border-rose-400"
                />
                {errors.purchasePrice && <p className="text-xs text-rose-400">{errors.purchasePrice.message}</p>}
              </div>

              {/* Hedef Satış Fiyatı */}
              <div className="space-y-1.5">
                <Label htmlFor="targetSalePrice" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  Hedef Satış Fiyatı (₺) <span className="text-rose-400">*</span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-semibold">
                    Etiket Fiyatı
                  </span>
                </Label>
                <Input
                  id="targetSalePrice"
                  type="number"
                  step="10"
                  placeholder="28500"
                  {...register("targetSalePrice", { valueAsNumber: true })}
                  className="h-11 font-mono font-bold text-base text-emerald-400 bg-slate-950 border-slate-800 focus:border-emerald-400"
                />
                {errors.targetSalePrice && <p className="text-xs text-rose-400">{errors.targetSalePrice.message}</p>}
              </div>

              {/* Ödeme Yöntemi */}
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-xs font-semibold text-slate-300 block">
                  Ödeme Türü (Paranın Çıkış Kanalı) <span className="text-rose-400">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    watchedPaymentMethod === "cash" 
                      ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-200 font-bold shadow-sm" 
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                  }`}>
                    <input
                      type="radio"
                      value="cash"
                      {...register("paymentMethod")}
                      className="sr-only"
                    />
                    <Wallet className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs text-white">Nakit Ödeme</div>
                      <div className="text-[10px] font-normal text-slate-400">Ana Kasa Nakit Çıkışı</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    watchedPaymentMethod === "bank_transfer" 
                      ? "border-cyan-500/60 bg-cyan-950/40 text-cyan-200 font-bold shadow-sm" 
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                  }`}>
                    <input
                      type="radio"
                      value="bank_transfer"
                      {...register("paymentMethod")}
                      className="sr-only"
                    />
                    <Building className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <div className="text-xs text-white">Havale / EFT</div>
                      <div className="text-[10px] font-normal text-slate-400">Banka Hesabı Çıkışı</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    watchedPaymentMethod === "on_account" 
                      ? "border-amber-500/60 bg-amber-950/40 text-amber-200 font-bold shadow-sm" 
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                  }`}>
                    <input
                      type="radio"
                      value="on_account"
                      {...register("paymentMethod")}
                      className="sr-only"
                    />
                    <CreditCard className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs text-white">Cari Mahsup</div>
                      <div className="text-[10px] font-normal text-slate-400">Müşteri Cari Alacağı</div>
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
          <div className="bg-slate-900/70 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 text-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-cyan-400 uppercase">
                  Cihaz Önizleme
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/30">
                  İkinci El
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {watchedBrand || "Marka"} {watchedModel || "Model"}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {watchedStorage} • {watchedColor || "Belirtilmedi"}
              </p>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">IMEI:</span>
                <span className="font-mono font-bold text-slate-200">
                  {watchedImei || "Henüz girilmedi"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Batarya Sağlığı:</span>
                <span className="font-bold text-white">%{watchedBatteryHealth}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Kozmetik:</span>
                <span className="font-semibold text-slate-300 text-[11px]">{watchedCosmetic}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Aksesuarlar:</span>
                <div className="flex items-center gap-1.5 font-bold text-[10px]">
                  {watchedHasBox && <span className="text-emerald-300 bg-emerald-500/20 px-1 rounded border border-emerald-500/30">Kutu</span>}
                  {watchedHasInvoice && <span className="text-emerald-300 bg-emerald-500/20 px-1 rounded border border-emerald-500/30">Fatura</span>}
                  {watchedHasCharger && <span className="text-emerald-300 bg-emerald-500/20 px-1 rounded border border-emerald-500/30">Şarj</span>}
                  {!watchedHasBox && !watchedHasInvoice && !watchedHasCharger && <span className="text-slate-500">Yalnız Cihaz</span>}
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Satıcı Müşteri:</span>
                <span className="font-bold text-cyan-300">{selectedCustomer?.full_name || "-"}</span>
              </div>
            </div>
          </div>

          {/* Kâr ve Kasa Analiz Kartı */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Mali Özet & Kâr Tahmini
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Alış Bedeli (Gider):</span>
                <span className="font-mono font-bold text-rose-400">
                  - {formatCurrency(financialSummary.buy)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Hedef Satış:</span>
                <span className="font-mono font-semibold text-slate-100">
                  {formatCurrency(financialSummary.sell)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-slate-200 font-bold">Tahmini Brüt Kâr:</span>
                <span className={`font-mono font-black text-sm ${
                  financialSummary.profit >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {financialSummary.profit >= 0 ? "+" : ""}{formatCurrency(financialSummary.profit)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>Brüt Kâr Marjı:</span>
                <span className="font-bold text-slate-200">%{financialSummary.margin}</span>
              </div>
            </div>

            {/* Kasa Para Çıkış Notu */}
            <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-800/50 text-[11px] text-amber-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Kasa Entegrasyonu:</strong> İşlem onaylandığında kasadan{" "}
                <span className="font-bold underline text-amber-300">{formatCurrency(financialSummary.buy)}</span> tutarında 
                para çıkış fişi kesilecek ve cihaz 1 adet stokla envantere eklenecektir.
              </div>
            </div>

            {/* Satın Alma Butonu */}
            <Button
              type="submit"
              disabled={isSubmitting || !isImeiValid || financialSummary.buy <= 0}
              className="w-full h-12 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
