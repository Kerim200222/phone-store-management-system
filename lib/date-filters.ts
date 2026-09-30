/**
 * Faz 3 İleri Aşama: Tarih Aralığı ve Supabase gte/lte Sorgu Altyapısı
 * 
 * Bu yardımcı modül; Dashboard, Kasa Raporları ve Teknik Servis istatistiklerinde
 * Supabase `.gte('created_at', range.startDate)` ve `.lte('created_at', range.endDate)`
 * filtrelerinin standart, tutarlı ve saat diliminden bağımsız çalışmasını sağlar.
 */

export type DateFilterType = 'today' | 'this_week' | 'this_month'

export interface DateRangeResult {
  filter: DateFilterType
  startDate: string      // ISO 8601 UTC string: e.g. 2026-09-30T00:00:00.000Z
  endDate: string        // ISO 8601 UTC string: e.g. 2026-09-30T23:59:59.999Z
  label: string          // Kullanıcı dostu etiket
  displayRange: string   // Arayüzde gösterilecek tarih aralığı metni
}

export interface SupabaseDateQueryFilter {
  column: string
  gte: string
  lte: string
}

/**
 * Belirtilen filtre tipi için UTC başlangıç ve bitiş ISO zaman damgalarını üretir.
 *
 * @param filter 'today' | 'this_week' | 'this_month'
 * @param refDate Opsiyonel referans tarihi (testler ve geçmiş sorgular için varsayılan new Date())
 */
export function getDateRange(
  filter: DateFilterType, 
  refDate: Date = new Date()
): DateRangeResult {
  const current = new Date(refDate)

  let start: Date
  let end: Date
  let label: string
  let displayRange: string

  const pad = (n: number) => n.toString().padStart(2, '0')

  switch (filter) {
    case 'today': {
      label = 'Bugün'
      start = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 0, 0, 0, 0)
      end = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 23, 59, 59, 999)
      displayRange = `${pad(start.getDate())}.${pad(start.getMonth() + 1)}.${start.getFullYear()}`
      break
    }

    case 'this_week': {
      label = 'Bu Hafta'
      // Pazartesi'yi haftanın ilk günü kabul et
      const day = current.getDay()
      const diffToMonday = current.getDate() - day + (day === 0 ? -6 : 1)
      start = new Date(current.getFullYear(), current.getMonth(), diffToMonday, 0, 0, 0, 0)
      end = new Date(start)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)

      displayRange = `${pad(start.getDate())}.${pad(start.getMonth() + 1)} - ${pad(end.getDate())}.${pad(end.getMonth() + 1)}.${end.getFullYear()}`
      break
    }

    case 'this_month': {
      label = 'Bu Ay'
      start = new Date(current.getFullYear(), current.getMonth(), 1, 0, 0, 0, 0)
      // Ayın son günü (bir sonraki ayın 0. günü)
      end = new Date(current.getFullYear(), current.getMonth() + 1, 0, 23, 59, 59, 999)

      const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ]
      displayRange = `${monthNames[current.getMonth()]} ${current.getFullYear()}`
      break
    }
  }

  return {
    filter,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    label,
    displayRange,
  }
}

/**
 * Supabase istemcisi için `.gte()` ve `.lte()` parametrelerini içeren nesneyi üretir.
 */
export function buildSupabaseDateFilter(
  filter: DateFilterType,
  column: string = 'created_at',
  refDate?: Date
): SupabaseDateQueryFilter {
  const range = getDateRange(filter, refDate)
  return {
    column,
    gte: range.startDate,
    lte: range.endDate,
  }
}
