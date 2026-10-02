"use client"

import React, { useState } from "react"
import Image, { ImageProps } from "next/image"
import { ImageIcon } from "lucide-react"

// Shimmer SVG effect converted to base64 for smooth progressive blur loading
const shimmerSvg = (w = 400, h = 300) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#0f172a" offset="20%" />
      <stop stop-color="#1e293b" offset="50%" />
      <stop stop-color="#0f172a" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#0f172a" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite" />
</svg>`

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str)

export const DEFAULT_BLUR_DATA_URL = `data:image/svg+xml;base64,${toBase64(shimmerSvg())}`

export interface CustomImageProps extends Omit<ImageProps, "src"> {
  src?: string | null
  fallbackSrc?: string
  fallbackIcon?: React.ReactNode
  containerClassName?: string
  showSkeleton?: boolean
}

export function CustomImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  fallbackSrc,
  fallbackIcon,
  fill,
  width,
  height,
  priority = false,
  sizes,
  unoptimized,
  placeholder,
  blurDataURL,
  showSkeleton = true,
  onLoad,
  onError,
  ...restProps
}: CustomImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Kaynak yoksa veya boşsa doğrudan fallback göster
  const isSourceMissing = !src || (typeof src === "string" && src.trim() === "")

  // blob: veya data: URL'leri Next.js optimizasyon sunucusundan geçemediği için otomatik unoptimized yapılır
  const isLocalBlobOrData = typeof src === "string" && (src.startsWith("blob:") || src.startsWith("data:"))
  const shouldBeUnoptimized = unoptimized !== undefined ? unoptimized : isLocalBlobOrData

  if (isSourceMissing || hasError) {
    if (fallbackSrc) {
      return (
        <div className={`relative overflow-hidden ${fill ? "w-full h-full" : ""} ${containerClassName}`}>
          <Image
            src={fallbackSrc}
            alt={alt || "Varsayılan Görsel"}
            fill={fill}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            className={className}
            priority={priority}
            sizes={sizes}
            unoptimized={shouldBeUnoptimized}
            {...restProps}
          />
        </div>
      )
    }

    return (
      <div
        className={`flex items-center justify-center bg-slate-900/60 text-slate-500 rounded-lg select-none ${
          fill ? "w-full h-full" : ""
        } ${containerClassName}`}
        style={!fill && width && height ? { width, height } : undefined}
      >
        {fallbackIcon || <ImageIcon className="w-5 h-5 text-slate-600 stroke-[1.5]" />}
      </div>
    )
  }

  // Geçerli kaynak var
  const effectiveSrc = src as string

  return (
    <div
      className={`relative overflow-hidden ${fill ? "w-full h-full" : "inline-block"} ${containerClassName}`}
      style={!fill && width && height ? { width, height } : undefined}
    >
      {/* İskelet (Skeleton Shimmer) Yükleme Animasyonu */}
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 z-10 bg-slate-900 animate-pulse flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-shimmer" />
        </div>
      )}

      <Image
        src={effectiveSrc}
        alt={alt || "Ürün Görseli"}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`transition-all duration-300 ${isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"} ${className}`}
        priority={priority}
        sizes={sizes || (fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined)}
        unoptimized={shouldBeUnoptimized}
        placeholder={placeholder || (!isLocalBlobOrData ? "blur" : "empty")}
        blurDataURL={blurDataURL || DEFAULT_BLUR_DATA_URL}
        onLoad={(e) => {
          setIsLoading(false)
          if (onLoad) onLoad(e)
        }}
        onError={(e) => {
          setIsLoading(false)
          setHasError(true)
          if (onError) onError(e)
        }}
        {...restProps}
      />
    </div>
  )
}
