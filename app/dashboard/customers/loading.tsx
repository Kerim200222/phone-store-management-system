import { Skeleton } from "@/components/ui/skeleton"

export default function CustomersLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-2">
          <Skeleton className="h-7 w-60 bg-slate-800" />
          <Skeleton className="h-4 w-72 bg-slate-800/60" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-36 bg-slate-800 rounded-lg" />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <Skeleton className="h-10 w-full rounded-lg bg-slate-800" />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`cust-skel-${i}`} className="flex items-center justify-between py-2 border-b border-slate-800/50">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44 bg-slate-800" />
              <Skeleton className="h-3 w-28 bg-slate-800/60" />
            </div>
            <Skeleton className="h-4 w-32 bg-slate-800" />
            <Skeleton className="h-4 w-24 bg-slate-800" />
            <Skeleton className="h-7 w-16 rounded-md bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
