import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/70", className)}
      {...props}
    />
  )
}

/**
 * Tablo satırları için yeniden kullanılabilir Skeleton yükleyici
 */
function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      {/* Tablo Başlık Skeleton */}
      <div className="flex gap-4 border-b border-slate-800/80 pb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 bg-slate-800" />
        ))}
      </div>
      {/* Satırlar */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 py-2">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton
              key={c}
              className={cn(
                "h-6 flex-1 bg-slate-800/60",
                c === 0 && "w-1/3 flex-none",
                c === columns - 1 && "w-20 flex-none"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Kart / Metrik Blokları için Skeleton yükleyici
 */
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 bg-slate-800" />
        <Skeleton className="h-8 w-8 rounded-lg bg-slate-800" />
      </div>
      <Skeleton className="h-8 w-36 bg-slate-800" />
      <Skeleton className="h-3 w-48 bg-slate-800/60" />
    </div>
  )
}

export { Skeleton, TableSkeleton, CardSkeleton }
