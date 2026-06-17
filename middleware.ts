import { NextResponse, type NextRequest } from 'next/server'
import { getSessionTokenFromCookies, verifyToken } from '@/lib/auth/token'
import { clearSessionCookies } from '@/lib/auth/cookie-config'

const PUBLIC_ADMIN_PATHS = [
  '/admin/login',
  '/admin/setup',
  '/admin/register',
  '/admin/forgot-password',
  '/admin/force-setup',
  '/admin/init',
]

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = getSessionTokenFromCookies(request.cookies)
  const payload = sessionToken ? await verifyToken(sessionToken) : null

  if (pathname.startsWith('/admin')) {
    if (!isPublicAdminPath(pathname)) {
      if (!payload) {
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        const response = NextResponse.redirect(loginUrl)
        if (sessionToken && !payload) {
          clearSessionCookies(response)
        }
        return response
      }
    }

    if (pathname === '/admin/login' && payload) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  if (pathname.startsWith('/account')) {
    if (!payload) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      if (sessionToken && !payload) {
        clearSessionCookies(response)
      }
      return response
    }
  }

  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
