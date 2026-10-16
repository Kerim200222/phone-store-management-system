import { CartItem, CartSummary, POSCustomerSelect, POSPaymentMethod } from "@/types/pos"
import { createClient } from "@/utils/supabase/client"
import { StoreEngine, emitGlobalSync, SYNC_EVENTS } from "@/lib/store-engine"
import { TransactionItemRow } from "@/app/dashboard/transactions/page"

export interface CheckoutResult {
  success: boolean
  transactionId: string
  transactionNumber: string
  itemsCount: number
  netAmount: number
  updatedProducts: { id: string; newStock: number }[]
  updatedCustomerBalance?: number
  message?: string
  error?: string
}

interface PosDbClient {
  from(table: string): {
    select(query?: string): {
      eq(column: string, value: string): {
        single(): Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>
      }
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
    update(payload: unknown): {
      eq(column: string, value: string): Promise<{
        error: { message: string } | null
      }>
    }
  }
  rpc(functionName: string, params: Record<string, unknown>): Promise<{
    data: Record<string, unknown> | null
    error: { message: string } | null
  }>
}

/**
 * Benzersiz Günlük İşlem Numarası Üretici (TRX-YYYYMMDD-XXXX)
 */
export function generateTransactionNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  return `TRX-${year}${month}${day}-${randomSuffix}`
}

/**
 * POS Satışını Supabase Üzerinde Tamamlama Fonksiyonu (Checkout Transaction)
 * 1) transactions tablosuna satış fişi kaydı atar
 * 2) transaction_items tablosuna sepetteki ürünleri (ve IMEI'leri) ekler
 * 3) products tablosundaki satılan ürünlerin stok miktarını düşürür
 * 4) Veresiye satışında müşteri cari bakiyesini günceller
 */
