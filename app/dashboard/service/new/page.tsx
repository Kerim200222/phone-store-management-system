"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  Wrench, 
  User, 
  Smartphone, 
  KeyRound, 
  AlertTriangle, 
  ShieldCheck, 
  Plus, 
  ArrowLeft, 
  Sparkles, 
  Check, 
  Barcode, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  DollarSign, 
  AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  serviceTicketFormSchema, 
  ServiceTicketFormValues, 
  ISSUE_CATEGORIES, 
  SERVICE_PRESETS, 
  ServicePreset,
  ServiceTicketReceiptData
} from "@/types/service"
import { POSCustomerSelect } from "@/types/pos"
import { INITIAL_CUSTOMERS, CustomerFormValues } from "@/types/customer"
import { generateLuhnIMEI } from "@/types/inventory"
import { createClient } from "@/utils/supabase/client"
import { createServiceTicket } from "@/lib/service-ticket-service"
import { ServiceTicketModal } from "@/components/service/service-ticket-modal"
import { CustomerModal } from "@/components/customers/customer-modal"

interface CustomerDbClient {
  from(table: string): {
    select(query?: string): {
      order(column: string, options?: { ascending?: boolean }): Promise<{
        data: Record<string, unknown>[] | null
        error: { message: string } | null
      }>
    }
  }
}

