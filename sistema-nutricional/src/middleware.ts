import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to public routes without any checks
  if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/test') {
    return NextResponse.next()
  }

  // For protected routes, we'll handle auth in the individual pages
  // This is a simplified approach to avoid middleware conflicts
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Only match protected routes that require authentication:
     * - /patient/* (patient dashboard and related pages)
     * - /nutritionist/* (nutritionist dashboard and related pages)
     * 
     * Exclude all public routes and static files
     */
    '/patient/:path*',
    '/nutritionist/:path*'
  ],
}