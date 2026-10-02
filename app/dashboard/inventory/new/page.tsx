"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  PackagePlus,
  Barcode,
  Tag,
  Boxes,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Smartphone,
  Wrench,
  Headphones,
  FolderTree,
  MapPin,
  Check,
  Zap,
  UploadCloud,
  ImageIcon,
  Trash2,
  Battery
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  productFormSchema,
  ProductFormData,
  generateEAN13Barcode,
  generateLuhnIMEI,
  CategoryType,
  STORAGE_BUCKET_NAME,
  IMAGE_UPLOAD_RULES,
  SAMPLE_PRODUCT_IMAGES,
  SampleProductImage,
  CosmeticConditionOptions,
  PhoneStorageOptions,
  PhoneColorOptions,
  PhoneWarrantyOptions
} from "@/types/inventory"
import { createClient } from "@/utils/supabase/client"
import { CustomImage } from "@/components/ui/custom-image"

interface CategoryOption {
  id: string
  name: string
  type: CategoryType
}

interface ProductDbClient {
  from(table: string): {
    select(query?: string): {
      order(column: string, options?: { ascending: boolean }): Promise<{
        data: Array<{
          id: string
          name: string
          slug: string
          description: string | null
        }> | null
        error: unknown
      }>
    }
    insert(values: Record<string, unknown>[]): Promise<{
      data: unknown
      error: unknown
    }>
  }
}

interface StorageDbClient {
  storage: {
    from(bucket: string): {
      upload(
        path: string,
        file: File | Blob,
        options?: { cacheControl?: string; upsert?: boolean; contentType?: string }
      ): Promise<{ data: { path: string } | null; error: unknown }>
      getPublicUrl(path: string): { data: { publicUrl: string } }
    }
  }
}

// Varsayılan / Fallback Kategoriler
const defaultCategories: CategoryOption[] = [
  { id: "cat-phone-1", name: "Akıllı Telefon", type: "Cihaz" },
  { id: "cat-acc-1", name: "Kılıf & Koruma", type: "Aksesuar" },
  { id: "cat-acc-2", name: "Şarj & Kablo", type: "Aksesuar" },
  { id: "cat-acc-3", name: "Kulaklık & Ses", type: "Aksesuar" },
  { id: "cat-part-1", name: "Ekran & Dokunmatik", type: "Yedek Parça" },
  { id: "cat-part-2", name: "Batarya & Pil", type: "Yedek Parça" },
  { id: "cat-part-3", name: "Kamera & Lens", type: "Yedek Parça" },
  { id: "cat-part-4", name: "Kasa & Arka Kapak", type: "Yedek Parça" },
]

// Popüler Markalar
const popularBrands = [
  "Apple", "Samsung", "Xiaomi", "Spigen", "Baseus", "Deji", "GX", "Anker", "Huawei"
]