export default function NewServiceTicketPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<POSCustomerSelect[]>(INITIAL_CUSTOMERS)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [receiptData, setReceiptData] = useState<ServiceTicketReceiptData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [showPasswordText, setShowPasswordText] = useState(true)

  // React Hook Form Kurulumu
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ServiceTicketFormValues>({
    resolver: zodResolver(serviceTicketFormSchema),
    defaultValues: {
      customerId: INITIAL_CUSTOMERS[0]?.id || "",
      deviceBrand: "Apple",
      deviceModel: "iPhone 13 (A2633)",
      imei: generateLuhnIMEI(),
      serialNumber: "",
      hasPassword: true,
      passwordType: "pin",
      devicePassword: "1907",
      patternNotes: "",
      issueCategory: "Ekran & Dokunmatik",
      issueDescription: "Cihaz yere düştü, ekran çatlak ve alt kısımda dokunmatik basmıyor.",
      physicalCondition: "Ön camda derin çatlaklar mevcut. Sağ üst köşe kasada hafif ezik var. Arka kapak sağlam.",
      condScreenCracked: true,
      condScreenScratched: false,
      condBackGlassCracked: false,
      condCaseDented: true,
      condLiquidDamage: false,
      condCameraGlassCracked: false,
      condScrewsMissing: false,
      accSimCard: false,
      accMemoryCard: false,
      accProtectiveCase: true,
      accOriginalBox: false,
      accCharger: false,
      accOther: "",
      estimatedCost: 3200,
      priority: "high",
      technicianNotes: "Orijinal OLED ekran değişimi yapılacak. Test sonrası müşteri aranacak.",
      assignedTechnician: "Kerim Aydın (Kıdemli Teknisyen)",
      backupConsent: true,
    }
  })

  // Canlı İzlenen Alanlar
  const watchedCustomerId = watch("customerId")
  const watchedBrand = watch("deviceBrand")
  const watchedModel = watch("deviceModel")
  const watchedImei = watch("imei")
  const watchedPasswordType = watch("passwordType")
  const watchedPassword = watch("devicePassword")
  const watchedIssueCat = watch("issueCategory")
  const watchedIssueDesc = watch("issueDescription")
  const watchedEstimatedCost = watch("estimatedCost") || 0
  const watchedPriority = watch("priority")
  const watchedScreenCracked = watch("condScreenCracked")
  const watchedBackGlassCracked = watch("condBackGlassCracked")
  const watchedCaseDented = watch("condCaseDented")
  const watchedLiquid = watch("condLiquidDamage")

  // Seçili Müşteri
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === watchedCustomerId) || customers[0] || null
  }, [customers, watchedCustomerId])

  // Müşterileri Supabase'den Çekme
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
        console.warn("Müşteriler çekilirken yerel mock veriler kullanılıyor:", err)
      }
    }
    loadCustomers()
  }, [setValue, watchedCustomerId])

  // Luhn IMEI Doğrulama
  const isImeiValid = useMemo(() => {
    if (!watchedImei || watchedImei.trim() === "") return true
    if (watchedImei.length !== 15 || !/^\d{15}$/.test(watchedImei)) return false
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

  // Şablon Doldurma
  const handleApplyPreset = (preset: ServicePreset) => {
    setActivePreset(preset.id)
    setValue("deviceBrand", preset.brand, { shouldValidate: true })
    setValue("deviceModel", preset.model, { shouldValidate: true })
    setValue("issueCategory", preset.issueCategory, { shouldValidate: true })
    setValue("issueDescription", preset.issueDescription, { shouldValidate: true })
    setValue("passwordType", preset.passwordType, { shouldValidate: true })
    setValue("devicePassword", preset.devicePassword, { shouldValidate: true })
    setValue("physicalCondition", preset.physicalCondition, { shouldValidate: true })
    setValue("estimatedCost", preset.estimatedCost, { shouldValidate: true })
    setValue("priority", preset.priority, { shouldValidate: true })
    setValue("condScreenCracked", Boolean(preset.condScreenCracked))
    setValue("condBackGlassCracked", Boolean(preset.condBackGlassCracked))
    setValue("condCaseDented", Boolean(preset.condCaseDented))
    setValue("condLiquidDamage", Boolean(preset.condLiquidDamage))
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

  // Form Gönderimi (Teknik Servis Kaydı Açma)
  const onSubmit = async (values: ServiceTicketFormValues) => {
    if (!selectedCustomer) {
      setSubmitError("Lütfen cihazı teslim eden müşteriyi seçiniz.")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await createServiceTicket(values, selectedCustomer)

      if (result.success) {
        // Teslim Alınan Aksesuar Listesi
        const accessories: string[] = []
        if (values.accProtectiveCase) accessories.push("Kılıf")
        if (values.accSimCard) accessories.push("SIM Kart")
        if (values.accMemoryCard) accessories.push("Hafıza Kartı")
        if (values.accOriginalBox) accessories.push("Orijinal Kutu")
        if (values.accCharger) accessories.push("Şarj Adaptörü")
        if (values.accOther) accessories.push(values.accOther)

        // Kozmetik Kusurlar
        const defects: string[] = []
        if (values.condScreenCracked) defects.push("Ekran Kırık")
        if (values.condScreenScratched) defects.push("Derin Çizikler")
        if (values.condBackGlassCracked) defects.push("Arka Cam Çatlak")
        if (values.condCaseDented) defects.push("Kasa Darbeli")
        if (values.condLiquidDamage) defects.push("Sıvı Teması İzi")
        if (values.condCameraGlassCracked) defects.push("Kamera Camı Kırık")

        // Servis Fişi / Kabul Belgesi Verisi
        const receipt: ServiceTicketReceiptData = {
          ticketNumber: result.ticketNumber,
          date: new Date().toISOString(),
          customer: selectedCustomer,
          device: {
            brand: values.deviceBrand,
            model: values.deviceModel,
            imei: values.imei || null,
            serialNumber: values.serialNumber || null,
            passwordType: values.passwordType,
            devicePassword: values.passwordType !== "none" ? values.devicePassword : "Kilit Yok",
            patternNotes: values.patternNotes || null,
            physicalCondition: values.physicalCondition,
            cosmeticDefects: defects,
            accessories,
          },
          service: {
            category: values.issueCategory,
            issueDescription: values.issueDescription,
            technicianNotes: values.technicianNotes || null,
            estimatedCost: values.estimatedCost,
            priority: values.priority,
            assignedTechnician: values.assignedTechnician || null,
          },
          store: {
            name: "TELEFON MAĞAZASI A.Ş.",
            branch: "Kadıköy Merkez Şubesi",
            address: "Bağdat Cad. No:42/A Kadıköy / İstanbul",
            phone: "(0216) 555 12 34",
            taxNumber: "1948201938",
          },
        }

        setReceiptData(receipt)
        setIsReceiptModalOpen(true)
      } else {
        setSubmitError(result.error || "Kayıt açılırken bir hata meydana geldi.")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu."
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetForNew = () => {
    reset({
      customerId: customers[0]?.id || "",
      deviceBrand: "Samsung",
      deviceModel: "Galaxy S22 Ultra",
      imei: generateLuhnIMEI(),
      serialNumber: "",
      hasPassword: true,
      passwordType: "pin",
      devicePassword: "1234",
      patternNotes: "",
      issueCategory: "Batarya & Güç",
      issueDescription: "Cihaz şarj tutmuyor, ısınma problemi var.",
      physicalCondition: "Genel durumu temiz, ekranda koruyucu cam mevcut.",
      condScreenCracked: false,
      condScreenScratched: false,
      condBackGlassCracked: false,
      condCaseDented: false,
      condLiquidDamage: false,
      condCameraGlassCracked: false,
      condScrewsMissing: false,
      accSimCard: false,
      accMemoryCard: false,
      accProtectiveCase: true,
      accOriginalBox: false,
      accCharger: false,
      accOther: "",
      estimatedCost: 1950,
      priority: "normal",
      technicianNotes: "Batarya sağlığı %72 olarak ölçüldü. Orijinal batarya montajı planlandı.",
      assignedTechnician: "Kerim Aydın (Kıdemli Teknisyen)",
      backupConsent: true,
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
    <div className="min-h-screen bg-slate-900/40 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Üst Başlık & Eylemler */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <span 
              onClick={() => router.push("/dashboard")} 
              className="hover:text-cyan-400 cursor-pointer"
            >
              Yönetim Paneli
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span 
              onClick={() => router.push("/dashboard/repairs")} 
              className="hover:text-cyan-400 cursor-pointer"
            >
              Teknik Servis
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-bold">Yeni Servis Kaydı</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="w-7 h-7 text-cyan-400" />
            Yeni Servis Kaydı Açma
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Müşteriden tamir edilecek cihazı teslim alın, arıza şikayetini ve dış görünüm kusurlarını kaydedin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/repairs")}
            className="flex items-center gap-1.5 border-slate-700 font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Servis Listesine Dön
          </Button>
        </div>
      </div>

      {/* Hızlı Servis Ön Tanımları (Tek Tıkla Şablon Doldurma) */}
      <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Hızlı Arıza Şablonları (Tek Tıkla Doldur):</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {SERVICE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                activePreset === preset.id
                  ? "bg-cyan-600 text-white border-cyan-500 shadow-sm"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Hata Bildirimi */}
      {submitError && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-800 flex items-start gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">Kayıt Hatası: </span>
            {submitError}
          </div>
        </div>
      )}

      {/* Ana Form Izgarası: Sol 4 Adımlı Form, Sağ Canlı Önizleme */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* SOL FORM ALANI (lg:col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* BÖLÜM 1: MÜŞTERİ SEÇİMİ */}
          <div className="bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800/40">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                    1. Cihaz Sahibi (Müşteri) Seçimi
                  </h2>
                  <p className="text-xs text-slate-400">Cihazı servise getiren müşteriyi seçin veya anında sisteme kaydedin.</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCustomerModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 border-cyan-800/60 bg-cyan-950/30 hover:bg-cyan-900/50 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
                Yeni Müşteri Ekle
              </Button>
            </div>

            <div className="space-y-3">
              <Label htmlFor="customerId" className="text-xs font-bold text-slate-300">
                Sistemde Kayıtlı Müşteri <span className="text-red-400">*</span>
              </Label>
              <select
                id="customerId"
                {...register("customerId")}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.phone}) {c.tckn ? `- TCKN: ${c.tckn}` : ""}
                  </option>
                ))}
              </select>
              {errors.customerId && (
                <p className="text-xs text-red-400 font-medium">{errors.customerId.message}</p>
              )}

              {/* Seçili Müşteri Rozeti */}
              {selectedCustomer && (
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-white">{selectedCustomer.full_name}</span>
                    <span className="text-slate-400 ml-2 font-mono">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCustomer.tckn && (
                      <span className="px-2 py-0.5 bg-slate-800 rounded font-mono text-[11px] text-slate-300">
                        TCKN: {selectedCustomer.tckn}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      selectedCustomer.balance < 0 
                        ? "bg-red-950 text-red-300 border border-red-800" 
                        : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    }`}>
                      Bakiye: {formatCurrency(selectedCustomer.balance)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BÖLÜM 2: CİHAZ MARKA, MODEL & CİHAZ ŞİFRESİ */}
          <div className="bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800/40">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  2. Cihaz Modeli & Güvenlik Kilidi
                </h2>
                <p className="text-xs text-slate-400">Teknisyenin test edebilmesi için cihaz şifresi veya desen kilidi gereklidir.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Marka */}
              <div className="space-y-1.5">
                <Label htmlFor="deviceBrand" className="text-xs font-bold text-slate-300">
                  Cihaz Markası <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="deviceBrand"
                  placeholder="Örn: Apple, Samsung, Xiaomi"
                  {...register("deviceBrand")}
                  className="h-10 text-sm bg-slate-950 border-slate-700 text-white"
                />
                {errors.deviceBrand && <p className="text-xs text-red-400">{errors.deviceBrand.message}</p>}
              </div>

              {/* Model */}
              <div className="space-y-1.5">
                <Label htmlFor="deviceModel" className="text-xs font-bold text-slate-300">
                  Cihaz Modeli <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="deviceModel"
                  placeholder="Örn: iPhone 13 Pro (A2638)"
                  {...register("deviceModel")}
                  className="h-10 text-sm bg-slate-950 border-slate-700 text-white"
                />
                {errors.deviceModel && <p className="text-xs text-red-400">{errors.deviceModel.message}</p>}
              </div>

              {/* 15 Haneli IMEI */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="imei" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    15 Haneli IMEI
                    {watchedImei && watchedImei.length > 0 && (
                      <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                        isImeiValid 
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800" 
                          : "bg-red-950 text-red-300 border border-red-800"
                      }`}>
                        {isImeiValid ? "✓ Geçerli" : `${watchedImei.length}/15 Hane`}
                      </span>
                    )}
                  </Label>
                  <button
                    type="button"
                    onClick={() => setValue("imei", generateLuhnIMEI(), { shouldValidate: true })}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    IMEI Üret
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="imei"
                    maxLength={15}
                    placeholder="358921098412345 (Opsiyonel)"
                    {...register("imei")}
                    className="h-10 font-mono tracking-wider text-sm bg-slate-950 border-slate-700 text-white"
                  />
                  <div className="absolute right-3 top-2.5 text-slate-500">
                    <Barcode className="w-5 h-5" />
                  </div>
                </div>
                {errors.imei && <p className="text-xs text-red-400">{errors.imei.message}</p>}
              </div>

              {/* Seri No */}
              <div className="space-y-1.5">
                <Label htmlFor="serialNumber" className="text-xs font-bold text-slate-300">
                  Seri Numarası (S/N)
                </Label>
                <Input
                  id="serialNumber"
                  placeholder="Örn: F2LND849H8G"
                  {...register("serialNumber")}
                  className="h-10 text-sm bg-slate-950 border-slate-700 text-white font-mono"
                />
              </div>

              {/* CİHAZ ŞİFRESİ BÖLÜMÜ */}
              <div className="sm:col-span-2 p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    Cihaz Şifresi & Ekran Kilidi Bilgisi <span className="text-red-400">*</span>
                  </span>
                  <div className="flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showPasswordText ? "Gizle" : "Göster"}
                    </button>
                  </div>
                </div>

                {/* Şifre Türü Seçici */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: "pin", label: "🔢 Sayısal PIN" },
                    { id: "text", label: "🔤 Alfanümerik Şifre" },
                    { id: "pattern", label: "📐 Desen Kilidi" },
                    { id: "none", label: "🔓 Şifresiz / Açık" },
                  ].map((pt) => (
                    <label
                      key={pt.id}
                      className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                        watchedPasswordType === pt.id
                          ? "bg-amber-950/50 border-amber-600 text-amber-200 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      <input
                        type="radio"
                        value={pt.id}
                        {...register("passwordType")}
                        className="sr-only"
                      />
                      {pt.label}
                    </label>
                  ))}
                </div>

                {/* Şifre Giriş Alanı */}
                {watchedPasswordType !== "none" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <Label htmlFor="devicePassword" className="text-[11px] text-slate-400">
                        {watchedPasswordType === "pattern" ? "Desen Çizim Özeti / Kodu" : "Cihaz Şifresi / PIN"}
                      </Label>
                      <Input
                        id="devicePassword"
                        type={showPasswordText ? "text" : "password"}
                        placeholder={watchedPasswordType === "pattern" ? "Örn: L Çizimi (1-4-7-8-9)" : "Örn: 1907 veya parola"}
                        {...register("devicePassword")}
                        className="h-10 font-mono font-bold bg-slate-900 border-slate-700 text-amber-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="patternNotes" className="text-[11px] text-slate-400">
                        Ek Güvenlik Notu (SIM PIN / FaceID durumu)
                      </Label>
                      <Input
                        id="patternNotes"
                        placeholder="Örn: SIM PIN: 0000, Parmak izi aktif"
                        {...register("patternNotes")}
                        className="h-10 text-xs bg-slate-900 border-slate-700 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BÖLÜM 3: ŞİKAYET & DIŞ GÖRÜNÜM NOTLARI */}
          <div className="bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center border border-amber-800/40">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  3. Arıza Şikayeti & Dış Görünüm Notları
                </h2>
                <p className="text-xs text-slate-400">Müşterinin şikayeti ve teslim esnasında tespit edilen çizik, darbe, kırıklar.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Arıza Kategorisi */}
              <div className="space-y-1.5">
                <Label htmlFor="issueCategory" className="text-xs font-bold text-slate-300">
                  Arıza Kategorisi <span className="text-red-400">*</span>
                </Label>
                <select
                  id="issueCategory"
                  {...register("issueCategory")}
                  className="w-full h-10 px-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm font-medium focus:ring-2 focus:ring-cyan-500"
                >
                  {ISSUE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Müşteri Şikayeti Açıklaması */}
              <div className="space-y-1.5">
                <Label htmlFor="issueDescription" className="text-xs font-bold text-slate-300">
                  Müşteri Arıza Beyanı & Şikayeti <span className="text-red-400">*</span>
                </Label>
                <textarea
                  id="issueDescription"
                  rows={3}
                  placeholder="Müşterinin belirttiği arızayı detaylı yazınız (Örn: Cihaz yere düştü, ekran çatlak ve sağ altta dokunmatik çalışmıyor. Bazen şarjı aniden kesiliyor.)"
                  {...register("issueDescription")}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                {errors.issueDescription && (
                  <p className="text-xs text-red-400">{errors.issueDescription.message}</p>
                )}
              </div>

              {/* DIŞ GÖRÜNÜM HIZLI KONTROL KUTULARI */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-white block">
                  Dış Görünüm / Kozmetik Kusur Tespiti (Çizik, Kırık, Darbe):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer text-slate-300 hover:bg-slate-800">
                    <input
                      type="checkbox"
                      {...register("condScreenCracked")}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <span>💥 Ekran / Ön Cam Kırık</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer text-slate-300 hover:bg-slate-800">
                    <input
                      type="checkbox"
                      {...register("condScreenScratched")}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>〰️ Derin Ekran Çizikleri</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer text-slate-300 hover:bg-slate-800">
                    <input
                      type="checkbox"
                      {...register("condBackGlassCracked")}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <span>💔 Arka Cam / Kapak Çatlak</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer text-slate-300 hover:bg-slate-800">
                    <input
                      type="checkbox"
                      {...register("condCaseDented")}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>🔨 Kasa Köşelerinde Ezik/Darbe</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer text-slate-300 hover:bg-slate-800">
                    <input
                      type="checkbox"
                      {...register("condLiquidDamage")}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>🌊 Sıvı Teması İzi / Şüphesi</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer text-slate-300 hover:bg-slate-800">
                    <input
                      type="checkbox"
                      {...register("condCameraGlassCracked")}
                      className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    />
                    <span>📷 Kamera Camı Çizik/Kırık</span>
                  </label>
                </div>
              </div>

              {/* Detaylı Dış Görünüm Notları */}
              <div className="space-y-1.5">
                <Label htmlFor="physicalCondition" className="text-xs font-bold text-slate-300">
                  Dış Görünüm & Ekspertiz Açıklaması <span className="text-red-400">*</span>
                </Label>
                <textarea
                  id="physicalCondition"
                  rows={2}
                  placeholder="Cihazın teslim anındaki çizik, kırık, kasa açıklığı gibi fiziksel durumunu detaylı belirtiniz."
                  {...register("physicalCondition")}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                {errors.physicalCondition && (
                  <p className="text-xs text-red-400">{errors.physicalCondition.message}</p>
                )}
              </div>

              {/* Birlikte Alınan Aksesuarlar */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">
                  Teslim Alınan Aksesuarlar:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input type="checkbox" {...register("accProtectiveCase")} className="w-3.5 h-3.5 rounded text-cyan-600" />
                    <span>Kılıf</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input type="checkbox" {...register("accSimCard")} className="w-3.5 h-3.5 rounded text-cyan-600" />
                    <span>SIM Kart</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input type="checkbox" {...register("accMemoryCard")} className="w-3.5 h-3.5 rounded text-cyan-600" />
                    <span>Hafıza Kartı</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input type="checkbox" {...register("accOriginalBox")} className="w-3.5 h-3.5 rounded text-cyan-600" />
                    <span>Orijinal Kutu</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input type="checkbox" {...register("accCharger")} className="w-3.5 h-3.5 rounded text-cyan-600" />
                    <span>Şarj Adaptörü</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* BÖLÜM 4: SERVİS PARAMETRELERİ & MALİYET */}
          <div className="bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800/40">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  4. Maliyet, Öncelik & Müşteri Onayı
                </h2>
                <p className="text-xs text-slate-400">Ön fiyat teklifi, servis aciliyeti ve yasal veri beyannamesi.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tahmini Maliyet */}
              <div className="space-y-1.5">
                <Label htmlFor="estimatedCost" className="text-xs font-bold text-slate-300">
                  Tahmini Onarım Bedeli (TL) <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  step="50"
                  placeholder="3200"
                  {...register("estimatedCost", { valueAsNumber: true })}
                  className="h-11 font-mono font-bold text-base bg-slate-950 border-slate-700 text-emerald-400"
                />
                {errors.estimatedCost && <p className="text-xs text-red-400">{errors.estimatedCost.message}</p>}
              </div>

              {/* Öncelik Seviyesi */}
              <div className="space-y-1.5">
                <Label htmlFor="priority" className="text-xs font-bold text-slate-300">
                  Servis Önceliği
                </Label>
                <select
                  id="priority"
                  {...register("priority")}
                  className="w-full h-11 px-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm font-medium focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="normal">Normal (Standart Sıra: 24-48 Saat)</option>
                  <option value="high">Yüksek Öncelik (Aynı Gün Teslim)</option>
                  <option value="critical">Kritik / Acil (Ekspres 2 Saat)</option>
                </select>
              </div>

              {/* Atanan Teknisyen */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="assignedTechnician" className="text-xs font-bold text-slate-300">
                  Atanan Teknisyen
                </Label>
                <Input
                  id="assignedTechnician"
                  placeholder="Örn: Kerim Aydın (Kıdemli Teknisyen)"
                  {...register("assignedTechnician")}
                  className="h-10 text-sm bg-slate-950 border-slate-700 text-white"
                />
              </div>

              {/* Teknisyen Teşhis Notları */}
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="technicianNotes" className="text-xs font-bold text-slate-300">
                  Teknisyen Giriş / Ön İnceleme Notu
                </Label>
                <textarea
                  id="technicianNotes"
                  rows={2}
                  placeholder="Örn: Ekran orijinal panel ile değiştirilecek, FaceID flex kablosu kontrol edilecek."
                  {...register("technicianNotes")}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-xs font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              {/* Veri Kaybı ve Müşteri Sorumluluk Beyanı */}
              <div className="sm:col-span-2 p-3 bg-amber-950/30 rounded-xl border border-amber-800/60 space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("backupConsent")}
                    className="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <div className="text-xs text-amber-200 leading-relaxed">
                    <span className="font-bold">Müşteri Beyanı ve Veri Sorumluluk Onayı: </span>
                    Cihazdaki verilerin yedeklendiğini, onarım esnasında oluşabilecek olası veri kayıplarından 
                    servisin sorumlu tutulamayacağını ve arıza tespit şartlarını kabul ediyorum.
                  </div>
                </label>
                {errors.backupConsent && (
                  <p className="text-xs text-red-400 font-bold pl-6">{errors.backupConsent.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ SÜTUN: CANLI CİHAZ KABUL KARTI & ONAYLA (lg:col-span-1) */}
        <div className="space-y-6">
          
          {/* Canlı Cihaz Kabul Kartı */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-cyan-100 uppercase">
                  Cihaz Kabul Kartı
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px]">
                  {watchedPriority === "critical" ? "ACİL" : watchedPriority === "high" ? "YÜKSEK" : "NORMAL"}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-1">
                {watchedBrand || "Marka"} {watchedModel || "Model"}
              </h3>
              <p className="text-xs text-cyan-100 font-mono">
                {watchedIssueCat}
              </p>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Müşteri:</span>
                <span className="font-bold text-white truncate max-w-[170px]">
                  {selectedCustomer?.full_name || "-"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">IMEI:</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {watchedImei ? `${watchedImei.slice(0, 8)}...` : "Belirtilmedi"}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Cihaz Şifresi:</span>
                <span className="font-mono font-bold text-amber-400">
                  {watchedPasswordType === "none" ? "Şifresiz" : watchedPassword || "Girilmedi"}
                </span>
              </div>

              {/* Kusur Tespiti Rozetleri */}
              <div className="py-1 border-b border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] block">Tespit Edilen Kusurlar:</span>
                <div className="flex flex-wrap gap-1">
                  {watchedScreenCracked && <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 text-[10px] border border-red-800">Ekran Kırık</span>}
                  {watchedBackGlassCracked && <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 text-[10px] border border-red-800">Arka Cam Çatlak</span>}
                  {watchedCaseDented && <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] border border-amber-800">Kasa Ezik</span>}
                  {watchedLiquid && <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 text-[10px] border border-blue-800">Sıvı Teması</span>}
                  {!watchedScreenCracked && !watchedBackGlassCracked && !watchedCaseDented && !watchedLiquid && (
                    <span className="text-slate-500 text-[10px]">Belirgin kırık/darbe yok</span>
                  )}
                </div>
              </div>

              {/* Şikayet Özeti */}
              <div className="py-1 border-b border-slate-800">
                <span className="text-slate-400 text-[11px] block">Şikayet Özeti:</span>
                <p className="text-slate-300 text-[11px] mt-0.5 line-clamp-2">
                  {watchedIssueDesc || "Arıza beyanı henüz girilmedi."}
                </p>
              </div>

              {/* Tahmini Tutar */}
              <div className="pt-2 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-300">Tahmini Fiyat:</span>
                <span className="font-mono text-emerald-400 font-black text-base">
                  {formatCurrency(watchedEstimatedCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Servis Kabul ve Kaydet Butonu */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-sm space-y-3">
            <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-800/40 text-[11px] text-cyan-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong>Servis İş Akışı:</strong> Form onaylandığında Supabase <code>repair_tickets</code> tablosuna 
                benzersiz takip koduyla yeni kayıt açılacak ve yazdırılabilir kabul belgesi oluşturulacaktır.
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !isImeiValid}
              className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Servis Kaydı Açılıyor...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Servis Kaydını Aç & Fiş Üret ({formatCurrency(watchedEstimatedCost)})
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Yazdırılabilir Cihaz Kabul ve Servis Fişi Modalı */}
      <ServiceTicketModal
        isOpen={isReceiptModalOpen}
        data={receiptData}
        onClose={() => setIsReceiptModalOpen(false)}
        onNewTicket={handleResetForNew}
      />

      {/* Yeni Müşteri Oluşturma Modalı */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        mode="create"
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveNewCustomer}
      />
    </div>
  )
}
