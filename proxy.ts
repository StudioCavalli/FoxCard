import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale, type Locale } from './lib/i18n/config'

// Country to locale mapping for geo-detection
const countryToLocale: Record<string, Locale> = {
  // Slovak-speaking (primary market)
  SK: 'sk',
  CZ: 'sk', // Czech - closest to Slovak
  // French-speaking
  FR: 'fr',
  BE: 'fr',
  CH: 'fr',
  LU: 'fr',
  MC: 'fr',
  // German-speaking
  DE: 'de',
  AT: 'de',
  LI: 'de',
  // Spanish-speaking
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  CL: 'es',
  PE: 'es',
  VE: 'es',
  EC: 'es',
  // English-speaking
  US: 'en',
  GB: 'en',
  CA: 'en',
  AU: 'en',
  NZ: 'en',
  IE: 'en',
}

// Create i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

// Simple in-memory cache for maintenance mode
let maintenanceCache: { active: boolean; message: string | null; timestamp: number } | null = null
const MAINTENANCE_CACHE_TTL = 30 * 1000 // 30 seconds

async function checkMaintenanceMode(baseUrl: string): Promise<{ active: boolean; message: string | null }> {
  const now = Date.now()

  // Use cache if still valid
  if (maintenanceCache && now - maintenanceCache.timestamp < MAINTENANCE_CACHE_TTL) {
    return { active: maintenanceCache.active, message: maintenanceCache.message }
  }

  try {
    // Fetch settings from internal API
    const settingsUrl = new URL('/api/platform/settings', baseUrl)
    const response = await fetch(settingsUrl, {
      headers: { 'x-internal-request': 'true' },
      cache: 'no-store',
    })

    if (response.ok) {
      const settings = await response.json()
      maintenanceCache = {
        active: settings.maintenanceMode || false,
        message: settings.maintenanceMessage || null,
        timestamp: now,
      }
      return { active: maintenanceCache.active, message: maintenanceCache.message }
    }
  } catch (error) {
    // Silent fail - don't block on maintenance check errors
  }

  // Default to no maintenance mode on error
  return { active: false, message: null }
}

export default withAuth(
  async function middleware(req) {
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
    const isMerchantPage = pathWithoutLocale.startsWith('/merchant')
    const isAccountPage = pathWithoutLocale.startsWith('/account')
    const isMaintenancePage = pathWithoutLocale.startsWith('/maintenance')
    const isSuspendedPage = pathWithoutLocale === '/account/suspended'

    const locale = pathname.split('/')[1] || defaultLocale

    // Check maintenance mode (except for super admins and certain pages)
    const isSuperAdmin = token?.role === 'SUPER_ADMIN'
    if (!isSuperAdmin && !isMaintenancePage && !isAuthPage && !isSuspendedPage) {
      const maintenanceStatus = await checkMaintenanceMode(req.nextUrl.origin)

      if (maintenanceStatus.active) {
        const maintenanceUrl = new URL(`/${locale}/maintenance`, req.url)
        if (maintenanceStatus.message) {
          maintenanceUrl.searchParams.set('message', maintenanceStatus.message)
        }
        return NextResponse.redirect(maintenanceUrl)
      }
    }

    // Check if user is suspended or banned
    if (isAuth && !isSuspendedPage && !isAuthPage) {
      const userStatus = token?.status as string | undefined
      if (userStatus === 'SUSPENDED' || userStatus === 'BANNED') {
        return NextResponse.redirect(new URL(`/${locale}/account/suspended`, req.url))
      }
    }

    // Redirect /admin to /merchant (route migration)
    if (isAdminPage) {
      const restPath = pathWithoutLocale.replace('/admin', '')
      return NextResponse.redirect(new URL(`/${locale}/merchant${restPath}`, req.url))
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL(`/${locale}/account`, req.url))
    }

    // Redirect non-authenticated users from protected pages
    if ((isSuperAdminPage || isMerchantPage || isAccountPage) && !isAuth) {
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
        // Redirect to merchant if they are an admin, otherwise to account
        if (userRole === 'ADMIN') {
          return NextResponse.redirect(new URL(`/${locale}/merchant`, req.url))
        }
        return NextResponse.redirect(new URL(`/${locale}/unauthorized`, req.url))
      }
    }

    // Check admin role for merchant pages
    if (isMerchantPage && isAuth) {
      const userRole = token?.role as string | undefined
      if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL(`/${locale}/account`, req.url))
      }
    }

    // Check for saved locale preference in cookie when no locale in path
    if (pathnameIsMissingLocale) {
      let detectedLocale: Locale = defaultLocale

      // 1. First priority: Check cookie for user preference
      const savedLocale = req.cookies.get('NEXT_LOCALE')?.value as Locale | undefined
      if (savedLocale && locales.includes(savedLocale)) {
        detectedLocale = savedLocale
      } else {
        // 2. Second priority: Detect from country (Vercel geo header)
        const country = req.headers.get('x-vercel-ip-country') || ''
        if (country && countryToLocale[country]) {
          detectedLocale = countryToLocale[country]
        } else {
          // 3. Third priority: Check Accept-Language header
          const acceptLanguage = req.headers.get('accept-language')
          if (acceptLanguage) {
            const languages = acceptLanguage.split(',').map((lang) => {
              const [code] = lang.trim().split(';')
              return code.split('-')[0].toLowerCase()
            })
            for (const lang of languages) {
              if (locales.includes(lang as Locale)) {
                detectedLocale = lang as Locale
                break
              }
            }
          }
        }
      }

      // Redirect to detected locale
      const url = req.nextUrl.clone()
      url.pathname = `/${detectedLocale}${pathname}`
      const response = NextResponse.redirect(url)

      // Save locale in cookie if not already set (for persistence)
      if (!savedLocale) {
        response.cookies.set('NEXT_LOCALE', detectedLocale, {
          maxAge: 60 * 60 * 24 * 365, // 1 year
          path: '/',
          sameSite: 'lax',
        })
      }

      return response
    }

    // Handle i18n routing
    return intlMiddleware(req)
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
