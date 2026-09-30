import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

/**
 * Next.js Middleware - Rota Koruması ve Yetki Tabanlı Erişim Kontrolü (RBAC)
 * Mimari Güvenlik Katmanı:
 *
 * Kurallar:
 * 1. Korumalı rotalar (/dashboard/*, /settings/*, /admin/*) oturumsuz kullanıcılara kapalıdır -> /login sayfasına yönlendirilir.
 * 2. Zaten oturum açmış kullanıcılar /login veya /register sayfalarına girmeye çalıştığında -> /dashboard sayfasına yönlendirilir.
 * 3. Yalnızca 'Admin' erişimine açık rotalar (/dashboard/settings, /settings, /admin) 'Personel' rolü için 403 / yetkisiz sayfasına (/dashboard/unauthorized) yönlendirilir.
 * 4. Statik dosyalar (_next/static, _next/image, favicon, resimler) matcher dışına alınarak yüksek performans ve sıfır gereksiz execution sağlanır.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Supabase SSR oturumunu yenile ve doğrula
  const { user, response } = await updateSession(request)

  // 2. Yedek/Demo oturum çerezini kontrol et
  const sessionCookie = request.cookies.get('phonestore_session')?.value
  let demoSession: { email: string; role: string } | null = null
  if (sessionCookie) {
    try {
      demoSession = JSON.parse(decodeURIComponent(sessionCookie))
    } catch {
      demoSession = null
    }
  }

  // Kullanıcı oturum açmış mı?
  const isAuthenticated = Boolean(user || demoSession)

  // Kullanıcının rolünü tespit et (Öncelik: Supabase metadata -> demo session -> e-posta analizi)
  let userRole: 'Admin' | 'Personel' = 'Personel'
  if (user?.user_metadata?.role === 'Admin' || user?.user_metadata?.role === 'Personel') {
    userRole = user.user_metadata.role
  } else if (demoSession?.role === 'Admin' || demoSession?.role === 'Personel') {
    userRole = demoSession.role
  } else if (user?.email) {
    userRole = user.email.toLowerCase().includes('admin') ? 'Admin' : 'Personel'
  } else if (demoSession?.email) {
    userRole = demoSession.email.toLowerCase().includes('admin') ? 'Admin' : 'Personel'
  }

  // -------------------------------------------------------------
  // A. KORUMALI ROTA GRUBU: /dashboard, /settings, /admin
  // -------------------------------------------------------------
  const isProtectedPath = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/settings') || 
    pathname.startsWith('/admin')

  if (isProtectedPath) {
    // Oturum açılmamışsa -> /login sayfasına yönlendir
    if (!isAuthenticated) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // -----------------------------------------------------------
    // B. YETKİ TABANLI ERİŞİM KONTROLÜ (RBAC): SADECE 'Admin' Rotaları
    // -----------------------------------------------------------
    const isAdminOnlyPath = 
      pathname === '/dashboard/settings' ||
      pathname.startsWith('/dashboard/settings/') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/admin')

    if (isAdminOnlyPath && userRole !== 'Admin') {
      const unauthorizedUrl = new URL('/dashboard/unauthorized', request.url)
      unauthorizedUrl.searchParams.set('from', pathname)
      unauthorizedUrl.searchParams.set('role', userRole)
      return NextResponse.redirect(unauthorizedUrl)
    }

    return response
  }

  // -------------------------------------------------------------
  // C. AUTH SAYFALARI: /login ve /register
  // Oturum açmış kullanıcı buralara girerse doğrudan panele yönlendir
  // -------------------------------------------------------------
  const isAuthPage = pathname === '/login' || pathname === '/register'
  if (isAuthPage && isAuthenticated) {
    const redirectParam = request.nextUrl.searchParams.get('redirectTo')
    const destination = redirectParam && redirectParam.startsWith('/dashboard') ? redirectParam : '/dashboard'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static images (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
