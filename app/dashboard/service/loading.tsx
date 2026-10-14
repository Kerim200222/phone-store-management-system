import { Skeleton } from "@/components/ui/skeleton"

export default function ServiceLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 bg-slate-800" />
          <Skeleton className="h-4 w-80 bg-slate-800/60" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 bg-slate-800 rounded-lg" />
          <Skeleton className="h-9 w-32 bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* Kanban Sütun İskeletleri */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, col) => (
          <div key={`col-skel-${col}`} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <Skeleton className="h-4 w-24 bg-slate-800" />
              <Skeleton className="h-4 w-6 rounded-full bg-slate-800" />
            </div>
            {Array.from({ length: 3 }).map((_, card) => (
              <div key={`card-skel-${col}-${card}`} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/60 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-slate-800" />
                <Skeleton className="h-3 w-1/2 bg-slate-800/60" />
                <div className="flex justify-between items-center pt-1">
                  <Skeleton className="h-5 w-16 bg-slate-800 rounded" />
                  <Skeleton className="h-5 w-14 bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
