import { Skeleton } from "@/components/ui/skeleton"

export default function POSLoading() {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Üst Başlık ve İstatistikler */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg bg-slate-800" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48 bg-slate-800" />
            <Skeleton className="h-3.5 w-64 bg-slate-800/60" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 bg-slate-800 rounded-lg" />
          <Skeleton className="h-8 w-28 bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* POS Ana Izgara Düzeni */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Sol Katalog Alanı */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <Skeleton className="h-9 w-full rounded-lg bg-slate-800" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-md bg-slate-800" />
              <Skeleton className="h-7 w-20 rounded-md bg-slate-800" />
              <Skeleton className="h-7 w-20 rounded-md bg-slate-800" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`pos-card-${i}`} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                <Skeleton className="h-28 w-full rounded-lg bg-slate-800" />
                <Skeleton className="h-4 w-3/4 bg-slate-800" />
                <Skeleton className="h-3 w-1/2 bg-slate-800/60" />
                <Skeleton className="h-6 w-20 bg-slate-800" />
              </div>
            ))}
          </div>
        </div>

        {/* Sağ Sepet Alanı */}
        <div className="lg:col-span-5 xl:col-span-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <Skeleton className="h-6 w-36 bg-slate-800" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg bg-slate-800/60" />
            <Skeleton className="h-16 w-full rounded-lg bg-slate-800/60" />
          </div>
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <Skeleton className="h-5 w-full bg-slate-800" />
            <Skeleton className="h-10 w-full rounded-xl bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  )
}
