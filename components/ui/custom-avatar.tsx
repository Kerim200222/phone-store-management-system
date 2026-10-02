"use client"

import React, { useState } from "react"
import { User } from "lucide-react"
import { CustomImage } from "@/components/ui/custom-image"

export interface CustomAvatarProps {
  src?: string | null
  name?: string | null
  size?: number
  className?: string
  priority?: boolean
  showBadge?: boolean
  badgeColor?: "emerald" | "amber" | "rose" | "cyan"
}

export function CustomAvatar({
  src,
  name = "Kullanıcı",
  size = 40,
  className = "",
  priority = false,
  showBadge = false,
  badgeColor = "emerald"
}: CustomAvatarProps) {
  const [hasError, setHasError] = useState(false)

  // İsimden baş harfleri türet (Örn: "Kerim Çetin" -> "KÇ")
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ").filter(Boolean)
    if (parts.length === 0) return "U"
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const initials = getInitials(name || "Kullanıcı")

  // Canlı renk gradyanları
  const badgeClasses = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    cyan: "bg-cyan-500"
  }

  const hasValidImage = src && src.trim() !== "" && !hasError

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-tr from-cyan-900/60 to-blue-900/60 border border-slate-700/80 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {hasValidImage ? (
        <CustomImage
          src={src}
          alt={name || "Profil Fotoğrafı"}
          fill
          sizes={`${size}px`}
          priority={priority}
          className="object-cover rounded-full"
          onError={() => setHasError(true)}
          showSkeleton={false}
        />
      ) : (
        <span
          className="font-bold text-cyan-200 tracking-wider flex items-center justify-center"
          style={{ fontSize: Math.max(10, Math.floor(size * 0.38)) }}
        >
          {initials || <User className="w-1/2 h-1/2 text-cyan-300" />}
        </span>
      )}

      {/* Durum / Çevrimiçi Rozeti */}
      {showBadge && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-slate-950 ${badgeClasses[badgeColor]}`}
          style={{ width: Math.max(8, Math.floor(size * 0.28)), height: Math.max(8, Math.floor(size * 0.28)) }}
        />
      )}
    </div>
  )
}
