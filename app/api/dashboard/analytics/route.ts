import { NextRequest, NextResponse } from "next/server"
import { DateFilterType } from "@/lib/date-filters"
import { getCachedDashboardAnalytics } from "@/lib/cache-service"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 60 // Next.js 60 saniyelik Route Handler önbellekleme kuralı

/**
 * ==============================================================================
 * GÜN 26 & TADİLAT FAZ 1 (ADIM 2): DASHBOARD ANALYTICS API ROUTE
 * ==============================================================================
 * Çift katmanlı kimlik doğrulama (Supabase Auth SSR + phonestore_session Demo Cookie)
 * ve Next.js Data Cache (unstable_cache) + HTTP Stale-While-Revalidate stratejisi.
 * GET /api/dashboard/analytics?period=today | this_week | this_month
 * ==============================================================================
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Çift Katmanlı Güvenlik ve Oturum Doğrulaması (Dual-Layer Auth)
    let isAuthenticated = false

    // 1.A: Supabase SSR Oturumunu Doğrula
    try {
      const supabase = createClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (user && !authError) {
        isAuthenticated = true
      }
    } catch {
      // Supabase sunucu istemcisi hata verirse demo çerezine güvenle geç
      isAuthenticated = false
    }

    // 1.B: Supabase oturumu yoksa veya başarısız olduysa 'phonestore_session' demo çerezini kontrol et
    if (!isAuthenticated) {
      const sessionCookie = request.cookies.get("phonestore_session")?.value
      if (sessionCookie) {
        try {
          const demoSession = JSON.parse(decodeURIComponent(sessionCookie))
          if (demoSession && (demoSession.email || demoSession.role)) {
            isAuthenticated = true
          }
        } catch {
          isAuthenticated = false
        }
      }
    }

    // Her iki yöntemle de geçerli oturum bulunamazsa 401 dön
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Yetkisiz Erişim: Bu analitik verilere erişmek için oturum açmalısınız.",
        },
        { status: 401 }
      )
    }

    // 2. Parametre Ayrıştırma ve Doğrulama
    const { searchParams } = new URL(request.url)
    const periodParam = searchParams.get("period") as DateFilterType | null

    const validPeriods: DateFilterType[] = ["today", "this_week", "this_month"]
    const period: DateFilterType =
      periodParam && validPeriods.includes(periodParam) ? periodParam : "this_week"

    // 3. Next.js Data Cache (unstable_cache) üzerinden 60sn önbelleklenmiş veri
    const result = await getCachedDashboardAnalytics(period)

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        source: result.source,
      },
      {
        headers: {
          // İstemci ve ara sunucular için HTTP Stale-While-Revalidate (60s fresh, 120s revalidate)
          "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
        },
      }
    )
  } catch (error) {
    console.error("Dashboard Analytics API Hatası:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Analitik verileri hesaplanırken sunucu hatası oluştu.",
      },
      { status: 500 }
    )
  }
}
