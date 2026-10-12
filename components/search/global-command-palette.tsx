"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Wrench,
  Smartphone,
  Users,
  Compass,
  ArrowRight,
  Loader2,
  Package,
  Receipt,
  Settings,
  Sparkles,
  QrCode,
  ShieldCheck,
} from "lucide-react"

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GlobalSearchResponse,
  ServiceTicketSearchResult,
  ProductSearchResult,
  CustomerSearchResult,
  NavigationSearchResult,
} from "@/types/global-search"

interface GlobalCommandPaletteProps {
  /** Harici tetikleme için isteğe bağlı buton sınıfı */
  triggerClassName?: string
}

export function GlobalCommandPalette({ triggerClassName }: GlobalCommandPaletteProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<GlobalSearchResponse["results"]>({
    tickets: [],
    products: [],
    customers: [],
    navigation: [],
  })

  const router = useRouter()

  // 1. Klavye Kısayolu Dinleyicisi (CMD+K & CTRL+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // 2. Debounced Arama İstekleri
  React.useEffect(() => {
    let active = true

    const fetchResults = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (!res.ok) throw new Error("Arama başarısız")
        const data: GlobalSearchResponse = await res.json()
        if (active) {
          setResults(data.results)
        }
      } catch (err) {
        console.warn("Global arama hatası:", err)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    const timer = setTimeout(() => {
      fetchResults()
    }, 180)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query])

  // 3. Yönlendirme ve Modalı Kapatma
  const handleSelect = (url: string) => {
    setOpen(false)
    setQuery("")
    router.push(url)
  }

  const hasAnyResults =
    results.tickets.length > 0 ||
    results.products.length > 0 ||
    results.customers.length > 0 ||
    results.navigation.length > 0

  return (
    <>
      {/* Header Arama Tetikleyici Butonu */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={`relative h-9 w-full sm:w-64 md:w-80 justify-between rounded-lg border-slate-800 bg-slate-900/60 px-3 text-xs text-slate-400 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white transition-all shadow-inner ${
          triggerClassName || ""
        }`}
        aria-label="Global Arama (Ctrl+K)"
      >
        <span className="flex items-center gap-2 truncate">
          <Search className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">İsim, IMEI, Bilet No ara...</span>
        </span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-700 bg-slate-800/90 px-1.5 font-mono text-[10px] font-medium text-slate-300 shadow-sm">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Command Dialog (Shadcn Command Palette) */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="relative border-b border-slate-800/80">
          <CommandInput
            placeholder="İsim, IMEI, Bilet ID veya sayfa ara..."
            value={query}
            onValueChange={setQuery}
            className="text-sm placeholder:text-slate-500 text-white"
          />
          {loading && (
            <div className="absolute right-4 top-3.5 flex items-center gap-1.5 text-xs text-cyan-400">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>

        <CommandList className="max-h-[380px] p-2">
          {!loading && !hasAnyResults && (
            <CommandEmpty className="py-10 text-center text-sm text-slate-400">
              <div className="flex flex-col items-center justify-center gap-2">
                <Search className="h-8 w-8 text-slate-600 mb-1" />
                <p className="font-semibold text-slate-300">
                  &quot;{query}&quot; için sonuç bulunamadı
                </p>
                <p className="text-xs text-slate-500 max-w-xs">
                  Farklı bir müşteri adı, 15 haneli IMEI, bilet numarası veya ürün adı deneyebilirsiniz.
                </p>
              </div>
            </CommandEmpty>
          )}

          {/* 1. TEKNİK SERVİS BİLETLERİ */}
          {results.tickets.length > 0 && (
            <CommandGroup heading="Teknik Servis Biletleri">
              {results.tickets.map((ticket) => (
                <CommandItem
                  key={ticket.id}
                  onSelect={() => handleSelect(ticket.url)}
                  className="flex items-center justify-between gap-3 group py-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white group-hover:text-indigo-300 truncate">
                        {ticket.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {ticket.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        ticket.status === "Tamamlandı"
                          ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
                          : ticket.status === "Onarımda"
                          ? "border-blue-500/30 text-blue-300 bg-blue-500/10"
                          : "border-amber-500/30 text-amber-300 bg-amber-500/10"
                      }`}
                    >
                      {ticket.status}
                    </Badge>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* 2. ÜRÜNLER & CİHAZLAR */}
          {results.products.length > 0 && (
            <>
              {results.tickets.length > 0 && <CommandSeparator className="my-1.5" />}
              <CommandGroup heading="Ürünler & Cihazlar">
                {results.products.map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => handleSelect(product.url)}
                    className="flex items-center justify-between gap-3 group py-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                        <Smartphone className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white group-hover:text-cyan-300 truncate">
                          {product.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {product.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${
                          product.stockQuantity <= 0
                            ? "border-rose-500/30 text-rose-300 bg-rose-500/10"
                            : product.stockQuantity < 5
                            ? "border-amber-500/30 text-amber-300 bg-amber-500/10"
                            : "border-slate-700 text-slate-300 bg-slate-800"
                        }`}
                      >
                        {product.badge || `Stok: ${product.stockQuantity}`}
                      </Badge>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* 3. MÜŞTERİLER */}
          {results.customers.length > 0 && (
            <>
              {(results.tickets.length > 0 || results.products.length > 0) && (
                <CommandSeparator className="my-1.5" />
              )}
              <CommandGroup heading="Müşteriler">
                {results.customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    onSelect={() => handleSelect(customer.url)}
                    className="flex items-center justify-between gap-3 group py-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300 truncate">
                          {customer.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {customer.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className="border-purple-500/30 text-purple-300 bg-purple-500/10 text-[10px] px-1.5 py-0"
                      >
                        Müşteri
                      </Badge>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* 4. HIZLI GEZİNME & KISAYOLLAR */}
          {results.navigation.length > 0 && (
            <>
              {(results.tickets.length > 0 ||
                results.products.length > 0 ||
                results.customers.length > 0) && (
                <CommandSeparator className="my-1.5" />
              )}
              <CommandGroup heading="Hızlı Gezinme & Sayfalar">
                {results.navigation.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item.url)}
                    className="flex items-center justify-between gap-3 group py-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        <Compass className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white group-hover:text-emerald-300 truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <Badge
                          variant="outline"
                          className="border-slate-700 text-slate-300 bg-slate-800 text-[10px] px-1.5 py-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                      <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>

        {/* Modal Alt Bilgi Çubuğu */}
        <div className="flex items-center justify-between border-t border-slate-800/80 px-4 py-2.5 bg-slate-950/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono">
              <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-300 border border-slate-700">↑↓</kbd>
              <span>Gezin</span>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-300 border border-slate-700">↵</kbd>
              <span>Aç</span>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-300 border border-slate-700">ESC</kbd>
              <span>Kapat</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-cyan-400/80">
            <Sparkles className="h-3 w-3" />
            <span>Telefon Mağazası Global Arama</span>
          </div>
        </div>
      </CommandDialog>
    </>
  )
}
