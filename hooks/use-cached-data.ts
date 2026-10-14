"use client"

import useSWR from "swr"
import { DateFilterType } from "@/lib/date-filters"
import { DashboardAnalyticsResponse } from "@/types/dashboard-analytics"
import { GlobalSearchResponse } from "@/types/global-search"

/**
 * ==============================================================================
 * CLIENT-SIDE SWR CACHING HOOKS (STALE-WHILE-REVALIDATE)
 * ==============================================================================
 * İstemci tarafında anlık sayfa geçişleri (Instant UX) ve arka planda
 * sessiz veri güncellemesi sağlamak için SWR önbellekleme mekanizması sunar.
 * ==============================================================================
 */

const jsonFetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Ağ isteği başarısız oldu: ${res.statusText}`)
  }
  return res.json()
}

/**
 * Dashboard Analitik Verisi İçin SWR Kancası
 */
export function useCachedAnalytics(period: DateFilterType) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<{
    success: boolean
    data: DashboardAnalyticsResponse
    source: string
  }>(`/api/dashboard/analytics?period=${period}`, jsonFetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000, // 30 saniye boyunca yinelenen istekleri engelle
    keepPreviousData: true,  // Periyot değişiminde önceki veriyi ekranda tut (Sıfır Layout Shift)
  })

  return {
    analytics: data?.data ?? null,
    source: data?.source ?? "cache",
    isLoading,
    isValidating,
    isError: Boolean(error),
    error,
    refresh: mutate,
  }
}

/**
 * Global Arama İçin SWR Kancası
 */
export function useCachedSearch(query: string) {
  const trimmed = query.trim()
  const shouldFetch = trimmed.length >= 2

  const { data, error, isLoading, mutate } = useSWR<GlobalSearchResponse>(
    shouldFetch ? `/api/search?q=${encodeURIComponent(trimmed)}` : null,
    jsonFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 dakika boyunca aynı sorguyu önbellekten ver
      keepPreviousData: true,
    }
  )

  return {
    results: data?.results ?? null,
    totalCount: data?.totalCount ?? 0,
    isLoading: shouldFetch && isLoading,
    isError: Boolean(error),
    mutate,
  }
}
