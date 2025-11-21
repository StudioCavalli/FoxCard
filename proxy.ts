import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './lib/i18n/config'

// Create i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export default withAuth(
  function middleware(req) {
    // First, handle i18n routing
    const response = intlMiddleware(req)

    // Then handle authentication/authorization
    const token = req.nextauth.token
    const isAuth = !!token
    const pathname = req.nextUrl.pathname

    // Extract locale from pathname (e.g., /fr/admin -> fr)
    const pathnameIsMissingLocale = locales.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    // Check if the path (without locale) matches protected routes
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '')
    const isAuthPage = pathWithoutLocale.startsWith('/auth')
    const isSuperAdminPage = pathWithoutLocale.startsWith('/superadmin')
    const isAdminPage = pathWithoutLocale.startsWith('/admin') && !isSuperAdminPage
    const isAccountPage = pathWithoutLocale.startsWith('/account')

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      const locale = pathname.split('/')[1]
      return NextResponse.redirect(new URL(`/${locale}/account`, req.url))
    }

    // Redirect non-authenticated users from protected pages
    if ((isSuperAdminPage || isAdminPage || isAccountPage) && !isAuth) {
      const locale = pathname.split('/')[1]
      let from = pathname
      if (req.nextUrl.search) {
        from += req.nextUrl.search
      }

      return NextResponse.redirect(
        new URL(`/${locale}/auth/login?from=${encodeURIComponent(from)}`, req.url)
      )
    }

    // Check SUPER_ADMIN role for superadmin pages
    if (isSuperAdminPage && isAuth) {
      const userRole = token?.role as string | undefined
      if (userRole !== 'SUPER_ADMIN') {
        const locale = pathname.split('/')[1]
        // Redirect to admin if they are an admin, otherwise to account
        if (userRole === 'ADMIN') {
          return NextResponse.redirect(new URL(`/${locale}/admin`, req.url))
        }
        return NextResponse.redirect(new URL(`/${locale}/account`, req.url))
      }
    }

    // Check admin role for admin pages
    if (isAdminPage && isAuth) {
      const userRole = token?.role as string | undefined
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        const locale = pathname.split('/')[1]
        return NextResponse.redirect(new URL(`/${locale}/account`, req.url))
      }
    }

    return response
  },
  {
    callbacks: {
      authorized: () => true, // We handle authorization in the middleware function above
    },
  }
)

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
}
