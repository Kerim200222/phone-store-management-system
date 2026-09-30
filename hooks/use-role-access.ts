"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { UserRole, UserSession } from "@/types/auth"

export interface UseRoleAccessReturn {
  user: UserSession | null
  userRole: UserRole
  userEmail: string
  isAdmin: boolean
  isPersonel: boolean
  isLoading: boolean
  isAuthenticated: boolean
  canAccess: (adminOnly?: boolean, allowedRoles?: UserRole[]) => boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

export function useRoleAccess(): UseRoleAccessReturn {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [userRole, setUserRole] = useState<UserRole>("Admin")
  const [userEmail, setUserEmail] = useState<string>("admin@truncgiller.com")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  const resolveRole = (emailStr?: string, metaRole?: string): UserRole => {
    if (metaRole === "Admin" || metaRole === "Personel") {
      return metaRole
    }
    if (emailStr && emailStr.toLowerCase().includes("personel")) {
      return "Personel"
    }
    return "Admin"
  }

  const loadSession = useCallback(async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: { user: authUser }, error } = await supabase.auth.getUser()

      if (authUser && !error && authUser.email) {
        const role = resolveRole(authUser.email, authUser.user_metadata?.role)
        const session: UserSession = {
          id: authUser.id,
          email: authUser.email,
          role,
          fullName: authUser.user_metadata?.full_name || authUser.email.split("@")[0],
          phone: authUser.user_metadata?.phone,
          storeBranch: authUser.user_metadata?.store_branch || "Kadıköy Merkez Şube",
        }
        setUser(session)
        setUserRole(role)
        setUserEmail(authUser.email)
        setIsAuthenticated(true)
      } else {
        // Fallback: Check demo session cookie
        const match = typeof document !== "undefined" ? document.cookie.match(/(?:^|; )phonestore_session=([^;]+)/) : null
        if (match) {
          try {
            const parsed = JSON.parse(decodeURIComponent(match[1]))
            const role = resolveRole(parsed?.email, parsed?.role)
            const email = parsed?.email || "admin@truncgiller.com"
            setUser({
              id: "usr-demo",
              email,
              role,
              fullName: parsed?.fullName || "Kerim (Yönetici)",
              storeBranch: "Kadıköy Merkez Şube",
            })
            setUserRole(role)
            setUserEmail(email)
            setIsAuthenticated(true)
          } catch {
            setUser(null)
            setIsAuthenticated(false)
          }
        } else {
          // Default unauthenticated / fallback
          setUserRole("Admin")
          setUserEmail("admin@truncgiller.com")
          setIsAuthenticated(true)
        }
      }
    } catch {
      // Graceful fallback
      setUserRole("Admin")
      setUserEmail("admin@truncgiller.com")
      setIsAuthenticated(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  const canAccess = useCallback(
    (adminOnly?: boolean, allowedRoles?: UserRole[]): boolean => {
      if (adminOnly && userRole !== "Admin") {
        return false
      }
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return false
      }
      return true
    },
    [userRole]
  )

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // ignore
    }
    if (typeof document !== "undefined") {
      document.cookie = "phonestore_session=; path=/; max-age=0; SameSite=Lax"
    }
    setUser(null)
    setIsAuthenticated(false)
    router.push("/login")
  }, [router])

  return {
    user,
    userRole,
    userEmail,
    isAdmin: userRole === "Admin",
    isPersonel: userRole === "Personel",
    isLoading,
    isAuthenticated,
    canAccess,
    signOut,
    refreshSession: loadSession,
  }
}
