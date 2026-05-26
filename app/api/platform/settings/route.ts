import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getPlatformSettings } from '@/lib/platform/settings'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const settings = await getPlatformSettings()

    // Check for authenticated session
    const session = await getServerSession(authOptions)

    // For SUPER_ADMIN users, return full settings (including sensitive fields)
    if (session?.user?.role === 'SUPER_ADMIN') {
      return NextResponse.json(settings)
    }

    // For unauthenticated or non-admin requests, return only public settings
    return NextResponse.json({
      platformName: settings.platformName,
      platformUrl: settings.platformUrl,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
      defaultCurrency: settings.defaultCurrency,
      defaultLanguage: settings.defaultLanguage,
      supportedCurrencies: settings.supportedCurrencies,
      supportedLanguages: settings.supportedLanguages,
      allowRegistration: settings.allowRegistration,
      // Payment settings (public - needed for checkout)
      stripeEnabled: settings.stripeEnabled,
      paypalEnabled: settings.paypalEnabled,
      bankTransferEnabled: settings.bankTransferEnabled,
    })
  } catch (error) {
    console.error('Error fetching platform settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
