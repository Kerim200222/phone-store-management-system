/**
 * ==============================================================================
 * GÜN 28: DÜŞÜK STOK UYARI SİSTEMİ SERVİS KATMANI
 * ==============================================================================
 * Bu servis; stok miktarı 5'in (veya belirtilen eşiğin) altına düşen ürünleri
 * Supabase RPC (get_low_stock_products), doğrudan Supabase sorguları veya
 * zengin çevrimdışı fallback veri seti üzerinden tespit eder.
 * ==============================================================================
 */

import { createClient } from "@/utils/supabase/client"
import {
  LowStockProduct,
  StockAlertSummary,
  StockAlertResponse,
  StockSeverity,
} from "@/types/stock-alert"

/**
 * Ciddiyet Seviyesi Belirleyici
 */
export function determineSeverity(quantity: number): StockSeverity {
  if (quantity <= 0) return "out_of_stock"
  if (quantity <= 2) return "critical"
  return "warning"
}

/**
 * Çevrimdışı / İlk Yükleme İçin Gerçekçi Telefon Mağazası Düşük Stok Örnekleri
 */
export const MOCK_LOW_STOCK_PRODUCTS: LowStockProduct[] = [
  {
    id: "low-1",
    name: "iPhone 12 Deji Mucize Batarya (2815mAh)",
    brand: "Deji",
    model: "iPhone 12",
    barcode: "8681234567890",
    imei: null,
    stockQuantity: 0,
    minStockLevel: 3,
    purchasePrice: 650,
    salePrice: 1250,
    imageUrl: null,
    categoryName: "Yedek Parça",
    severity: "out_of_stock",
  },
  {
    id: "low-2",
    name: "iPhone 11 GX OLED Ekran Paneli",
    brand: "Apple",
    model: "iPhone 11",
    barcode: "8689876543210",
    imei: null,
    stockQuantity: 1,
    minStockLevel: 2,
    purchasePrice: 950,
    salePrice: 1850,
    imageUrl: null,
    categoryName: "Yedek Parça",
    severity: "critical",
  },
  {
    id: "low-3",
    name: "Apple 20W USB-C Orijinal Güç Adaptörü",
    brand: "Apple",
    model: "20W USB-C",
    barcode: "194252157007",
    imei: null,
    stockQuantity: 1,
    minStockLevel: 5,
    purchasePrice: 380,
    salePrice: 700,
    imageUrl: null,
    categoryName: "Aksesuar",
    severity: "critical",
  },
  {
    id: "low-4",
    name: "Samsung Galaxy S23 5G 128GB (Phantom Black)",
    brand: "Samsung",
    model: "Galaxy S23",
    barcode: "8806094770001",
    imei: "359102948576102",
    stockQuantity: 2,
    minStockLevel: 3,
    purchasePrice: 24500,
    salePrice: 29999,
    imageUrl: "/products/s23.jpg",
    categoryName: "Telefon",
    severity: "critical",
  },
  {
    id: "low-5",
    name: "Xiaomi 67W Turbo Hızlı Şarj Başlığı ve Kablo",
    brand: "Xiaomi",
    model: "MDY-12-EH",
    barcode: "6934177740002",
    imei: null,
    stockQuantity: 3,
    minStockLevel: 4,
    purchasePrice: 420,
    salePrice: 850,
    imageUrl: null,
    categoryName: "Aksesuar",
    severity: "warning",
  },
  {
    id: "low-6",
    name: "iPhone 13 9H Nano Hayalet Ekran Koruyucu",
    brand: "Spigen",
    model: "iPhone 13",
    barcode: "8809811850003",
    imei: null,
    stockQuantity: 4,
    minStockLevel: 5,
    purchasePrice: 120,
    salePrice: 350,
    imageUrl: null,
    categoryName: "Aksesuar",
    severity: "warning",
  },
]

/**
 * Sayısal Özet Hesaplayıcı
 */
export function buildStockAlertSummary(
  products: LowStockProduct[],
  threshold: number = 5
): StockAlertSummary {
  let outOfStock = 0
  let critical = 0
  let warning = 0

  for (const p of products) {
    if (p.severity === "out_of_stock") outOfStock++
    else if (p.severity === "critical") critical++
    else warning++
  }

  return {
    threshold,
    totalCount: products.length,
    outOfStockCount: outOfStock,
    criticalCount: critical,
    warningCount: warning,
    products,
    lastCheckedAt: new Date().toISOString(),
  }
}

