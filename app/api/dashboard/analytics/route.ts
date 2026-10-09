import { NextRequest, NextResponse } from "next/server"
import { DateFilterType } from "@/lib/date-filters"
import { getDashboardAnalytics } from "@/lib/dashboard-analytics-service"

export const dynamic = "force-dynamic"

/**
 * ==============================================================================
 * GÜN 26: DASHBOARD ANALYTICS API ROUTE
 * ==============================================================================
 * GET /api/dashboard/analytics?period=today | this_week | this_month
 * ==============================================================================
 */
export async function GET(request: NextRequest) {
  try {
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
