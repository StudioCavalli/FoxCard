import { getRequestConfig } from 'next-intl/server'

export const locales = ['fr', 'en', 'es', 'de'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'fr'

export default getRequestConfig(async ({ locale }) => {
  const requestLocale = locale || defaultLocale

  return {
    locale: requestLocale,
    messages: (await import(`./messages/${requestLocale}.json`)).default,
  }
})