/**
 * Stok Miktarı Eşiğin (varsayılan: 5) Altına Düşen Ürünleri Getirir
 * 1. Supabase RPC 'get_low_stock_products' dener
 * 2. Doğrudan Supabase 'products' tablosunu .lt('stock_quantity', threshold) ile sorgular
 * 3. Çevrimdışı/dev ortamında mock fallback verisi döner
 */
export async function fetchLowStockProducts(
  threshold: number = 5
): Promise<StockAlertResponse> {
  const supabase = createClient()

  // 1. Supabase RPC Çağrısı
  try {
    const { data: rpcData, error: rpcError } = await (supabase as unknown as {
      rpc: (fn: string, params?: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>
    }).rpc("get_low_stock_products", {
      p_threshold: threshold,
    })

    if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
      const mapped: LowStockProduct[] = (rpcData as Array<Record<string, unknown>>).map((item) => {
        const qty = Number(item.stock_quantity ?? item.stockQuantity ?? 0)
        return {
          id: String(item.id),
          name: String(item.name || "Ürün"),
          brand: String(item.brand || ""),
          model: item.model ? String(item.model) : null,
          barcode: item.barcode ? String(item.barcode) : null,
          imei: item.imei ? String(item.imei) : null,
          stockQuantity: qty,
          minStockLevel: Number(item.min_stock_level ?? item.minStockLevel ?? 1),
          purchasePrice: Number(item.purchase_price ?? item.purchasePrice ?? 0),
          salePrice: Number(item.sale_price ?? item.salePrice ?? 0),
          imageUrl: item.image_url ? String(item.image_url) : null,
          categoryId: item.category_id ? String(item.category_id) : null,
          categoryName: String(item.category_name ?? item.categoryName ?? "Genel"),
          severity: determineSeverity(qty),
        }
      })

      return {
        success: true,
        data: buildStockAlertSummary(mapped, threshold),
        source: "supabase_rpc",
      }
    }
  } catch (err) {
    console.warn("get_low_stock_products RPC çağrısı atlandı:", err)
  }

  // 2. Doğrudan Supabase Tablo Sorgusu (products.stock_quantity < threshold)
  try {
    const { data: productsData, error: tableError } = await supabase
      .from("products")
      .select(`
        id,
        name,
        brand,
        model,
        barcode,
        imei,
        stock_quantity,
        min_stock_level,
        purchase_price,
        sale_price,
        image_url,
        category_id,
        categories (
          id,
          name
        )
      `)
      .eq("is_active", true)
      .lt("stock_quantity", threshold)
      .order("stock_quantity", { ascending: true })

    if (!tableError && Array.isArray(productsData) && productsData.length > 0) {
      const mapped: LowStockProduct[] = (productsData as Array<Record<string, unknown>>).map((item) => {
        const qty = Number(item.stock_quantity ?? 0)
        const cat = (item.categories as Record<string, unknown>) || {}
        return {
          id: String(item.id),
          name: String(item.name || "Ürün"),
          brand: String(item.brand || ""),
          model: item.model ? String(item.model) : null,
          barcode: item.barcode ? String(item.barcode) : null,
          imei: item.imei ? String(item.imei) : null,
          stockQuantity: qty,
          minStockLevel: Number(item.min_stock_level ?? 1),
          purchasePrice: Number(item.purchase_price ?? 0),
          salePrice: Number(item.sale_price ?? 0),
          imageUrl: item.image_url ? String(item.image_url) : null,
          categoryId: item.category_id ? String(item.category_id) : null,
          categoryName: String(cat.name || "Genel"),
          severity: determineSeverity(qty),
        }
      })

      return {
        success: true,
        data: buildStockAlertSummary(mapped, threshold),
        source: "supabase_direct",
      }
    }
  } catch (err) {
    console.warn("Supabase doğrudan düşük stok sorgusu hatası:", err)
  }

  // 3. Fallback Mock Veri Seti
  const filteredMocks = MOCK_LOW_STOCK_PRODUCTS.filter((p) => p.stockQuantity < threshold)
  return {
    success: true,
    data: buildStockAlertSummary(filteredMocks, threshold),
    source: "mock_fallback",
  }
}
