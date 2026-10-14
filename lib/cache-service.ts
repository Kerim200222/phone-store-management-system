import { unstable_cache } from "next/cache"
import { getDashboardAnalytics } from "@/lib/dashboard-analytics-service"
import { DateFilterType } from "@/lib/date-filters"

/**
 * ==============================================================================
 * ENTERPRISE FULL-STACK DATA CACHING LAYER
 * ==============================================================================
 * Next.js Data Cache ve unstable_cache kullanarak sık sorgulanan,
 * hesaplama maliyeti yüksek finansal ve envanter verilerini sunucu önbelleğine alır.
 * ==============================================================================
 */

/**
 * Dashboard Analitik Verilerini Sunucu Tarafında Önbellekler (TTL: 60 Saniye)
 */
export const getCachedDashboardAnalytics = unstable_cache(
  async (period: DateFilterType) => {
    return await getDashboardAnalytics(period)
  },
  ["dashboard-analytics-cache"],
  {
    revalidate: 60, // 60 saniye boyunca önbellekten anında döner
    tags: ["dashboard-analytics"],
  }
)
