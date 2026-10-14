import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Üst Karşılama ve Filtre İskeleti */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 bg-slate-800" />
          <Skeleton className="h-4 w-72 bg-slate-800/60" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 bg-slate-800 rounded-lg" />
          <Skeleton className="h-9 w-32 bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* 4'lü KPI Kart İskeletleri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`kpi-skel-${i}`} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 bg-slate-800" />
              <Skeleton className="w-8 h-8 rounded-lg bg-slate-800/80" />
            </div>
            <Skeleton className="h-8 w-36 bg-slate-800" />
            <Skeleton className="h-3 w-44 bg-slate-800/60" />
          </div>
        ))}
      </div>

      {/* 2'li Grafik Alanı İskeletleri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <Skeleton className="h-5 w-44 bg-slate-800" />
          <Skeleton className="h-[280px] w-full rounded-lg bg-slate-800/40" />
        </div>
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <Skeleton className="h-5 w-48 bg-slate-800" />
          <Skeleton className="h-[280px] w-full rounded-lg bg-slate-800/40" />
        </div>
      </div>
    </div>
  )
}
