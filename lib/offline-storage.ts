import { CartItem, CartSummary, POSCustomerSelect, POSPaymentMethod } from "@/types/pos"

export interface OfflineQueuedTransaction {
  id: string
  transactionNumber: string
  createdAt: string
  items: CartItem[]
  summary: CartSummary
  customer: POSCustomerSelect | null
  paymentMethod: POSPaymentMethod
  notes: string
  status: "pending" | "synced" | "failed"
  errorMessage?: string
  retryCount: number
  syncedAt?: string
  backendTransactionId?: string
}

export interface SyncLogEntry {
  id: string
  timestamp: string
  totalProcessed: number
  syncedCount: number
  failedCount: number
  details: string
}

const DB_NAME = "phone_store_offline_pos_db"
const DB_VERSION = 1
const STORE_QUEUE = "offline_transactions_queue"
const STORE_LOGS = "sync_logs"

/**
 * IndexedDB veritabanı bağlantısını başlatır ve gerekli nesne depolarını (Object Store) oluşturur.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB bu ortamda desteklenmiyor."))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // 1. Çevrimdışı Satış Fişleri Kuyruğu Deposu
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const queueStore = db.createObjectStore(STORE_QUEUE, { keyPath: "id" })
        queueStore.createIndex("status", "status", { unique: false })
        queueStore.createIndex("createdAt", "createdAt", { unique: false })
      }

      // 2. Senkronizasyon Kayıtları Deposu
      if (!db.objectStoreNames.contains(STORE_LOGS)) {
        const logStore = db.createObjectStore(STORE_LOGS, { keyPath: "id" })
        logStore.createIndex("timestamp", "timestamp", { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Çevrimdışı satış fişini IndexedDB kuyruğuna kaydeder.
 */
export async function saveOfflineTransaction(
  payload: Omit<OfflineQueuedTransaction, "status" | "retryCount">
): Promise<OfflineQueuedTransaction> {
  const db = await openDB()
  const queuedItem: OfflineQueuedTransaction = {
    ...payload,
    status: "pending",
    retryCount: 0,
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, "readwrite")
    const store = tx.objectStore(STORE_QUEUE)
    const request = store.put(queuedItem)

    request.onsuccess = () => resolve(queuedItem)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Kuyrukta bekleyen (pending veya failed) çevrimdışı satışları döndürür.
 */
export async function getPendingOfflineTransactions(): Promise<OfflineQueuedTransaction[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, "readonly")
    const store = tx.objectStore(STORE_QUEUE)
    const request = store.getAll()

    request.onsuccess = () => {
      const all: OfflineQueuedTransaction[] = request.result || []
      const pending = all.filter((item) => item.status === "pending" || item.status === "failed")
      resolve(pending)
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Kuyruktaki toplam bekleyen işlem sayısını döndürür.
 */
export async function getPendingOfflineCount(): Promise<number> {
  try {
    const pending = await getPendingOfflineTransactions()
    return pending.length
  } catch {
    return 0
  }
}

/**
 * Kuyruktaki tüm kayıtları listeler.
 */
export async function getAllOfflineTransactions(): Promise<OfflineQueuedTransaction[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, "readonly")
    const store = tx.objectStore(STORE_QUEUE)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

/**
 * Bir satışı başarıyla senkronize edildi olarak işaretler.
 */
export async function markTransactionSynced(
  id: string,
  backendTxId?: string
): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, "readwrite")
    const store = tx.objectStore(STORE_QUEUE)
    const getReq = store.get(id)

    getReq.onsuccess = () => {
      const item: OfflineQueuedTransaction | undefined = getReq.result
      if (item) {
        item.status = "synced"
        item.syncedAt = new Date().toISOString()
        item.backendTransactionId = backendTxId
        item.errorMessage = undefined
        store.put(item)
      }
      resolve()
    }
    getReq.onerror = () => reject(getReq.error)
  })
}

/**
 * Senkronizasyon başarısız olduğunda hata mesajını ve deneme sayısını günceller.
 */
export async function markTransactionFailed(
  id: string,
  errorMessage: string
): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, "readwrite")
    const store = tx.objectStore(STORE_QUEUE)
    const getReq = store.get(id)

    getReq.onsuccess = () => {
      const item: OfflineQueuedTransaction | undefined = getReq.result
      if (item) {
        item.status = "failed"
        item.errorMessage = errorMessage
        item.retryCount = (item.retryCount || 0) + 1
        store.put(item)
      }
      resolve()
    }
    getReq.onerror = () => reject(getReq.error)
  })
}

/**
 * Başarıyla senkronize edilmiş kayıtları kuyruktan temizler.
 */
export async function clearSyncedTransactions(): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_QUEUE, "readwrite")
    const store = tx.objectStore(STORE_QUEUE)
    const request = store.getAll()

    request.onsuccess = () => {
      const all: OfflineQueuedTransaction[] = request.result || []
      all.forEach((item) => {
        if (item.status === "synced") {
          store.delete(item.id)
        }
      })
      resolve()
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Senkronizasyon aşama günlüğünü (Sync Log) kaydeder.
 */
export async function saveSyncLog(
  log: Omit<SyncLogEntry, "id" | "timestamp">
): Promise<void> {
  try {
    const db = await openDB()
    const entry: SyncLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...log,
    }

    const tx = db.transaction(STORE_LOGS, "readwrite")
    tx.objectStore(STORE_LOGS).put(entry)
  } catch (err) {
    console.warn("Senkronizasyon günlüğü kaydedilemedi:", err)
  }
}

/**
 * Geçmiş senkronizasyon loglarını döndürür.
 */
export async function getSyncLogs(): Promise<SyncLogEntry[]> {
  try {
    const db = await openDB()

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_LOGS, "readonly")
      const request = tx.objectStore(STORE_LOGS).getAll()

      request.onsuccess = () => {
        const logs: SyncLogEntry[] = request.result || []
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        resolve(logs.slice(0, 50))
      }
      request.onerror = () => resolve([])
    })
  } catch {
    return []
  }
}
