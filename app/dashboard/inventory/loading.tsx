import { Skeleton } from "@/components/ui/skeleton"

export default function InventoryLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Üst Başlık ve Aksiyonlar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-2">
          <Skeleton className="h-7 w-60 bg-slate-800" />
          <Skeleton className="h-4 w-80 bg-slate-800/60" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 bg-slate-800 rounded-lg" />
          <Skeleton className="h-9 w-36 bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={`inv-skel-${i}`} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <Skeleton className="h-4 w-28 bg-slate-800" />
            <Skeleton className="h-7 w-24 bg-slate-800" />
            <Skeleton className="h-3 w-40 bg-slate-800/60" />
          </div>
        ))}
      </div>

      {/* Arama ve Filtre Çubuğu */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <Skeleton className="h-10 w-full rounded-lg bg-slate-800" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20 rounded-md bg-slate-800" />
          <Skeleton className="h-7 w-24 rounded-md bg-slate-800" />
          <Skeleton className="h-7 w-28 rounded-md bg-slate-800" />
        </div>
      </div>

      {/* Tablo İskeleti */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`row-skel-${i}`} className="flex items-center justify-between py-2 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg bg-slate-800" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-44 bg-slate-800" />
                <Skeleton className="h-3 w-28 bg-slate-800/60" />
              </div>
            </div>
            <Skeleton className="h-5 w-24 bg-slate-800" />
            <Skeleton className="h-5 w-20 bg-slate-800" />
            <Skeleton className="h-7 w-16 rounded-md bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
