import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth(function middleware(req: NextRequest & { auth: { user?: { role?: string; mustResetPass?: boolean } } | null }) {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isAdminRoute = pathname.startsWith('/admin')
  const isStudentRoute = pathname.startsWith('/student')
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/forgot-password')
  const isCronRoute = pathname.startsWith('/api/cron')

  // Protect cron routes with secret
  if (isCronRoute) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session?.user) {
    if (session.user.mustResetPass) {
      return NextResponse.redirect(new URL('/reset-password', req.url))
    }
    const dest = session.user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'
    return NextResponse.redirect(new URL(dest, req.url))
  }

  // Require auth for dashboard routes
  if ((isAdminRoute || isStudentRoute) && !session?.user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Force reset password if mustResetPass
  if (session?.user?.mustResetPass && pathname !== '/reset-password') {
    if (isAdminRoute || isStudentRoute) {
      return NextResponse.redirect(new URL('/reset-password', req.url))
    }
  }

  // Admin-only guard
  if (isAdminRoute && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/student/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
