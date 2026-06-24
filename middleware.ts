import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/signup', '/about', '/features', '/pricing', '/marketplace']
const PROTECTED_PREFIXES = ['/dashboard', '/messages', '/student', '/client', '/recruiter', '/tpo', '/settings']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('talentMesh_accessToken')?.value
    || request.headers.get('authorization')?.split(' ')[1]

  // Check if this is a protected route
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))

  if (isProtected) {
    const authCookie = request.cookies.get('tm_auth')?.value
    if (!authCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based protection
    let roleCookie = request.cookies.get('tm_role')?.value
    // Merge RECRUITER into CLIENT (Option A)
    if (roleCookie === 'recruiter') {
      roleCookie = 'client'
    }

    if (roleCookie) {
      // Prevent students from accessing client dashboard, etc.
      if (pathname.startsWith('/dashboard/client') && roleCookie !== 'client') {
        return NextResponse.redirect(new URL('/dashboard/' + roleCookie, request.url))
      }
      if (pathname.startsWith('/dashboard/student') && roleCookie !== 'student') {
        return NextResponse.redirect(new URL('/dashboard/' + roleCookie, request.url))
      }
      if (pathname.startsWith('/dashboard/admin') && roleCookie !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/' + roleCookie, request.url))
      }
      if (pathname.startsWith('/admin') && roleCookie !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/' + roleCookie, request.url))
      }
      if (pathname.startsWith('/client') && roleCookie !== 'client') {
        return NextResponse.redirect(new URL('/dashboard/' + roleCookie, request.url))
      }
      if (pathname.startsWith('/student') && roleCookie !== 'student') {
        return NextResponse.redirect(new URL('/dashboard/' + roleCookie, request.url))
      }
      if (pathname.startsWith('/dashboard/tpo') && roleCookie !== 'tpo') {
        return NextResponse.redirect(new URL('/dashboard/' + roleCookie, request.url))
      }
      if (pathname.startsWith('/tpo') && roleCookie !== 'tpo') {
        return NextResponse.redirect(new URL('/dashboard/' + roleCookie, request.url))
      }
    }
  }

  // Prevent logged-in users from seeing the landing page or login/signup pages
  if (['/', '/login', '/signup'].includes(pathname)) {
    const authCookie = request.cookies.get('tm_auth')?.value
    let roleCookie = request.cookies.get('tm_role')?.value
    if (roleCookie === 'recruiter') roleCookie = 'client'
    
    if (authCookie && roleCookie) {
      return NextResponse.redirect(new URL('/dashboard/' + roleCookie, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.*|apple-icon.*).*)',
  ],
}