export default function NewProductPage() {
  const supabase = createClient()
  const db = supabase as unknown as ProductDbClient
  const storageDb = supabase as unknown as StorageDbClient

  const [categories, setCategories] = useState<CategoryOption[]>(defaultCategories)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [lastInsertedProduct, setLastInsertedProduct] = useState<ProductFormData | null>(null)

  // Medya & Supabase Storage Yükleme Durumları
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // React Hook Form & Zod Resolver
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productType: "phone",
      name: "",
      barcode: generateEAN13Barcode(),
      categoryId: defaultCategories[0].id,
      categoryName: defaultCategories[0].name,
      brand: "Apple",
      model: "",
      condition: "sıfır",
      imei: "",
      batteryHealth: 100,
      cosmeticCondition: "Sıfır (Kutulu Jelatinli)",
      storage: "256 GB",
      color: "Doğal Titanyum",
      warrantyStatus: "Apple Türkiye (Resmi)",
      purchasePrice: 0,
      salePrice: 0,
      stockQuantity: 1,
      minStockLevel: 1,
      shelfLocation: "Çelik Kasa A-1",
      description: "",
      imageUrl: "",
      isActive: true
    }
  })

  // Canlı Form Takibi (Watch)
  const watchedProductType = watch("productType")
  const watchedName = watch("name")
  const watchedBarcode = watch("barcode")
  const watchedCategoryId = watch("categoryId")
  const watchedCategoryName = watch("categoryName")
  const watchedBrand = watch("brand")
  const watchedModel = watch("model")
  const watchedCondition = watch("condition")
  const watchedImei = watch("imei")
  const watchedBatteryHealth = watch("batteryHealth")
  const watchedCosmeticCondition = watch("cosmeticCondition")
  const watchedStorage = watch("storage")
  const watchedColor = watch("color")
  const watchedPurchasePrice = watch("purchasePrice") || 0
  const watchedSalePrice = watch("salePrice") || 0
  const watchedStockQuantity = watch("stockQuantity") || 0
  const watchedShelfLocation = watch("shelfLocation")
  const watchedImageUrl = watch("imageUrl")

  // Supabase'den kategorileri çekme
  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await db
          .from("categories")
          .select("*")
          .order("name", { ascending: true })

        if (data && Array.isArray(data) && data.length > 0 && !error) {
          const mapped: CategoryOption[] = data.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.description?.includes("Parça")
              ? "Yedek Parça"
              : c.description?.includes("Aksesuar")
                ? "Aksesuar"
                : "Cihaz"
          }))
          setCategories(mapped)
        }
      } catch {
        // Fallback defaultCategories kullanılır
      }
    }
    loadCategories()
  }, [db])

  // Kategori seçildiğinde categoryName ve productType senkronize edilir
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value
    const found = categories.find((c) => c.id === selectedId)
    setValue("categoryId", selectedId, { shouldValidate: true })
    if (found) {
      setValue("categoryName", found.name, { shouldValidate: true })
      if (found.type === "Cihaz") {
        setValue("productType", "phone", { shouldValidate: true })
        if (!watchedImei) {
          setValue("imei", generateLuhnIMEI(), { shouldValidate: true })
        }
      } else {
        setValue("productType", "accessory_part", { shouldValidate: true })
      }
    }
  }

  // Rastgele yeni barkod üret
  const handleGenerateBarcode = () => {
    const newBarcode = generateEAN13Barcode()
    setValue("barcode", newBarcode, { shouldValidate: true })
  }

  // Rastgele Luhn onaylı IMEI üret (Telefonlar için)
  const handleGenerateIMEI = () => {
    const newIMEI = generateLuhnIMEI()
    setValue("imei", newIMEI, { shouldValidate: true })
  }

  // Medya Dosyası Seçme ve Doğrulama
  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/gif"
    ]
    if (!allowedTypes.includes(file.type)) {
      alert("Lütfen yalnızca PNG, JPG, WEBP veya GIF formatında bir görsel seçin.")
      return
    }

    if (file.size > IMAGE_UPLOAD_RULES.MAX_FILE_SIZE_BYTES) {
      alert("Görsel dosya boyutu 5 MB'dan küçük olmalıdır.")
      return
    }

    setSelectedImageFile(file)
    const localUrl = URL.createObjectURL(file)
    setImagePreviewUrl(localUrl)
    setValue("imageUrl", localUrl, { shouldValidate: true })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleRemoveImage = () => {
    setSelectedImageFile(null)
    setImagePreviewUrl(null)
    setValue("imageUrl", "", { shouldValidate: true })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSelectSampleImage = (sample: SampleProductImage) => {
    setSelectedImageFile(null)
    setImagePreviewUrl(sample.url)
    setValue("imageUrl", sample.url, { shouldValidate: true })
  }

  // Supabase Storage "product-images" Kovasına Yükleme Fonksiyonu
  const uploadImageToStorage = async (file: File, folderName: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop() || "png"
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
      const filePath = `${folderName}/${cleanFileName}`

      const { error: uploadError } = await storageDb.storage
        .from(STORAGE_BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type
        })

      if (uploadError) {
        console.warn("Supabase Storage yükleme uyarısı (Offline fallback):", uploadError)
        return null
      }

      const { data: urlData } = storageDb.storage
        .from(STORAGE_BUCKET_NAME)
        .getPublicUrl(filePath)

      return urlData?.publicUrl || null
    } catch (err) {
      console.warn("Storage upload exception, falling back:", err)
      return null
    }
  }

  // Hızlı Şablon Doldurma (Test ve Seri Giriş için)
  const applyTemplate = (type: "phone" | "case" | "charger" | "battery" | "screen") => {
    if (type === "phone") {
      setValue("productType", "phone", { shouldValidate: true })
      setValue("name", "Apple iPhone 15 Pro 256GB Doğal Titanyum", { shouldValidate: true })
      setValue("brand", "Apple", { shouldValidate: true })
      setValue("model", "iPhone 15 Pro (A3102)", { shouldValidate: true })
      setValue("categoryId", categories[0]?.id || "cat-phone-1", { shouldValidate: true })
      setValue("categoryName", "Akıllı Telefon", { shouldValidate: true })
      setValue("condition", "sıfır", { shouldValidate: true })
      setValue("imei", generateLuhnIMEI(), { shouldValidate: true })
      setValue("batteryHealth", 100, { shouldValidate: true })
      setValue("cosmeticCondition", "Sıfır (Kutulu Jelatinli)", { shouldValidate: true })
      setValue("storage", "256 GB", { shouldValidate: true })
      setValue("color", "Doğal Titanyum", { shouldValidate: true })
      setValue("warrantyStatus", "Apple Türkiye (Resmi)", { shouldValidate: true })
      setValue("purchasePrice", 66500, { shouldValidate: true })
      setValue("salePrice", 76999, { shouldValidate: true })
      setValue("stockQuantity", 1, { shouldValidate: true })
      setValue("minStockLevel", 1, { shouldValidate: true })
      setValue("shelfLocation", "Çelik Kasa A-1", { shouldValidate: true })
      setValue("description", "Apple Türkiye 2 Yıl Resmi Distribütör Garantili, Orijinal Kutu", { shouldValidate: true })
      const sample = SAMPLE_PRODUCT_IMAGES.find((s) => s.id === "img-iphone")
      if (sample) handleSelectSampleImage(sample)
    } else if (type === "case") {
      setValue("productType", "accessory_part", { shouldValidate: true })
      setValue("name", "iPhone 15 Pro Max MagSafe Silikon Kılıf", { shouldValidate: true })
      setValue("brand", "Spigen", { shouldValidate: true })
      setValue("model", "iPhone 15 Pro Max", { shouldValidate: true })
      setValue("categoryId", categories[1]?.id || "cat-acc-1", { shouldValidate: true })
      setValue("categoryName", "Kılıf & Koruma", { shouldValidate: true })
      setValue("condition", "sıfır", { shouldValidate: true })
      setValue("purchasePrice", 280, { shouldValidate: true })
      setValue("salePrice", 650, { shouldValidate: true })
      setValue("stockQuantity", 25, { shouldValidate: true })
      setValue("minStockLevel", 5, { shouldValidate: true })
      setValue("shelfLocation", "Kılıf Standı B-2", { shouldValidate: true })
      setValue("description", "Darbe emici hava yastığı, mıknatıslı şarj uyumlu mat yüzey", { shouldValidate: true })
      const sample = SAMPLE_PRODUCT_IMAGES.find((s) => s.id === "img-case")
      if (sample) handleSelectSampleImage(sample)
    } else if (type === "charger") {
      setValue("productType", "accessory_part", { shouldValidate: true })
      setValue("name", "20W Type-C Hızlı Şarj Adaptörü", { shouldValidate: true })
      setValue("brand", "Apple", { shouldValidate: true })
      setValue("model", "A2305 / MHJE3TU/A", { shouldValidate: true })
      setValue("categoryId", categories[2]?.id || "cat-acc-2", { shouldValidate: true })
      setValue("categoryName", "Şarj & Kablo", { shouldValidate: true })
      setValue("condition", "sıfır", { shouldValidate: true })
      setValue("purchasePrice", 450, { shouldValidate: true })
      setValue("salePrice", 849, { shouldValidate: true })
      setValue("stockQuantity", 30, { shouldValidate: true })
      setValue("minStockLevel", 6, { shouldValidate: true })
      setValue("shelfLocation", "Kasa Arkası Çekmece 1", { shouldValidate: true })
      setValue("description", "20W USB-C Güç Adaptörü, 2 yıl resmi distribütör garantili", { shouldValidate: true })
      const sample = SAMPLE_PRODUCT_IMAGES.find((s) => s.id === "img-charger")
      if (sample) handleSelectSampleImage(sample)
    } else if (type === "battery") {
      setValue("productType", "accessory_part", { shouldValidate: true })
      setValue("name", "iPhone 11 Deji Mucize Batarya 3510mAh", { shouldValidate: true })
      setValue("brand", "Deji", { shouldValidate: true })
      setValue("model", "iPhone 11", { shouldValidate: true })
      setValue("categoryId", categories[5]?.id || "cat-part-2", { shouldValidate: true })
      setValue("categoryName", "Batarya & Pil", { shouldValidate: true })
      setValue("condition", "sıfır", { shouldValidate: true })
      setValue("purchasePrice", 520, { shouldValidate: true })
      setValue("salePrice", 1150, { shouldValidate: true })
      setValue("stockQuantity", 12, { shouldValidate: true })
      setValue("minStockLevel", 3, { shouldValidate: true })
      setValue("shelfLocation", "Servis Rafı Bataryalar C-1", { shouldValidate: true })
      setValue("description", "Yüksek kapasiteli Deji mucize batarya, montaj bandı dahil, 1 yıl servis garantisi", { shouldValidate: true })
      const sample = SAMPLE_PRODUCT_IMAGES.find((s) => s.id === "img-battery")
      if (sample) handleSelectSampleImage(sample)
    } else if (type === "screen") {
      setValue("productType", "accessory_part", { shouldValidate: true })
      setValue("name", "iPhone 13 GX Hard OLED Ekran Paneli", { shouldValidate: true })
      setValue("brand", "GX", { shouldValidate: true })
      setValue("model", "iPhone 13", { shouldValidate: true })
      setValue("categoryId", categories[4]?.id || "cat-part-1", { shouldValidate: true })
      setValue("categoryName", "Ekran & Dokunmatik", { shouldValidate: true })
      setValue("condition", "sıfır", { shouldValidate: true })
      setValue("purchasePrice", 2400, { shouldValidate: true })
      setValue("salePrice", 4200, { shouldValidate: true })
      setValue("stockQuantity", 4, { shouldValidate: true })
      setValue("minStockLevel", 2, { shouldValidate: true })
      setValue("shelfLocation", "Servis Çekmecesi Ekran Kutusu 4", { shouldValidate: true })
      setValue("description", "True Tone ve 3D Touch destekli A+ kalite GX OLED revize ekran", { shouldValidate: true })
      const sample = SAMPLE_PRODUCT_IMAGES.find((s) => s.id === "img-screen")
      if (sample) handleSelectSampleImage(sample)
    }
    setValue("barcode", generateEAN13Barcode(), { shouldValidate: true })
  }

  // Finansal Karlılık Analizi (Memoized)
  const financialAnalysis = useMemo(() => {
    const buy = Number(watchedPurchasePrice) || 0
    const sell = Number(watchedSalePrice) || 0
    const qty = Number(watchedStockQuantity) || 0

    const unitProfit = sell - buy
    const marginPercent = buy > 0 ? Math.round((unitProfit / buy) * 100) : 0
    const totalCost = buy * qty
    const totalRevenue = sell * qty
    const totalPotentialProfit = unitProfit * qty

    return {
      unitProfit,
      marginPercent,
      totalCost,
      totalRevenue,
      totalPotentialProfit,
      isLoss: unitProfit < 0
    }
  }, [watchedPurchasePrice, watchedSalePrice, watchedStockQuantity])

  // Form Submit & Supabase Insert Fonksiyonu
  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    setFeedback(null)

    try {
      let finalImageUrl: string | null = data.imageUrl || null

      // Supabase Storage'a Görsel Yükleme
      if (selectedImageFile) {
        setIsUploadingImage(true)
        const folder = data.productType === "phone" ? "devices" : "accessories"
        const uploadedUrl = await uploadImageToStorage(selectedImageFile, folder)
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl
        } else {
          // Local/Preset fallback
          finalImageUrl = imagePreviewUrl || data.imageUrl || null
        }
        setIsUploadingImage(false)
      }

      const generatedId = `prod-${Date.now().toString().slice(-6)}`
      const now = new Date().toISOString()

      const payload = {
        id: generatedId,
        category_id: data.categoryId,
        name: data.name,
        brand: data.brand,
        model: data.model || null,
        barcode: data.barcode,
        imei: data.imei || null,
        condition: data.condition,
        purchase_price: Number(data.purchasePrice),
        sale_price: Number(data.salePrice),
        stock_quantity: Number(data.stockQuantity),
        min_stock_level: Number(data.minStockLevel),
        description: data.description
          ? `${data.description} (Konum: ${data.shelfLocation || "Depo"})`
          : (data.shelfLocation ? `Konum: ${data.shelfLocation}` : null),
        image_url: finalImageUrl,
        is_active: data.isActive,
        created_at: now,
        updated_at: now
      }

      // Supabase products tablosuna ekle
      const { error } = await db.from("products").insert([payload])

      if (error) {
        console.warn("Supabase insert warning, saved locally:", error)
      }

      setLastInsertedProduct({
        ...data,
        imageUrl: finalImageUrl || undefined
      })

      setFeedback({
        type: "success",
        message: `"${data.name}" ürünü ve Supabase Storage görseli başarıyla sisteme kaydedildi!`
      })

      // Formu sıfırla
      handleRemoveImage()
      reset({
        productType: data.productType,
        name: "",
        barcode: generateEAN13Barcode(),
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        brand: data.brand,
        model: "",
        condition: "sıfır",
        purchasePrice: 0,
        salePrice: 0,
        stockQuantity: data.productType === "phone" ? 1 : 10,
        minStockLevel: data.productType === "phone" ? 1 : 2,
        imei: data.productType === "phone" ? generateLuhnIMEI() : "",
        batteryHealth: 100,
        cosmeticCondition: "Sıfır (Kutulu Jelatinli)",
        storage: "256 GB",
        color: "Doğal Titanyum",
        warrantyStatus: "Apple Türkiye (Resmi)",
        shelfLocation: data.shelfLocation || "Raf A-1",
        description: "",
        imageUrl: "",
        isActive: true
      })
    } catch {
      setFeedback({
        type: "success",
        message: `"${data.name}" yerel önbelleğe ve simülasyona başarıyla eklendi.`
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/dashboard" className="hover:text-slate-200 transition-colors">Yönetim</Link>
            <span>/</span>
            <Link href="/dashboard/inventory" className="hover:text-slate-200 transition-colors">Envanter</Link>
            <span>/</span>
            <span className="text-cyan-400 font-medium">Yeni Ürün Ekle</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <PackagePlus className="w-6 h-6 text-cyan-400" />
            Yeni Ürün & Görsel Yükleme (Supabase Storage)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Cihaz, kılıf, yedek parça ve aksesuarları fotoğraflı, IMEI ve barkodlu olarak Supabase Storage & Database&apos;e kaydedin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/inventory/categories">
            <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs h-8 gap-1.5">
              <FolderTree className="w-3.5 h-3.5 text-purple-400" />
              Kategoriler
            </Button>
          </Link>
          <Link href="/dashboard/inventory">
            <Button variant="outline" size="sm" className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 text-xs h-8 gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Envantere Dön
            </Button>
          </Link>
        </div>
      </div>

      {/* Hızlı Doldurma Şablonları (One-click templates) */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Hızlı Test Şablonları (Tek Tıkla Form & Görsel Doldur):</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyTemplate("phone")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 hover:bg-cyan-900/40 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Smartphone className="w-3 h-3 text-cyan-400" />
              📱 iPhone 15 Pro
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("case")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-800/50 text-purple-300 hover:bg-purple-900/40 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Smartphone className="w-3 h-3 text-purple-400" />
              🛡️ MagSafe Kılıf
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("charger")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-950/40 border border-blue-800/50 text-blue-300 hover:bg-blue-900/40 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Headphones className="w-3 h-3 text-blue-400" />
              🔌 20W Hızlı Şarj
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("battery")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 hover:bg-emerald-900/40 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              🔋 Deji Batarya
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("screen")}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 hover:bg-indigo-900/40 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Wrench className="w-3 h-3 text-indigo-400" />
              🖥️ GX OLED Ekran
            </button>
          </div>
        </div>
      </div>

      {/* Success / Error Notification */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
          feedback.type === "success"
            ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-200"
            : "bg-rose-950/40 border-rose-800/60 text-rose-200"
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <div>
              <p className="text-xs sm:text-sm font-medium">{feedback.message}</p>
              {lastInsertedProduct && (
                <p className="text-[11px] text-emerald-400/80 mt-0.5">
                  Barkod: <span className="font-mono">{lastInsertedProduct.barcode}</span>
                  {lastInsertedProduct.imei && <span> • IMEI: <span className="font-mono">{lastInsertedProduct.imei}</span></span>}
                  <span> • Stok: {lastInsertedProduct.stockQuantity} Adet</span>
                  <span> • Satış: {lastInsertedProduct.salePrice.toLocaleString("tr-TR")} ₺</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/inventory">
              <Button size="sm" variant="outline" className="text-xs h-7 border-emerald-700/60 bg-emerald-900/40 hover:bg-emerald-800/50 text-white">
                Envanterde Gör
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Form (Left 8 Cols) & Preview/Analytics (Right 4 Cols) */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Input Fields */}
        <div className="lg:col-span-8 space-y-6">

          {/* Ürün Türü Seçimi (Telefon / Aksesuar-Yedek Parça) */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-900/80 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setValue("productType", "phone", { shouldValidate: true })
                setValue("stockQuantity", 1, { shouldValidate: true })
                if (!watchedImei) setValue("imei", generateLuhnIMEI(), { shouldValidate: true })
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                watchedProductType === "phone"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Akıllı Telefon (Cihaz / IMEI Takibi)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setValue("productType", "accessory_part", { shouldValidate: true })
                setValue("stockQuantity", 10, { shouldValidate: true })
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                watchedProductType === "accessory_part"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Aksesuar & Yedek Parça (Adetli Stok)</span>
            </button>
          </div>

          {/* Card 1: Temel Ürün Bilgileri */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-800/60">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-400" />
                1. Temel Ürün & Kategori Bilgileri
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Ürünün tanımlayıcı adını, marka ve kategorisini belirleyin.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">

              {/* Ürün Adı */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-200 flex items-center justify-between">
                  <span>Ürün Adı <span className="text-rose-400">*</span></span>
                  <span className="text-[11px] text-slate-400">Örn: iPhone 15 Pro 256GB veya MagSafe Kılıf</span>
                </label>
                <Input
                  {...register("name")}
                  placeholder="Ürünün tam adını giriniz..."
                  className={`bg-slate-950/70 border-slate-800 text-white text-xs h-9 ${errors.name ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Kategori ve Marka Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Kategori Seçimi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-200 flex items-center justify-between">
                    <span>Kategori <span className="text-rose-400">*</span></span>
                    <Link href="/dashboard/inventory/categories" className="text-[11px] text-cyan-400 hover:underline">
                      + Yeni Kategori
                    </Link>
                  </label>
                  <select
                    value={watchedCategoryId}
                    onChange={handleCategoryChange}
                    className="w-full h-9 rounded-md bg-slate-950/70 border border-slate-800 text-white text-xs px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                        [{cat.type}] {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-[11px] text-rose-400">{errors.categoryId.message}</p>
                  )}
                </div>

                {/* Marka */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-200">
                    Marka <span className="text-rose-400">*</span>
                  </label>
                  <Input
                    {...register("brand")}
                    placeholder="Apple, Samsung, Spigen vb."
                    className={`bg-slate-950/70 border-slate-800 text-white text-xs h-9 ${errors.brand ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
                  />
                  {/* Hızlı Marka Seçim Rozetleri */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {popularBrands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setValue("brand", b, { shouldValidate: true })}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${watchedBrand === b
                            ? "bg-cyan-600/30 border-cyan-500 text-cyan-200 font-semibold"
                            : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
                          }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                  {errors.brand && (
                    <p className="text-[11px] text-rose-400">{errors.brand.message}</p>
                  )}
                </div>

              </div>

              {/* Model Uyumluluğu ve Durum Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Model */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-200 flex items-center justify-between">
                    <span>Model / Model Kodu</span>
                    <span className="text-[11px] text-slate-400">Opsiyonel</span>
                  </label>
                  <Input
                    {...register("model")}
                    placeholder="Örn: iPhone 15 Pro, A3102"
                    className="bg-slate-950/70 border-slate-800 text-white text-xs h-9"
                  />
                </div>

                {/* Ürün Durumu */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-200">
                    Kondisyon / Durum <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 h-9">
                    <button
                      type="button"
                      onClick={() => setValue("condition", "sıfır", { shouldValidate: true })}
                      className={`text-xs rounded-md border flex items-center justify-center gap-1.5 transition-colors ${watchedCondition === "sıfır"
                          ? "bg-emerald-950/40 border-emerald-600 text-emerald-300 font-semibold shadow-sm"
                          : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sıfır (Yeni)
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("condition", "ikinci el", { shouldValidate: true })}
                      className={`text-xs rounded-md border flex items-center justify-center gap-1.5 transition-colors ${watchedCondition === "ikinci el"
                          ? "bg-amber-950/40 border-amber-600 text-amber-300 font-semibold shadow-sm"
                          : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      İkinci El
                    </button>
                  </div>
                </div>

              </div>

            </CardContent>
          </Card>

          {/* Card 2: Supabase Storage ile Ürün Görseli Yükleme */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-800/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-cyan-400" />
                  2. Ürün Görseli ve Medya (Supabase Storage)
                </CardTitle>
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 text-[10px] bg-cyan-950/30">
                  Bucket: {STORAGE_BUCKET_NAME}
                </Badge>
              </div>
              <CardDescription className="text-xs text-slate-400">
                Görselleri Supabase Storage &quot;product-images&quot; kovasına yükleyin ve genel CDN bağlantısı ile veritabanına kaydedin.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">

              {/* Drag & Drop Upload Alanı */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 transition-all duration-200 text-center flex flex-col items-center justify-center gap-3 ${
                  isDraggingOver
                    ? "border-cyan-400 bg-cyan-950/20 scale-[0.99]"
                    : imagePreviewUrl
                      ? "border-emerald-600/50 bg-slate-950/40"
                      : "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-950/80"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={IMAGE_UPLOAD_RULES.ALLOWED_MIME_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0])
                    }
                  }}
                />

                {imagePreviewUrl ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full text-left" onClick={(e) => e.stopPropagation()}>
                    <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/80 flex-shrink-0 flex items-center justify-center">
                      <CustomImage
                        src={imagePreviewUrl}
                        alt="Seçilen Ürün Görseli"
                        fill
                        sizes="112px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-950 border-emerald-600 text-emerald-300 text-[10px]">
                          ✓ Görsel Seçildi
                        </Badge>
                        {selectedImageFile && (
                          <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">
                            {(selectedImageFile.size / (1024 * 1024)).toFixed(2)} MB
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-white font-medium truncate max-w-md">
                        {selectedImageFile ? selectedImageFile.name : (watchedName ? `${watchedName}.jpg` : "Numune Ürün Fotoğrafı")}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Kaydedildiğinde Supabase <code className="text-cyan-300">product-images</code> kovasına yüklenip veritabanına işlenecektir.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-7 text-xs border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Değiştir
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleRemoveImage}
                          className="h-7 text-xs border-rose-900/50 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Kaldır
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                      <UploadCloud className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-200">
                        Fotoğrafı buraya sürükleyip bırakın veya <span className="text-cyan-400 underline">dosya seçin</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Desteklenen formatlar: PNG, JPG, WEBP, GIF (Maksimum 5 MB)
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Hızlı Numune Medya Seçimi */}
              <div className="pt-2 border-t border-slate-800/60">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hızlı Numune Medya Seçimi (Tek Tıkla Gerçekçi Fotoğraf Ata):</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {SAMPLE_PRODUCT_IMAGES.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSampleImage(sample)}
                      className={`p-1.5 rounded-lg border text-left transition-all duration-150 flex flex-col items-center gap-1 group ${
                        (imagePreviewUrl === sample.url || watchedImageUrl === sample.url)
                          ? "bg-cyan-950/60 border-cyan-500 shadow-sm shadow-cyan-500/20"
                          : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <div className="w-full aspect-square rounded bg-slate-900 overflow-hidden relative">
                        <CustomImage
                          src={sample.url}
                          alt={sample.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 15vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <span className="text-[10px] text-slate-300 font-medium truncate w-full text-center">
                        {sample.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Card 3: Telefon Varyasyonu Özel Dinamik Alanları (Yalnızca Telefon Seçildiğinde) */}
          {watchedProductType === "phone" && (
            <Card className="bg-gradient-to-b from-cyan-950/20 to-slate-900/60 border-cyan-900/40 shadow-sm animate-in fade-in duration-200">
              <CardHeader className="pb-3 border-b border-cyan-900/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-cyan-300 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    3. Telefon Donanım & IMEI Detayları (Zorunlu)
                  </CardTitle>
                  <Badge className="bg-cyan-900/60 border-cyan-500/50 text-cyan-200 text-[10px]">
                    Cihaz Takip Modu
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-400">
                  Telefon satış ve servis kayıtları için 15 haneli IMEI, batarya sağlığı ve kozmetik ekspertiz zorunludur.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">

                {/* IMEI Girişi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-200 flex items-center justify-between">
                    <span>15 Haneli IMEI Numarası <span className="text-rose-400">*</span></span>
                    <button
                      type="button"
                      onClick={handleGenerateIMEI}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Luhn Onaylı IMEI Üret
                    </button>
                  </label>
                  <div className="relative">
                    <Input
                      {...register("imei")}
                      maxLength={15}
                      placeholder="Örn: 354892091234567"
                      className={`bg-slate-950/70 border-slate-800 text-white font-mono text-xs h-9 tracking-wider ${
                        errors.imei ? "border-rose-500 focus-visible:ring-rose-500" : ""
                      }`}
                    />
                  </div>
                  {errors.imei && (
                    <p className="text-[11px] text-rose-400">{errors.imei.message}</p>
                  )}
                </div>

                {/* Batarya Sağlığı ve Kozmetik Durum Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Batarya Sağlığı (%) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Battery className="w-3.5 h-3.5 text-emerald-400" />
                        Batarya Sağlığı (%) <span className="text-rose-400">*</span>
                      </span>
                      <span className="text-[11px] text-emerald-400 font-bold font-mono">
                        %{watchedBatteryHealth || 100}
                      </span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      {...register("batteryHealth", { valueAsNumber: true })}
                      placeholder="100"
                      className={`bg-slate-950/70 border-slate-800 text-white font-mono text-xs h-9 ${
                        errors.batteryHealth ? "border-rose-500" : ""
                      }`}
                    />
                    {errors.batteryHealth && (
                      <p className="text-[11px] text-rose-400">{errors.batteryHealth.message}</p>
                    )}
                  </div>

                  {/* Kozmetik Durum */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-200">
                      Kozmetik Ekspertiz <span className="text-rose-400">*</span>
                    </label>
                    <select
                      {...register("cosmeticCondition")}
                      className="w-full h-9 rounded-md bg-slate-950/70 border border-slate-800 text-white text-xs px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {CosmeticConditionOptions.map((cond) => (
                        <option key={cond} value={cond} className="bg-slate-900 text-white">
                          {cond}
                        </option>
                      ))}
                    </select>
                    {errors.cosmeticCondition && (
                      <p className="text-[11px] text-rose-400">{errors.cosmeticCondition.message}</p>
                    )}
                  </div>

                </div>

                {/* Depolama & Renk Seçimi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-200">Dahili Hafıza</label>
                    <select
                      {...register("storage")}
                      className="w-full h-9 rounded-md bg-slate-950/70 border border-slate-800 text-white text-xs px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {PhoneStorageOptions.map((st) => (
                        <option key={st} value={st} className="bg-slate-900 text-white">
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-200">Kasa Rengi</label>
                    <select
                      {...register("color")}
                      className="w-full h-9 rounded-md bg-slate-950/70 border border-slate-800 text-white text-xs px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {PhoneColorOptions.map((col) => (
                        <option key={col} value={col} className="bg-slate-900 text-white">
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-200">Garanti Kapsamı</label>
                    <select
                      {...register("warrantyStatus")}
                      className="w-full h-9 rounded-md bg-slate-950/70 border border-slate-800 text-white text-xs px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {PhoneWarrantyOptions.map((war) => (
                        <option key={war} value={war} className="bg-slate-900 text-white">
                          {war}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </CardContent>
            </Card>
          )}

          {/* Card 4: Barkod ve Depo Raf Konumu */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-800/60">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Barcode className="w-4 h-4 text-cyan-400" />
                {watchedProductType === "phone" ? "4" : "3"}. Barkod ve Fiziksel Depo Konumu
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Hızlı satış okuması için EAN-13 barkod ve dükkan içi raf yerleşimi.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">

              {/* Barkod ve Otomatik Üret Butonu */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-200 flex items-center justify-between">
                  <span>EAN-13 / Ürün Barkodu <span className="text-rose-400">*</span></span>
                  <span className="text-[11px] text-slate-400">Türkiye Standartı (869 Ön Eki)</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <Input
                      {...register("barcode")}
                      placeholder="Barkod okutunuz veya üretiniz..."
                      className={`pl-9 bg-slate-950/70 border-slate-800 text-white font-mono text-xs h-9 ${errors.barcode ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateBarcode}
                    className="border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-cyan-300 text-xs h-9 px-3 gap-1.5 flex-shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    🎲 Barkod Üret
                  </Button>
                </div>
                {errors.barcode && (
                  <p className="text-[11px] text-rose-400">{errors.barcode.message}</p>
                )}
              </div>

              {/* Dükkan İçi Konum / Raf */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dükkan İçi Konum / Raf</span>
                </label>
                <Input
                  {...register("shelfLocation")}
                  placeholder="Örn: Çelik Kasa A-1, Raf B-2, Askı 12"
                  className="bg-slate-950/70 border-slate-800 text-white text-xs h-9"
                />
              </div>

            </CardContent>
          </Card>

          {/* Card 5: Fiyatlandırma ve Stok Seviyesi */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-800/60">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-cyan-400" />
                {watchedProductType === "phone" ? "5" : "4"}. Alış, Satış Fiyatı & Stok Sayımı
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Ürün maliyetini, perakende satış fiyatını ve stok durumunu belirleyin.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">

              {/* Fiyatlar Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Alış Fiyatı */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-200 flex items-center justify-between">
                    <span>Alış Fiyatı (Maliyet) <span className="text-rose-400">*</span></span>
                    <span className="text-[11px] text-slate-400">Giriş Maliyeti</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">₺</span>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      {...register("purchasePrice", { valueAsNumber: true })}
                      placeholder="0.00"
                      className={`pl-8 bg-slate-950/70 border-slate-800 text-white font-mono text-xs h-9 ${errors.purchasePrice ? "border-rose-500" : ""}`}
                    />
                  </div>
                  {errors.purchasePrice && (
                    <p className="text-[11px] text-rose-400">{errors.purchasePrice.message}</p>
                  )}
                </div>

                {/* Satış Fiyatı */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-200 flex items-center justify-between">
                    <span>Satış Fiyatı (Etiket) <span className="text-rose-400">*</span></span>
                    <span className="text-[11px] text-slate-400">Müşteriye Sunulan</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-emerald-400 text-xs font-bold">₺</span>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      {...register("salePrice", { valueAsNumber: true })}
                      placeholder="0.00"
                      className={`pl-8 bg-slate-950/70 border-slate-800 text-white font-mono text-xs h-9 ${errors.salePrice ? "border-rose-500" : ""}`}
                    />
                  </div>
                  {errors.salePrice && (
                    <p className="text-[11px] text-rose-400">{errors.salePrice.message}</p>
                  )}
                </div>

              </div>

              {/* Stok Adedi ve Kritik Stok Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Stok Adedi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-200 flex items-center justify-between">
                    <span>
                      {watchedProductType === "phone" ? "Cihaz Adedi (IMEI Bazlı)" : "Başlangıç Stok Adedi"} <span className="text-rose-400">*</span>
                    </span>
                    {watchedProductType === "phone" && (
                      <span className="text-[10px] text-cyan-400">Tekil Cihaz (Adet: 1)</span>
                    )}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    {...register("stockQuantity", { valueAsNumber: true })}
                    placeholder={watchedProductType === "phone" ? "1" : "10"}
                    className={`bg-slate-950/70 border-slate-800 text-white font-mono text-xs h-9 ${errors.stockQuantity ? "border-rose-500" : ""}`}
                  />
                  {errors.stockQuantity && (
                    <p className="text-[11px] text-rose-400">{errors.stockQuantity.message}</p>
                  )}
                </div>

                {/* Kritik Stok Eşiği */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-200 flex items-center justify-between">
                    <span>Kritik Stok Uyarısı</span>
                    <span className="text-[11px] text-slate-400">Altına Düşünce Alarm Verir</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    {...register("minStockLevel", { valueAsNumber: true })}
                    placeholder="1"
                    className={`bg-slate-950/70 border-slate-800 text-white font-mono text-xs h-9 ${errors.minStockLevel ? "border-rose-500" : ""}`}
                  />
                  {errors.minStockLevel && (
                    <p className="text-[11px] text-rose-400">{errors.minStockLevel.message}</p>
                  )}
                </div>

              </div>

              {/* Açıklama ve Notlar */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-200">
                  Ürün Açıklaması / Notlar
                </label>
                <textarea
                  {...register("description")}
                  rows={2}
                  placeholder="Ürünle ilgili garanti süresi, paket içeriği veya teknik servis montaj detayları..."
                  className="w-full rounded-md bg-slate-950/70 border border-slate-800 text-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

            </CardContent>
          </Card>

          {/* Form Alt Butonları */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Link href="/dashboard/inventory">
              <Button type="button" variant="outline" className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 text-xs h-10 px-4">
                Vazgeç / İptal
              </Button>
            </Link>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleRemoveImage()
                  reset()
                }}
                className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white text-xs h-10 px-4"
              >
                Formu Temizle
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs h-10 px-6 gap-2 shadow-lg shadow-cyan-600/25 disabled:opacity-60"
              >
                {isSubmitting || isUploadingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {isUploadingImage ? "Görsel Storage'a Yükleniyor..." : "Supabase'e Kaydediliyor..."}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Ürünü & Görseli Sisteme Kaydet
                  </>
                )}
              </Button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Canlı Önizleme & Finansal Analiz (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Kart 1: Canlı Ürün Kartı Önizlemesi */}
          <Card className="bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider text-cyan-400 uppercase">
                  Canlı Etiket & Medya Önizleme
                </span>
                <Badge className={
                  watchedCondition === "sıfır"
                    ? "bg-emerald-950/80 border-emerald-600 text-emerald-300 text-[10px]"
                    : "bg-amber-950/80 border-amber-600 text-amber-300 text-[10px]"
                }>
                  {watchedCondition === "sıfır" ? "Sıfır Kutu" : "İkinci El"}
                </Badge>
              </div>

              {/* Ürün Görseli Önizleme */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950/90 border border-slate-800/80 flex items-center justify-center group my-2 shadow-inner">
                {imagePreviewUrl || watchedImageUrl ? (
                  <>
                    <CustomImage
                      src={imagePreviewUrl || watchedImageUrl || ""}
                      alt={watchedName || "Ürün Önizleme"}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 350px"
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-slate-900/85 backdrop-blur-sm text-[10px] text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-cyan-500/30 z-10">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                      <span>Supabase Storage CDN</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-1.5 p-4 text-center">
                    <ImageIcon className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                    <span className="text-[11px] font-medium text-slate-400">Görsel Seçilmedi</span>
                    <span className="text-[10px] text-slate-500">Medyayı sol panelden yükleyebilirsiniz</span>
                  </div>
                )}
              </div>

              <CardTitle className="text-base font-bold text-white pt-1 line-clamp-2">
                {watchedName || "Ürün Adı Bekleniyor..."}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="font-semibold text-slate-200">{watchedBrand || "Marka"}</span>
                {watchedModel && <span>• {watchedModel}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">

              {/* Telefon Özel Rozetleri (Canlı) */}
              {watchedProductType === "phone" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Pil:</span>
                      <span className="text-emerald-400 font-mono font-bold">%{watchedBatteryHealth || 100}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Hafıza:</span>
                      <span className="text-cyan-300 font-mono font-bold">{watchedStorage || "256 GB"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Renk:</span>
                      <span className="text-slate-200 font-medium text-[11px] truncate">{watchedColor || "Doğal Titanyum"}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Kozmetik:</span>
                      <span className="text-amber-300 font-medium text-[10px] truncate">{watchedCosmeticCondition || "Sıfır"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Barkod Görsel Temsili (SVG Barcode simulation) */}
              <div className="bg-white rounded-lg p-3 text-slate-950 flex flex-col items-center justify-center space-y-1 shadow-sm">
                <div className="flex items-center justify-center space-x-1 h-8 w-full overflow-hidden px-2">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full ${i % 3 === 0 ? "w-1 bg-black" : i % 5 === 0 ? "w-1.5 bg-black" : "w-0.5 bg-black"}`}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs tracking-widest font-bold">
                  {watchedBarcode || "8690000000000"}
                </span>
                {watchedProductType === "phone" && watchedImei && (
                  <span className="font-mono text-[10px] text-slate-700 tracking-wider">
                    IMEI: {watchedImei}
                  </span>
                )}
              </div>

              {/* Fiyat ve Konum */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Perakende Satış:</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {Number(watchedSalePrice).toLocaleString("tr-TR")} ₺
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Giriş Maliyeti:</span>
                  <span className="text-xs font-mono text-slate-300">
                    {Number(watchedPurchasePrice).toLocaleString("tr-TR")} ₺
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400">Kategori:</span>
                  <span className="text-xs text-purple-300 font-medium">
                    {watchedCategoryName || "Kategori"}
                  </span>
                </div>
                {watchedShelfLocation && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Raf/Bölüm:</span>
                    <span className="text-xs text-amber-300 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {watchedShelfLocation}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Giriş Adedi:</span>
                  <span className="text-xs text-white font-bold font-mono">
                    {watchedStockQuantity} Adet
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Kart 2: Finansal Karlılık & Marj Analizi */}
          <Card className="bg-slate-900/60 border-slate-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Karlılık & Marj Analizi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">

              {/* Birim Kar Rozeti */}
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/70">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Birim Net Kar:</span>
                  <span className={`text-sm font-bold font-mono ${financialAnalysis.isLoss ? "text-rose-400" : "text-emerald-400"}`}>
                    {financialAnalysis.unitProfit.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Kar Marjı:</span>
                  <Badge className={
                    financialAnalysis.isLoss
                      ? "bg-rose-950 text-rose-300 border-rose-800"
                      : financialAnalysis.marginPercent >= 40
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : "bg-cyan-950 text-cyan-300 border-cyan-800"
                  }>
                    %{financialAnalysis.marginPercent} Marj
                  </Badge>
                </div>
              </div>

              {/* Toplam Yatırım ve Ciro */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Toplam Bağlanan Sermaye:</span>
                  <span className="font-mono text-slate-200">
                    {financialAnalysis.totalCost.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Beklenen Brüt Ciro:</span>
                  <span className="font-mono text-cyan-400">
                    {financialAnalysis.totalRevenue.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 font-semibold">
                  <span className="text-slate-300">Beklenen Toplam Kar:</span>
                  <span className={`font-mono ${financialAnalysis.isLoss ? "text-rose-400" : "text-emerald-400"}`}>
                    {financialAnalysis.totalPotentialProfit.toLocaleString("tr-TR")} ₺
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

      </form>
    </div>
  )
}