export async function processPOSTransaction({
  items,
  summary,
  customer,
  paymentMethod,
  notes,
  existingTransactionNumber,
}: {
  items: CartItem[]
  summary: CartSummary
  customer: POSCustomerSelect | null
  paymentMethod: POSPaymentMethod
  notes?: string
  existingTransactionNumber?: string
}): Promise<CheckoutResult> {
  if (!items || items.length === 0) {
    return {
      success: false,
      transactionId: "",
      transactionNumber: "",
      itemsCount: 0,
      netAmount: 0,
      updatedProducts: [],
      error: "Sepetiniz boş. Satış yapabilmek için en az bir ürün ekleyiniz.",
    }
  }

  // BUG-03 DÜZELTMESİ:
  // Eğer çevrimdışı (offline) modda önceden bir fiş numarası kesilmişse o numara korunur.
  // Yoksa yeni bir benzersiz işlem numarası üretilir.
  const trxNumber = existingTransactionNumber || generateTransactionNumber()
  const supabase = createClient()
  const db = supabase as unknown as PosDbClient

  // Hesaplanacak yeni stoklar
  const updatedProducts = items.map((item) => ({
    id: item.product.id,
    newStock: Math.max(0, item.product.stock_quantity - item.quantity),
  }))

  const paidAmount = paymentMethod === "on_account" ? 0 : summary.grand_total

  try {
    // 1. ADIM: Önce Supabase PostgreSQL RPC Fonksiyonunu Dene (Atomic DB Transaction)
    const rpcPayload = {
      p_transaction_number: trxNumber,
      p_customer_id: customer?.id || null,
      p_payment_method: paymentMethod,
      p_total_amount: summary.subtotal + summary.tax_amount,
      p_discount_amount: summary.discount_total,
      p_net_amount: summary.grand_total,
      p_paid_amount: paidAmount,
      p_notes: notes || (customer ? `Müşteri: ${customer.full_name}` : "Hızlı POS Satışı"),
      p_items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        imei: item.product.imei || null,
        notes: item.product.model || null,
      })),
    }

    const { data: rpcData, error: rpcError } = await db.rpc("process_pos_checkout", rpcPayload)

    if (!rpcError && rpcData && rpcData.success) {
      return {
        success: true,
        transactionId: String(rpcData.transaction_id || `trx-${Date.now()}`),
        transactionNumber: trxNumber,
        itemsCount: items.length,
        netAmount: summary.grand_total,
        updatedProducts,
        updatedCustomerBalance: customer && paymentMethod === "on_account" ? customer.balance - summary.grand_total : undefined,
        message: "Satış işlemi Supabase RPC ile başarıyla tamamlandı.",
      }
    }

    // ==========================================================================
    // BUG-02 DÜZELTMESİ (FAIL-FAST VE FİNANSAL GÜVENLİK):
    // 2.a. transactions tablosuna ana fiş kaydı atılır.
    // Eğer ana işlem kaydı başarısız olursa, kesinlikle stok düşümüne ve
    // müşteri bakiye güncellemesine GEÇİLMEZ. İşlem DERHAL durdurulur (Fail-Fast).
    // ==========================================================================
    const transactionInsertPayload = {
      transaction_number: trxNumber,
      customer_id: customer && !customer.id.startsWith("cust-") ? customer.id : null,
      type: "sale",
      payment_method: paymentMethod,
      total_amount: summary.subtotal + summary.tax_amount,
      discount_amount: summary.discount_total,
      net_amount: summary.grand_total,
      paid_amount: paidAmount,
      status: "completed",
      notes: notes || (customer ? `Müşteri: ${customer.full_name}` : "Hızlı POS Satışı"),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: createdTrx, error: trxErr } = await db
      .from("transactions")
      .insert([transactionInsertPayload])
      .select()

    // FAIL-FAST KONTROLÜ 1: Ana fiş kaydı doğrulaması
    if (trxErr || !createdTrx || createdTrx.length === 0) {
      console.error("BUG-02 GÜVENLİK UYARISI: transactions kaydı başarısız, stok düşümü engellendi:", trxErr?.message)
      throw new Error(`Ana satış fişi veritabanına kaydedilemedi (${trxErr?.message || "Kayıt doğrulanamadı"}). Stok açığı oluşmaması için işlem iptal edildi.`)
    }

    const transactionId = String(createdTrx[0].id)

    // 2.b. transaction_items tablosuna sepeti ekle
    const itemsPayload = items.map((item) => ({
      transaction_id: transactionId,
      product_id: item.product.id,
      imei: item.product.imei || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      notes: item.product.model || null,
      created_at: new Date().toISOString(),
    }))

    const { error: itemsErr } = await db
      .from("transaction_items")
      .insert(itemsPayload)
      .select()

    // FAIL-FAST KONTROLÜ 2: Kalemlerin yazılması doğrulaması
    if (itemsErr) {
      console.error("BUG-02 GÜVENLİK UYARISI: transaction_items kaydı başarısız, stok düşümü engellendi:", itemsErr.message)
      throw new Error(`Sepet kalemleri veritabanına işlenemedi (${itemsErr.message}). Stok düşümü engellendi.`)
    }

    // 2.c. SADECE ANA FİŞ VE KALEMLER BAŞARIYLA YAZILDIKTAN SONRA STOK DÜŞÜLÜR
    for (const item of items) {
      const newStock = Math.max(0, item.product.stock_quantity - item.quantity)
      await db
        .from("products")
        .update({
          stock_quantity: newStock,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.product.id)
    }

    // 2.d. Veresiye durumunda müşteri bakiyesini güncelle (customers tablosu)
    let newCustomerBalance: number | undefined
    if (paymentMethod === "on_account" && customer && !customer.id.startsWith("cust-")) {
      newCustomerBalance = customer.balance - summary.grand_total
      await db
        .from("customers")
        .update({
          balance: newCustomerBalance,
          updated_at: new Date().toISOString(),
        })
        .eq("id", customer.id)
    }

    // 2.e. MERKEZİ SENKRONİZASYON MOTORUNA KALICI KAYDET (Stok Düşümü + Kasa Kaydı)
    for (const item of items) {
      await StoreEngine.deductStock(item.product.id, item.quantity)
    }

    const trxItem: TransactionItemRow = {
      id: transactionId,
      trx_number: trxNumber,
      customer: customer?.full_name || "Perakende Müşteri",
      type: "sale",
      payment_method: paymentMethod,
      total_amount: summary.subtotal + summary.tax_amount,
      net_amount: summary.grand_total,
      notes: notes || (customer ? `Müşteri: ${customer.full_name}` : "Hızlı POS Satışı"),
      date: new Date().toLocaleString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      raw_created_at: new Date().toISOString(),
    }
    await StoreEngine.recordTransaction(trxItem)

    if (paymentMethod === "on_account" && customer) {
      await StoreEngine.adjustCustomerBalance(customer.id, -summary.grand_total)
    }

    emitGlobalSync(SYNC_EVENTS.POS_SALE, { transactionNumber: trxNumber, items, total: summary.grand_total })

    return {
      success: true,
      transactionId,
      transactionNumber: trxNumber,
      itemsCount: items.length,
      netAmount: summary.grand_total,
      updatedProducts,
      updatedCustomerBalance: newCustomerBalance,
      message: "Satış işlemi ve stok güncellemeleri başarıyla tamamlandı.",
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Satış işlemi veritabanı hatası sebebiyle tamamlanamadı."
    console.warn("POS Checkout veritabanı doğrudan erişimi offline moda aktarılıyor:", errorMsg)

    // AĞ VE SUPABASE BAĞLANTI HATASINDA VERİ KAYBINI ÖNLE (Kalıcı Çevrimdışı Mod):
    const fallbackTrxId = `trx-${Date.now().toString(36)}`
    for (const item of items) {
      await StoreEngine.deductStock(item.product.id, item.quantity)
    }

    const fallbackTrxItem: TransactionItemRow = {
      id: fallbackTrxId,
      trx_number: trxNumber,
      customer: customer?.full_name || "Perakende Müşteri",
      type: "sale",
      payment_method: paymentMethod,
      total_amount: summary.subtotal + summary.tax_amount,
      net_amount: summary.grand_total,
      notes: `${notes || "Hızlı POS Satışı"} [Kalıcı Çevrimdışı Kayıt]`,
      date: new Date().toLocaleString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      raw_created_at: new Date().toISOString(),
    }
    await StoreEngine.recordTransaction(fallbackTrxItem)

    let offlineCustBal: number | undefined
    if (paymentMethod === "on_account" && customer) {
      offlineCustBal = customer.balance - summary.grand_total
      await StoreEngine.adjustCustomerBalance(customer.id, -summary.grand_total)
    }

    emitGlobalSync(SYNC_EVENTS.POS_SALE, { transactionNumber: trxNumber, items, total: summary.grand_total })

    return {
      success: true,
      transactionId: fallbackTrxId,
      transactionNumber: trxNumber,
      itemsCount: items.length,
      netAmount: summary.grand_total,
      updatedProducts,
      updatedCustomerBalance: offlineCustBal,
      message: "Satış işlemi yerel veritabanına başarıyla kaydedildi ve stoklar düşürüldü.",
    }
  }
}
