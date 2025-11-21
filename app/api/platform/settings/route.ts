import { NextResponse } from 'next/server'
import { getPlatformSettings } from '@/lib/platform/settings'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Only allow internal requests from middleware
  const isInternal = request.headers.get('x-internal-request') === 'true'

  try {
    const settings = await getPlatformSettings()

    // For internal requests, return full settings
    if (isInternal) {
      return NextResponse.json(settings)
    }

    // For public requests, return only safe public settings
    return NextResponse.json({
      platformName: settings.platformName,
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
