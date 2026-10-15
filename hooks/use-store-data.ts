"use client"

import { useEffect } from "react"
import useSWR from "swr"
import { StoreEngine, emitGlobalSync, SYNC_EVENTS, SyncEventType } from "@/lib/store-engine"
import { POSProduct, POSCustomerSelect } from "@/types/pos"
import { TransactionItemRow } from "@/app/dashboard/transactions/page"
import { ServiceTicketDisplay, KanbanColumnId } from "@/types/service"

/**
 * ==============================================================================
 * REAL-TIME GLOBAL SWR HOOKS (ENTERPRISE CACHE SYNCHRONIZATION)
 * ==============================================================================
 * Sayfalar arası izole state sorununu kökten çözer.
 * Tüm sayfalar bu hook'lar üzerinden aynı merkezi depoyu (Single Source of Truth) dinler.
 * Bir sayfada işlem yapıldığında, diğer tüm açık sayfalarda (Stok, POS, Kasa, Servis)
 * önbellek 0 milisaniyede güncellenir.
 * ==============================================================================
 */

/**
 * Global Senkronizasyon Olaylarını Dinleyen Dinamik Efekt
 */
function useGlobalSyncListener(onSync: (type: SyncEventType, payload?: unknown) => void) {
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleCustomSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: SyncEventType; payload?: unknown }>
      if (customEvent.detail) {
        onSync(customEvent.detail.type, customEvent.detail.payload)
      }
    }

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === "phonestore_last_sync" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          onSync(parsed.type)
        } catch {}
      }
    }

    window.addEventListener("phonestore:sync", handleCustomSync)
    window.addEventListener("storage", handleStorageSync)

    return () => {
      window.removeEventListener("phonestore:sync", handleCustomSync)
      window.removeEventListener("storage", handleStorageSync)
    }
  }, [onSync])
}

/**
 * 1. Canlı ve Senkronize Ürün Listesi Hook'u (POS, Envanter, Vitrin)
 */
export function useSyncedProducts() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<POSProduct[]>(
    "store:products",
    () => StoreEngine.getProducts(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      fallbackData: [],
    }
  )

  useGlobalSyncListener((type) => {
    if (
      type === SYNC_EVENTS.POS_SALE ||
      type === SYNC_EVENTS.PURCHASE_DEVICE ||
      type === SYNC_EVENTS.INVENTORY_CHANGE
    ) {
      mutate()
    }
  })

  return {
    products: data || [],
    isLoading,
    isValidating,
    isError: Boolean(error),
    mutate,
    deductStock: (productId: string, quantity: number) => StoreEngine.deductStock(productId, quantity),
    addProduct: (product: POSProduct) => StoreEngine.addProduct(product),
  }
}

/**
 * 2. Canlı ve Senkronize Kasa Hareketleri Hook'u (Transactions)
 */
export function useSyncedTransactions() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<TransactionItemRow[]>(
    "store:transactions",
    () => StoreEngine.getTransactions(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      fallbackData: [],
    }
  )

  useGlobalSyncListener((type) => {
    if (
      type === SYNC_EVENTS.POS_SALE ||
      type === SYNC_EVENTS.PURCHASE_DEVICE ||
      type === SYNC_EVENTS.SERVICE_DELIVERY
    ) {
      mutate()
    }
  })

  return {
    transactions: data || [],
    isLoading,
    isValidating,
    isError: Boolean(error),
    mutate,
    recordTransaction: (trx: TransactionItemRow) => StoreEngine.recordTransaction(trx),
  }
}

/**
 * 3. Canlı ve Senkronize Müşteri Listesi Hook'u (POS, Customers, Purchases)
 */
export function useSyncedCustomers() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<POSCustomerSelect[]>(
    "store:customers",
    () => StoreEngine.getCustomers(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      fallbackData: [],
    }
  )

  useGlobalSyncListener((type) => {
    if (type === SYNC_EVENTS.CUSTOMER_CHANGE || type === SYNC_EVENTS.POS_SALE) {
      mutate()
    }
  })

  return {
    customers: data || [],
    isLoading,
    isValidating,
    isError: Boolean(error),
    mutate,
    adjustBalance: (customerId: string, delta: number) => StoreEngine.adjustCustomerBalance(customerId, delta),
  }
}

/**
 * 4. Canlı ve Senkronize Teknik Servis Biletleri Hook'u (Service Kanban, History)
 */
export function useSyncedServiceTickets() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<ServiceTicketDisplay[]>(
    "store:tickets",
    () => StoreEngine.getServiceTickets(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
      fallbackData: [],
    }
  )

  useGlobalSyncListener((type) => {
    if (
      type === SYNC_EVENTS.SERVICE_TICKET_CHANGE ||
      type === SYNC_EVENTS.SERVICE_DELIVERY ||
      type === SYNC_EVENTS.STORE_RESET
    ) {
      mutate()
    }
  })

  return {
    tickets: data || [],
    isLoading,
    isValidating,
    isError: Boolean(error),
    mutate,
    updateTicketStatus: async (ticketId: string, status: KanbanColumnId | "teslim_edildi" | "iptal") => {
      await StoreEngine.updateServiceTicketStatus(ticketId, status)
      await mutate()
    },
    addTicket: async (ticket: ServiceTicketDisplay) => {
      const created = await StoreEngine.addServiceTicket(ticket)
      await mutate()
      return created
    },
    updateTicket: async (ticketId: string, updates: Partial<ServiceTicketDisplay>) => {
      await StoreEngine.updateServiceTicket(ticketId, updates)
      await mutate()
    },
  }
}

export { emitGlobalSync, SYNC_EVENTS }
