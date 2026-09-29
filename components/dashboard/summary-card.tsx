import React from "react"
import Link from "next/link"
import { LucideIcon, ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export type SummaryCardColorScheme = "emerald" | "amber" | "rose" | "cyan" | "purple"

export interface SummaryCardProps {
  title: string
  value: string
  subtitle: string
  icon: LucideIcon
  colorScheme?: SummaryCardColorScheme
  trend?: {
    value: string
    isPositive: boolean
    label?: string
  }
  badge?: string
  href?: string
  alert?: boolean
}

const colorStyles: Record<
  SummaryCardColorScheme,
  {
    iconBg: string
    iconColor: string
    badgeClass: string
    accentBorder: string
    glowClass: string
    valueColor: string
  }
> = {
  emerald: {
    iconBg: "bg-emerald-500/15 border-emerald-500/30",
    iconColor: "text-emerald-400",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    accentBorder: "hover:border-emerald-500/40",
    glowClass: "group-hover:shadow-emerald-500/10",
    valueColor: "text-emerald-400",
  },
  cyan: {
    iconBg: "bg-cyan-500/15 border-cyan-500/30",
    iconColor: "text-cyan-400",
    badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    accentBorder: "hover:border-cyan-500/40",
    glowClass: "group-hover:shadow-cyan-500/10",
    valueColor: "text-cyan-300",
  },
  amber: {
    iconBg: "bg-amber-500/15 border-amber-500/30",
    iconColor: "text-amber-400",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    accentBorder: "hover:border-amber-500/40",
    glowClass: "group-hover:shadow-amber-500/10",
    valueColor: "text-amber-400",
  },
  rose: {
    iconBg: "bg-rose-500/15 border-rose-500/30",
    iconColor: "text-rose-400",
    badgeClass: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    accentBorder: "hover:border-rose-500/40",
    glowClass: "group-hover:shadow-rose-500/10",
    valueColor: "text-rose-400",
  },
  purple: {
    iconBg: "bg-purple-500/15 border-purple-500/30",
    iconColor: "text-purple-400",
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    accentBorder: "hover:border-purple-500/40",
    glowClass: "group-hover:shadow-purple-500/10",
    valueColor: "text-purple-300",
  },
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = "cyan",
  trend,
  badge,
  href,
  alert = false,
}: SummaryCardProps) {
  const styles = colorStyles[colorScheme]

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    if (href) {
      return (
        <Link href={href} className="block group">
          {children}
        </Link>
      )
    }
    return <div className="group">{children}</div>
  }

  return (
    <CardWrapper>
      <Card
        className={`bg-slate-900/70 border-slate-800/80 backdrop-blur-xl transition-all duration-300 ${styles.accentBorder} ${styles.glowClass} hover:shadow-xl hover:-translate-y-0.5 relative overflow-hidden`}
      >
        {/* Subtle Ambient Background Gradient */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-15 pointer-events-none ${
            colorScheme === "emerald"
              ? "bg-emerald-500"
              : colorScheme === "amber"
              ? "bg-amber-500"
              : colorScheme === "rose"
              ? "bg-rose-500"
              : colorScheme === "purple"
              ? "bg-purple-500"
              : "bg-cyan-500"
          }`}
        />

        <CardContent className="p-5 space-y-4">
          {/* Card Top: Title, Icon, Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                {title}
                {alert && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                )}
              </span>
              <div className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono ${styles.valueColor}`}>
                {value}
              </div>
            </div>

            {/* Icon Container */}
            <div
              className={`p-2.5 rounded-xl border ${styles.iconBg} ${styles.iconColor} shadow-inner transition-transform group-hover:scale-110 duration-200`}
            >
              <Icon className="w-5 h-5" />
            </div>
          </div>

          {/* Card Bottom: Subtitle, Trend, Link Arrow */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-400 text-[11px] truncate">
              {trend && (
                <span
                  className={`inline-flex items-center gap-0.5 font-semibold font-mono ${
                    trend.isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {trend.isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {trend.value}
                </span>
              )}
              <span className="truncate">{subtitle}</span>
            </div>

            {badge ? (
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${styles.badgeClass}`}>
                {badge}
              </Badge>
            ) : href ? (
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </CardWrapper>
  )
}
