import { processPOSTransaction } from "@/lib/pos-checkout"
import {
  getPendingOfflineTransactions,
  markTransactionSynced,
  markTransactionFailed,
  saveSyncLog,
} from "@/lib/offline-storage"

export interface SyncProcessResult {
  totalProcessed: number
  syncedCount: number
  failedCount: number
  errors: Array<{ id: string; transactionNumber: string; error: string }>
}

let isSyncRunning = false

/**
 * IndexedDB kuyruğunda bekleyen tüm çevrimdışı satışları Supabase veritabanına senkronize eder.
 * Eşzamanlı mükerrer senkronizasyonları kilit (lock) mekanizması ile engeller.
 */
export async function syncOfflineTransactions(): Promise<SyncProcessResult> {
  if (isSyncRunning) {
    return {
      totalProcessed: 0,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    }
  }

  isSyncRunning = true

  const result: SyncProcessResult = {
    totalProcessed: 0,
    syncedCount: 0,
    failedCount: 0,
    errors: [],
  }

  try {
    const pendingTransactions = await getPendingOfflineTransactions()
    result.totalProcessed = pendingTransactions.length

    if (pendingTransactions.length === 0) {
      return result
    }

    for (const item of pendingTransactions) {
      try {
        // ======================================================================
        // BUG-03 DÜZELTMESİ (FİŞ NUMARASI MUTABAKATI):
        // Çevrimdışı modda müşteriye verilen fişteki 'transactionNumber'
        // sunucuya aktarılırken korunur; yeni rastgele numara üretilmez.
        // ======================================================================
        const checkoutRes = await processPOSTransaction({
          items: item.items,
          summary: item.summary,
          customer: item.customer,
          paymentMethod: item.paymentMethod,
          notes: `${item.notes || ""} [Çevrimdışı Kesildi: ${new Date(item.createdAt).toLocaleString("tr-TR")}]`,
          existingTransactionNumber: item.transactionNumber,
        })

        if (checkoutRes.success) {
          await markTransactionSynced(item.id, checkoutRes.transactionId)
          result.syncedCount++
        } else {
          const errMsg = checkoutRes.error || "Bilinmeyen veritabanı senkronizasyon hatası"
          await markTransactionFailed(item.id, errMsg)
          result.failedCount++
          result.errors.push({
            id: item.id,
            transactionNumber: item.transactionNumber,
            error: errMsg,
          })
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Ağ veya bağlantı hatası"
        await markTransactionFailed(item.id, errMsg)
        result.failedCount++
        result.errors.push({
          id: item.id,
          transactionNumber: item.transactionNumber,
          error: errMsg,
        })
      }
    }

    // Senkronizasyon günlüğünü kaydet
    await saveSyncLog({
      totalProcessed: result.totalProcessed,
      syncedCount: result.syncedCount,
      failedCount: result.failedCount,
      details: `${result.syncedCount}/${result.totalProcessed} işlem başarıyla senkronize edildi. ${
        result.failedCount > 0 ? `${result.failedCount} işlem başarısız.` : ""
      }`,
    })
  } finally {
    isSyncRunning = false
  }

  return result
}
