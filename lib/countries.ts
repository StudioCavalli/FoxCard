// ISO 3166-1 alpha-2 country codes
export const COUNTRY_CODES = [
  'AF', 'AL', 'DZ', 'DE', 'AD', 'AO', 'AR', 'AM', 'AU', 'AT', 'AZ',
  'BE', 'BJ', 'BR', 'BG', 'BF', 'CM', 'CA', 'CL', 'CN', 'CO', 'KR',
  'CI', 'HR', 'CU', 'DK', 'EG', 'AE', 'EC', 'ES', 'EE', 'US', 'FI',
  'FR', 'GA', 'GE', 'GH', 'GR', 'HU', 'IN', 'ID', 'IQ', 'IR', 'IE',
  'IS', 'IL', 'IT', 'JP', 'JO', 'KE', 'KW', 'LV', 'LB', 'LT', 'LU',
  'MG', 'MY', 'ML', 'MA', 'MX', 'MC', 'NG', 'NO', 'NZ', 'NL', 'PE',
  'PH', 'PL', 'PT', 'QA', 'RO', 'GB', 'RU', 'SA', 'SN', 'RS', 'SG',
  'SK', 'SI', 'SE', 'CH', 'TH', 'TN', 'TR', 'UA', 'UY', 'VN',
] as const

export type CountryCode = (typeof COUNTRY_CODES)[number]

/**
 * Get localized country name using Intl.DisplayNames API
 * @param code ISO 3166-1 alpha-2 country code
 * @param locale Locale (defaults to 'fr')
 */
export function getCountryLabel(code: string, locale: string = 'fr'): string {
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' })
    return displayNames.of(code.toUpperCase()) || code
  } catch {
    return code
  }
}

/**
 * Get all countries with their localized labels
 * @param locale Locale (defaults to 'fr')
 */
export function getCountries(locale: string = 'fr') {
  return COUNTRY_CODES.map((code) => ({
    code,
    label: getCountryLabel(code, locale),
  })).sort((a, b) => a.label.localeCompare(b.label))
}

// Export for backwards compatibility
export const COUNTRIES = getCountries('fr')

export function getCountryFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join('')
}
