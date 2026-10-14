import { useState, useEffect } from "react"

/**
 * useDebounce hook'u
 * Hızlı klavye girdilerinde her tuş basımında API çağrısı yapılmasını
 * engellemek amacıyla değeri belirtilen gecikme (varsayılan: 300ms) kadar öteler.
 *
 * @param value İzlenecek değer
 * @param delay Gecikme süresi (milisaniye, varsayılan: 300ms)
 * @returns Debounce edilmiş güncel değer
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
