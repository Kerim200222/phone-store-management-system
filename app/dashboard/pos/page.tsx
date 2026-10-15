"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { 
  Barcode, 
  Search, 
  RotateCcw, 
  Package, 
  Smartphone, 
  Wrench, 
  ShoppingBag,
  Zap,
  Store,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  CloudOff
} from "lucide-react"
import dynamic from "next/dynamic"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VirtualizedProductGrid } from "@/components/pos/virtualized-product-grid"
import { POSCart } from "@/components/pos/pos-cart"

// Lazy Loading: Fiş kesme diyaloğunu yalnızca ihtiyaç duyulduğunda yükle
const POSReceiptModal = dynamic(
  () => import("@/components/pos/pos-receipt-modal").then((m) => m.POSReceiptModal),
  { ssr: false }
)
import { 
  POSProduct, 
  CartItem, 
  CartSummary, 
  POSCustomerSelect, 
  POSPaymentMethod, 
  SaleReceipt, 
  INITIAL_POS_PRODUCTS, 
  calculateCartSummary 
} from "@/types/pos"
import { INITIAL_CUSTOMERS } from "@/types/customer"
import { processPOSTransaction, generateTransactionNumber } from "@/lib/pos-checkout"
import { toast } from "sonner"
import { parseAppError } from "@/lib/error-handler"
import { useNetworkStatus } from "@/hooks/use-network-status"
import {
  saveOfflineTransaction,
  getPendingOfflineCount,
  clearSyncedTransactions,
} from "@/lib/offline-storage"
import { syncOfflineTransactions } from "@/lib/offline-sync-service"
import { useSyncedProducts, useSyncedCustomers } from "@/hooks/use-store-data"

type CategoryFilter = "all" | "Telefon" | "Aksesuar" | "Yedek Parça"

