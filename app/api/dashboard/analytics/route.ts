import { NextRequest, NextResponse } from "next/server"
import { DateFilterType } from "@/lib/date-filters"
import { getDashboardAnalytics } from "@/lib/dashboard-analytics-service"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

/**
 * ==============================================================================
 * GÜN 26 & TADİLAT: DASHBOARD ANALYTICS API ROUTE (AUTH PROTECTED)
 * ==============================================================================
 * GET /api/dashboard/analytics?period=today | this_week | this_month
 * ==============================================================================
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Sunucu Tarafı Güvenlik ve Oturum Doğrulaması
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Yetkisiz Erişim: Bu veriye erişmek için oturum açmalısınız.",
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const periodParam = searchParams.get("period") as DateFilterType | null

    const validPeriods: DateFilterType[] = ["today", "this_week", "this_month"]
    const period: DateFilterType =
      periodParam && validPeriods.includes(periodParam) ? periodParam : "this_week"

    const result = await getDashboardAnalytics(period)

    return NextResponse.json({
      success: true,
      data: result.data,
      source: result.source,
    })
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
