import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { cookies } from 'next/headers'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale) {
    const cookieStore = await cookies()
    locale = cookieStore.get('chubi_locale')?.value
  }

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale: locale as string,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