export default function POSPage() {
  // Veri Durumları
  const [products, setProducts] = useState<POSProduct[]>(INITIAL_POS_PRODUCTS)
  const [customers, setCustomers] = useState<POSCustomerSelect[]>(INITIAL_CUSTOMERS)
  const [isLoading, setIsLoading] = useState(false)

  // Sepet State'i (Client-side state)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<POSCustomerSelect | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<POSPaymentMethod>("cash")
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Satış Tamamlandı Fiş Modalı
  const [receipt, setReceipt] = useState<SaleReceipt | null>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  // Filtre ve Arama State'i
  const [searchQuery, setSearchQuery] = useState("")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [scanNotification, setScanNotification] = useState<string | null>(null)

  // Offline-First ve Ağ Durumu Yönetimi
  const { isOnline } = useNetworkStatus()
  const [pendingOfflineCount, setPendingOfflineCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  // Bekleyen çevrimdışı satış sayısını güncelleme
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingOfflineCount()
      setPendingOfflineCount(count)
    } catch (e) {
      console.warn("Kuyruk sayısı okunamadı:", e)
    }
  }, [])

  // Bekleyen çevrimdışı satışları senkronize etme fonksiyonu
  const handleTriggerSync = useCallback(async () => {
    if (isSyncing) return
    setIsSyncing(true)
    try {
      const res = await syncOfflineTransactions()
      if (res.syncedCount > 0) {
        toast.success("Çevrimdışı Satışlar Senkronize Edildi", {
          description: `${res.syncedCount} adet çevrimdışı işlem Supabase veritabanına başarıyla aktarıldı.`,
        })
        await clearSyncedTransactions()
      }
      if (res.failedCount > 0) {
        toast.warning("Bazı İşlemler Senkronize Edilemedi", {
          description: `${res.failedCount} işlem bekletiliyor, tekrar denenecek.`,
        })
      }
    } catch (err) {
      console.error("Senkronizasyon hatası:", err)
      toast.error("Senkronizasyon Başarısız", {
        description: "Sunucuya ulaşılamadı. Bağlantı kurulduğunda tekrar deneyin.",
      })
    } finally {
      setIsSyncing(false)
      refreshPendingCount()
    }
  }, [isSyncing, refreshPendingCount])

  useEffect(() => {
    refreshPendingCount()
  }, [refreshPendingCount])

  // İnternet geri geldiğinde arka planda otomatik senkronizasyon (Background Sync)
  useEffect(() => {
    if (isOnline) {
      getPendingOfflineCount().then((count) => {
        if (count > 0) {
          handleTriggerSync()
        }
      })
    }
  }, [isOnline, handleTriggerSync])

  // Global Senkronize StoreEngine Verileri
  const { products: syncedProducts, isLoading: isProductsLoading } = useSyncedProducts()
  const { customers: syncedCustomers, isLoading: isCustomersLoading } = useSyncedCustomers()

  useEffect(() => {
    setIsLoading(isProductsLoading || isCustomersLoading)
  }, [isProductsLoading, isCustomersLoading])

  useEffect(() => {
    if (syncedProducts && syncedProducts.length > 0) {
      const mapped: POSProduct[] = syncedProducts.map((p) => ({
        id: String(p.id || ""),
        name: String(p.name || ""),
        brand: String(p.brand || ""),
        model: p.model ? String(p.model) : null,
        category: String(p.category || "Aksesuar"),
        barcode: p.barcode ? String(p.barcode) : null,
        imei: p.imei ? String(p.imei) : null,
        condition: (p.condition as "sıfır" | "ikinci el") || "sıfır",
        sale_price: Number(p.sale_price) || 0,
        purchase_price: Number(p.purchase_price) || 0,
        stock_quantity: Number(p.stock_quantity) || 0,
        min_stock_level: Number(p.min_stock_level) || 0,
        shelf_location: p.shelf_location ? String(p.shelf_location) : null,
        description: p.description ? String(p.description) : null,
        image_url: p.image_url ? String(p.image_url) : null,
        battery_health: p.battery_health ? Number(p.battery_health) : null,
        storage: p.storage ? String(p.storage) : null,
        color: p.color ? String(p.color) : null,
        is_active: p.is_active !== false,
      }))
      setProducts(mapped)
    }
  }, [syncedProducts])

  useEffect(() => {
    if (syncedCustomers && syncedCustomers.length > 0) {
      const mappedCust: POSCustomerSelect[] = syncedCustomers.map((c) => ({
        id: String(c.id || ""),
        full_name: String(c.full_name || ""),
        phone: String(c.phone || ""),
        balance: Number(c.balance) || 0,
        customer_type: String(c.full_name || "").includes("Ltd") ? "kurumsal" : "bireysel",
      }))
      setCustomers(mappedCust)
    }
  }, [syncedCustomers])

  // Sepet Finansal Özeti (Dinamik Hesaplama)
  const cartSummary: CartSummary = useMemo(() => {
    return calculateCartSummary(cart, discountAmount, 20)
  }, [cart, discountAmount])

  // Sepete Ürün Ekleme Mantığı
  const handleAddToCart = useCallback((product: POSProduct) => {
    if (product.stock_quantity <= 0) {
      toast.error("Stok Yetersiz", { description: `${product.name} stokta kalmamış.` })
      return
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id)

      if (existingIndex > -1) {
        const currentItem = prevCart[existingIndex]
        if (currentItem.quantity >= product.stock_quantity) {
          toast.warning("Maksimum Stok", { description: `Bu üründen daha fazla eklenemez (Mevcut: ${product.stock_quantity}).` })
          return prevCart
        }
        const updated = [...prevCart]
        const newQty = currentItem.quantity + 1
        updated[existingIndex] = {
          ...currentItem,
          quantity: newQty,
          total_price: (currentItem.unit_price * newQty) - currentItem.discount,
        }
        toast.success("Miktar Artırıldı", { description: `${product.name} (${newQty} Adet)` })
        return updated
      } else {
        const newItem: CartItem = {
          id: `cart-${product.id}-${Date.now()}`,
          product,
          quantity: 1,
          unit_price: product.sale_price,
          discount: 0,
          total_price: product.sale_price,
          selected_imei: product.imei,
        }
        toast.success("Sepete Eklendi", { description: `${product.name} (₺${product.sale_price.toLocaleString("tr-TR")})` })
        return [newItem, ...prevCart]
      }
    })
  }, [])

  // Sepet Miktarı Değiştirme
  const handleUpdateQuantity = useCallback((id: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta
            if (newQty <= 0) return null
            if (newQty > item.product.stock_quantity) return item // Maksimum stok
            return {
              ...item,
              quantity: newQty,
              total_price: (item.unit_price * newQty) - item.discount,
            }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    })
  }, [])

  // Sepet Miktarı Doğrudan Ayarlama
  const handleSetQuantity = useCallback((id: string, qty: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const clampedQty = Math.max(1, Math.min(qty, item.product.stock_quantity))
            return {
              ...item,
              quantity: clampedQty,
              total_price: (item.unit_price * clampedQty) - item.discount,
            }
          }
          return item
        })
    })
  }, [])

  // Sepetten Ürün Çıkarma
  const handleRemoveItem = useCallback((id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }, [])

  // Sepeti Temizleme
  const handleClearCart = useCallback(() => {
    setCart((prev) => {
      if (prev.length === 0) return prev
      return []
    })
    setDiscountAmount(0)
  }, [])

  // Barkod / IMEI ile Hızlı Ekleme
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = barcodeInput.trim()
    if (!query) return

    const matchedProduct = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === query.toLowerCase()) ||
        (p.imei && p.imei.toLowerCase() === query.toLowerCase()) ||
        p.id.toLowerCase() === query.toLowerCase()
    )

    if (matchedProduct) {
      if (matchedProduct.stock_quantity > 0) {
        handleAddToCart(matchedProduct)
        setScanNotification(`✅ "${matchedProduct.name}" sepete eklendi!`)
      } else {
        setScanNotification(`⚠️ "${matchedProduct.name}" stokta kalmamış!`)
        toast.error("Stok Yetersiz", { description: `"${matchedProduct.name}" stokta kalmamış!` })
      }
    } else {
      setScanNotification(`❌ "${query}" barkod veya IMEI ile eşleşen ürün bulunamadı.`)
      toast.error("Ürün Bulunamadı", { description: `"${query}" barkod veya IMEI ile eşleşen ürün bulunamadı.` })
    }

    setBarcodeInput("")
    setTimeout(() => setScanNotification(null), 3500)
  }

  // Çevrimdışı Satış Gerçekleştirme (IndexedDB Kuyruğuna Alma)
  const processOfflineCheckout = useCallback(async () => {
    const offlineTxNumber = generateTransactionNumber()
    const offlineTxId = `offline-${Date.now()}`
    const dateStr = new Date().toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })

    await saveOfflineTransaction({
      id: offlineTxId,
      transactionNumber: offlineTxNumber,
      createdAt: new Date().toISOString(),
      items: [...cart],
      summary: { ...cartSummary },
      customer: selectedCustomer,
      paymentMethod,
      notes: selectedCustomer
        ? `Müşteri: ${selectedCustomer.full_name} (${selectedCustomer.phone}) [ÇEVRİMDIŞI KUYRUK]`
        : "Hızlı POS Perakende Satışı [ÇEVRİMDIŞI KUYRUK]",
    })

    // 1. Yerel ürün stoklarını düşür
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.find((c) => c.product.id === p.id)
        if (cartItem) {
          return {
            ...p,
            stock_quantity: Math.max(0, p.stock_quantity - cartItem.quantity),
          }
        }
        return p
      })
    )

    // 2. Fiş Verisini Oluştur (Çevrimdışı Fiş)
    const offlineReceipt: SaleReceipt = {
      receipt_no: `${offlineTxNumber} (Çevrimdışı)`,
      transaction_id: offlineTxId,
      date: dateStr,
      cashier_name: "Kasa Personeli (Offline Mod)",
      customer: selectedCustomer,
      items: [...cart],
      summary: { ...cartSummary },
      payment_method: paymentMethod,
    }

    setReceipt(offlineReceipt)
    setIsReceiptOpen(true)
    setCart([])
    setDiscountAmount(0)
    refreshPendingCount()

    setScanNotification(
      `🔌 Çevrimdışı Satış Fişi Kesildi: ${offlineTxNumber} IndexedDB kuyruğuna kaydedildi.`
    )
    toast.success("Çevrimdışı Satış Fişi Kesildi", {
      description: `Fiş No: ${offlineTxNumber} • Satış yerel IndexedDB kuyruğuna alındı. İnternet bağlantısı sağlandığında otomatik senkronize edilecektir.`,
    })
  }, [cart, cartSummary, selectedCustomer, paymentMethod, refreshPendingCount])

  // Satışı Tamamlama ve Fiş Kesme (Offline-First / Supabase Transaction & Stok Düşümü)
  const handleCheckout = useCallback(async () => {
    if (cart.length === 0) return
    setIsCheckingOut(true)

    // 1. Durum Kontrolü: İnternet Yoksa Doğrudan Offline-First Kuyruğuna Al
    if (!isOnline) {
      try {
        await processOfflineCheckout()
      } catch (offErr) {
        console.error("Çevrimdışı kayıt hatası:", offErr)
        toast.error("Çevrimdışı Kayıt Hatası", {
          description: "Satış yerel depolamaya yazılamadı.",
        })
      } finally {
        setIsCheckingOut(false)
      }
      return
    }

    try {
      // Supabase Transaction:
      // 1) transactions tablosuna satış fişi kaydı
      // 2) transaction_items tablosuna sepetteki kalemler
      // 3) products tablosunda satılan ürünlerin stok miktarını düşürme
      // 4) Veresiye satışında müşteri bakiyesi güncelleme
      const result = await processPOSTransaction({
        items: cart,
        summary: cartSummary,
        customer: selectedCustomer,
        paymentMethod,
        notes: selectedCustomer 
          ? `Müşteri: ${selectedCustomer.full_name} (${selectedCustomer.phone})`
          : "Hızlı POS Ayaküstü Perakende Satışı",
      })

      if (result.success) {
        // 1. Yerel Ürün Stoklarını Canlı Güncelle (Stok anında düşer)
        setProducts((prev) =>
          prev.map((p) => {
            const updatedMatch = result.updatedProducts.find((u) => u.id === p.id)
            if (updatedMatch) {
              return {
                ...p,
                stock_quantity: updatedMatch.newStock,
              }
            }
            return p
          })
        )

        // 2. Veresiye durumunda müşteri bakiyesini güncelle
        if (result.updatedCustomerBalance !== undefined && selectedCustomer) {
          setCustomers((prev) =>
            prev.map((c) =>
              c.id === selectedCustomer.id
                ? { ...c, balance: result.updatedCustomerBalance! }
                : c
            )
          )
        }

        const dateStr = new Date().toLocaleDateString("tr-TR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })

        // 3. Fiş Verisini Oluştur
        const newReceipt: SaleReceipt = {
          receipt_no: result.transactionNumber,
          transaction_id: result.transactionId,
          date: dateStr,
          cashier_name: "Yönetici (Admin)",
          customer: selectedCustomer,
          items: [...cart],
          summary: { ...cartSummary },
          payment_method: paymentMethod,
        }

        setReceipt(newReceipt)
        setIsReceiptOpen(true)
        setCart([])
        setDiscountAmount(0)
        setScanNotification(
          `✅ Satış Tamamlandı! ${result.transactionNumber} veritabanına kaydedildi ve ${result.itemsCount} ürünün stoğu düşürüldü.`
        )
        toast.success("Satış Başarıyla Tamamlandı", {
          description: `Fiş No: ${result.transactionNumber} • Tutar: ₺${cartSummary.grand_total.toLocaleString("tr-TR")}`
        })
      } else {
        const parsed = parseAppError(result.error, "Satış Tamamlanamadı")
        // Ağ hatası ise otomatik çevrimdışı kuyruğa yedekle
        if (parsed.isNetwork) {
          await processOfflineCheckout()
        } else {
          setScanNotification(`❌ Satış işlemi başarısız: ${parsed.userMessage}`)
          toast.error(parsed.title, { description: parsed.userMessage })
        }
      }
    } catch (err: unknown) {
      console.error("Satış işlemi sırasında beklenmeyen hata:", err)
      const parsed = parseAppError(err, "Satış Tamamlanamadı")
      if (parsed.isNetwork) {
        // Ağ kesintisiyse otomatik çevrimdışı fiş olarak kaydet
        await processOfflineCheckout()
      } else {
        setScanNotification(`❌ ${parsed.userMessage}`)
        toast.error(parsed.title, { description: parsed.userMessage })
      }
    } finally {
      setIsCheckingOut(false)
    }
  }, [cart, cartSummary, selectedCustomer, paymentMethod, isOnline, processOfflineCheckout])

  // Yeni Satış Başlatma (Sepeti Sıfırla)
  const handleNewSale = useCallback(() => {
    setCart([])
    setDiscountAmount(0)
    setSelectedCustomer(null)
    setPaymentMethod("cash")
    setReceipt(null)
  }, [])

  // Filtreleri Sıfırlama
  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setCategoryFilter("all")
    setSelectedBrand("all")
    setOnlyInStock(false)
  }, [])

  // Fiş Modalını Kapatma
  const handleCloseReceipt = useCallback(() => {
    setIsReceiptOpen(false)
  }, [])

  // Benzersiz Markalar Listesi
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>()
    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand)
    })
    return Array.from(brandsSet).sort()
  }, [products])

  // Ürün Filtreleme ve Arama
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 1. Arama sorgusu
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const nameMatch = product.name.toLowerCase().includes(q)
        const brandMatch = product.brand.toLowerCase().includes(q)
        const modelMatch = product.model ? product.model.toLowerCase().includes(q) : false
        const barcodeMatch = product.barcode ? product.barcode.includes(q) : false
        const imeiMatch = product.imei ? product.imei.includes(q) : false

        if (!nameMatch && !brandMatch && !modelMatch && !barcodeMatch && !imeiMatch) {
          return false
        }
      }

      // 2. Kategori filtresi
      if (categoryFilter !== "all" && product.category !== categoryFilter) {
        return false
      }

      // 3. Marka filtresi
      if (selectedBrand !== "all" && product.brand !== selectedBrand) {
        return false
      }

      // 4. Sadece stoktakiler
      if (onlyInStock && product.stock_quantity <= 0) {
        return false
      }

      return true
    })
  }, [products, searchQuery, categoryFilter, selectedBrand, onlyInStock])

  // Sepetteki adet haritası
  const inCartCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    cart.forEach((item) => {
      counts[item.product.id] = (counts[item.product.id] || 0) + item.quantity
    })
    return counts
  }, [cart])

  return (
    <div className="space-y-4">
      {/* Üst Başlık ve POS Durum Göstergesi */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Hızlı Satış Noktası (POS)
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 hidden sm:inline-flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  Gün 17
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Barkod/IMEI okuma, hızlı sepet yönetimi ve anlık fiş kesme
              </p>
            </div>
          </div>
        </div>

        {/* Hızlı İstatistik ve Ağ Durumu Rozetleri */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Ağ Durumu Rozeti */}
          {isOnline ? (
            <Badge variant="outline" className="bg-emerald-950/60 border-emerald-800/80 text-emerald-300 text-xs gap-1.5 py-1.5 px-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Çevrimiçi</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-950/90 border-amber-700 text-amber-300 text-xs gap-1.5 py-1.5 px-2.5 shadow-sm animate-pulse">
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Çevrimdışı Kasa Modu</span>
            </Badge>
          )}

          {/* Çevrimdışı Kuyruk ve Senkronizasyon Düğmesi */}
          {pendingOfflineCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="h-8 text-xs gap-1.5 bg-cyan-950/70 border-cyan-700 text-cyan-200 hover:bg-cyan-900 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? "animate-spin" : ""}`} />
              <span>Kuyruk: <strong>{pendingOfflineCount}</strong> ({isSyncing ? "Eşitleniyor..." : "Eşitle"})</span>
            </Button>
          )}

          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center gap-2 text-slate-300">
            <Package className="w-4 h-4 text-cyan-400" />
            <span>Katalog: <strong className="text-white">{products.length}</strong></span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center gap-2 text-slate-300">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Sepette: <strong className="text-emerald-400">{cartSummary.total_quantity}</strong></span>
          </div>
        </div>
      </div>

      {/* Çevrimdışı Kasa Uyarı Şeridi */}
      {!isOnline && (
        <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-700/80 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-900/60 border border-amber-700/50 text-amber-400">
              <CloudOff className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-amber-100">Offline-First Kasa Modu Devrede</p>
              <p className="text-amber-300/80 text-[11px]">
                İnternet bağlantısı kesildi. Yapılan satışlar yerel IndexedDB kuyruğuna kaydedilecek ve internet geri geldiğinde otomatik olarak Supabase ile senkronize edilecektir.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-[11px] font-mono bg-amber-900/80 px-2 py-1 rounded border border-amber-600/60 text-amber-200">
              Kuyruk: {pendingOfflineCount} bekleyen fiş
            </span>
          </div>
        </div>
      )}

      {/* Barkod Bildirim Şeridi */}
      {scanNotification && (
        <div className="p-3 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-xs text-cyan-200 flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-150">
          <span>{scanNotification}</span>
          <button onClick={() => setScanNotification(null)} className="text-cyan-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* ANA POS DÜZENİ: SOL ÜRÜN KATALOĞU (65%) | SAĞ SEPET (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* SOL KOLON: ARAMA, FİLTRELER VE ÜRÜN KARTLARI (7 veya 8 Kolon) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Arama ve Barkod Tarayıcı Giriş Alanı */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Barkod Okuyucu Girişi */}
              <form onSubmit={handleBarcodeSubmit} className="sm:col-span-5 relative">
                <Barcode className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  placeholder="Barkod veya IMEI okutun..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="pl-9 pr-14 bg-slate-950 border-slate-700 text-xs h-9 text-white font-mono placeholder:text-slate-500 focus:border-cyan-500"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="absolute right-1 top-1 h-7 px-2.5 bg-cyan-600 hover:bg-cyan-500 text-[11px]"
                >
                  Okut
                </Button>
              </form>

              {/* Serbest Metin Arama */}
              <div className="sm:col-span-7 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  placeholder="Model adı, marka, depolama veya özellik ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 bg-slate-950 border-slate-800 text-xs h-9 text-white placeholder:text-slate-500 focus:border-cyan-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Hızlı Kategori ve Marka Filtre Hapları */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
              {/* Kategori Hapları */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    categoryFilter === "all"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  Tümü ({products.length})
                </button>

                <button
                  type="button"
                  onClick={() => setCategoryFilter("Telefon")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    categoryFilter === "Telefon"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Telefonlar
                </button>

                <button
                  type="button"
                  onClick={() => setCategoryFilter("Aksesuar")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    categoryFilter === "Aksesuar"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  Aksesuar & Şarj
                </button>

                <button
                  type="button"
                  onClick={() => setCategoryFilter("Yedek Parça")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    categoryFilter === "Yedek Parça"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Yedek Parça
                </button>
              </div>

              {/* Ekstra Kontroller: Marka & Stok Durumu */}
              <div className="flex items-center gap-2 text-xs">
                {/* Marka Dropdown */}
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  aria-label="Marka Filtresi"
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-md px-2 py-1 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">Tüm Markalar</option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                {/* Sadece Stokta Var Toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <span>Sadece Stokta</span>
                </label>
              </div>
            </div>
          </div>

          {/* Ürün Kartları Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs">Ürünler ve stok bilgileri yükleniyor...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/80 p-8 space-y-3">
              <Package className="w-10 h-10 text-slate-600" />
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Ürün Bulunamadı</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Seçtiğiniz filtreler veya arama sorgusuna uygun ürün envanterde yer almıyor.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearFilters}
                className="text-xs h-8 gap-1.5 border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Filtreleri Temizle
              </Button>
            </div>
          ) : (
            <VirtualizedProductGrid
              products={filteredProducts}
              inCartCounts={inCartCounts}
              onAddToCart={handleAddToCart}
              onClearFilters={handleClearFilters}
              columnsCount={3}
            />
          )}
        </div>

        {/* SAĞ KOLON: ALIŞVERİŞ SEPETİ VE KASA KONTROLÜ (4 veya 5 Kolon, Sticky) */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-4">
          <POSCart
            items={cart}
            summary={cartSummary}
            onUpdateQuantity={handleUpdateQuantity}
            onSetQuantity={handleSetQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            customers={customers}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
            paymentMethod={paymentMethod}
            onSelectPaymentMethod={setPaymentMethod}
            discountAmount={discountAmount}
            onApplyDiscount={setDiscountAmount}
            onCheckout={handleCheckout}
            isCheckingOut={isCheckingOut}
          />
        </div>
      </div>

      {/* Satış Tamamlandı Fiş Modalı */}
      <POSReceiptModal
        receipt={receipt}
        isOpen={isReceiptOpen}
        onClose={handleCloseReceipt}
        onNewSale={handleNewSale}
      />
    </div>
  )
}
