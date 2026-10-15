import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/database"

/**
 * ==============================================================================
 * ENTERPRISE ARCHITECTURE: SERVER-ONLY ADMIN CLIENT & AUTH SESSION VERIFICATION
 * ==============================================================================
 * Bu dosya kesinlikle sunucu tarafında (Route Handlers, Server Actions) çalışmalıdır.
 * SUPABASE_SERVICE_ROLE_KEY istemciye (browser bundle) ASLA sızdırılamaz.
 * ==============================================================================
 */

// İstemci ortamında çağrılmaya karşı katı çalışma zamanı koruması (Zero-Trust Guard)
if (typeof window !== "undefined") {
  throw new Error("GÜVENLİK İHLALİ: createAdminClient asla istemci tarafında (tarayıcıda) çalıştırılamaz!")
}

/**
 * Sunucu tarafında RLS bypass yetkisiyle çalışan Admin Supabase istemcisi üretir.
 * Yalnızca backend arka plan görevleri ve doğrulanmış admin route handler'larında kullanılır.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL ortam değişkeni tanımlanmamış.")
  }

  if (!serviceRoleKey) {
    console.warn("UYARI: SUPABASE_SERVICE_ROLE_KEY bulunamadı. Servis rolü işlemleri için anahtar gereklidir.")
  }

  return createClient<Database>(
    supabaseUrl,
    serviceRoleKey || "missing-service-role-key",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export interface AuthenticatedUserSession {
  userId: string
  email: string
  role: "Admin" | "Personel"
  isActive: boolean
}

/**
 * Sunucu route handler'larında kullanıcının oturumunu ve rolünü kesin olarak doğrular.
 * @param serverSupabase createServerClient örneği
 */
export async function verifyServerSession(
  serverSupabase: ReturnType<typeof import("@/utils/supabase/server").createClient>
): Promise<{ error: string | null; session: AuthenticatedUserSession | null }> {
  try {
    const {
      data: { user },
      error: userError,
    } = await serverSupabase.auth.getUser()

    if (userError || !user) {
      return { error: "Oturum açılmamış veya yetkisiz erişim (401)", session: null }
    }

    // Role ve aktiflik kontrolü (Önce JWT metadata, sonra profiles fallback)
    const jwtRole = (user.user_metadata?.role || user.app_metadata?.role) as "Admin" | "Personel" | undefined

    if (jwtRole) {
      return {
        error: null,
        session: {
          userId: user.id,
          email: user.email || "",
          role: jwtRole,
          isActive: true,
        },
      }
    }

    // Fallback: Profiles tablosundan sorgula
    interface ProfileRow {
      role?: string | null
      is_active?: boolean | null
    }

    const { data } = await (serverSupabase as any)
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single()

    const profile = data as ProfileRow | null

    if (!profile || profile.is_active === false) {
      return { error: "Kullanıcı hesabı aktif değil veya rol atanmamış.", session: null }
    }

    return {
      error: null,
      session: {
        userId: user.id,
        email: user.email || "",
        role: (profile.role as "Admin" | "Personel") || "Personel",
        isActive: true,
      },
    }
  } catch (err) {
    console.error("Session verification error:", err)
    return { error: "Sunucu yetkilendirme doğrulaması sırasında hata oluştu.", session: null }
  }
}
