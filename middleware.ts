import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

/**
 * Next.js Middleware - Rota Koruması ve Yetki Tabanlı Erişim Kontrolü (RBAC)
 * Gün 7: Antigravity Görevi (#46)
 *
 * Kurallar:
 * 1. Oturum açmamış kullanıcılar /dashboard altındaki sayfalara erişemez -> /login sayfasına yönlendirilir.
 * 2. Oturum açmış kullanıcılar /login sayfasına gitmeye çalışırsa -> /dashboard sayfasına yönlendirilir.
 * 3. /dashboard/settings sayfası YALNIZCA 'Admin' rolüne açıktır.
 *    Personel veya yetkisiz kullanıcılar erişmeye çalıştığında -> /dashboard/unauthorized sayfasına yönlendirilir.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Supabase SSR oturumunu güncelle
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
  let userRole: string = 'Personel'
  if (user?.user_metadata?.role) {
    userRole = user.user_metadata.role
  } else if (demoSession?.role) {
    userRole = demoSession.role
  } else if (user?.email) {
    userRole = user.email.toLowerCase().includes('admin') ? 'Admin' : 'Personel'
  } else if (demoSession?.email) {
    userRole = demoSession.email.toLowerCase().includes('admin') ? 'Admin' : 'Personel'
  }

  // A. KORUMALI ROTA KONTROLÜ: /dashboard ve alt rotaları
  const isDashboardRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  if (isDashboardRoute) {
    // Oturum açılmamışsa /login sayfasına yönlendir (ve geri dönüş yolunu parametre olarak ekle)
    if (!isAuthenticated) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // B. YETKİ TABANLI ERİŞİM KONTROLÜ (RBAC): /dashboard/settings SADECE 'Admin' rolüne açıktır
    const isAdminOnlyRoute = pathname === '/dashboard/settings' || pathname.startsWith('/dashboard/settings/')

    if (isAdminOnlyRoute && userRole !== 'Admin') {
      const unauthorizedUrl = new URL('/dashboard/unauthorized', request.url)
      unauthorizedUrl.searchParams.set('from', pathname)
      unauthorizedUrl.searchParams.set('role', userRole)
      return NextResponse.redirect(unauthorizedUrl)
    }

    return response
  }

  // C. GİRİŞ SAYFASI KONTROLÜ: Zaten oturum açmış kullanıcı /login sayfasına girerse /dashboard'a yönlendir
  if (pathname === '/login' && isAuthenticated) {
    const redirectParam = request.nextUrl.searchParams.get('redirectTo')
    const destination = redirectParam && redirectParam.startsWith('/dashboard') ? redirectParam : '/dashboard'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Aşağıdaki yollarla başlayan istekleri eşleştir:
     * - /dashboard (ve tüm alt rotaları)
     * - /login
     */
    '/dashboard/:path*',
    '/login',
  ],
}
