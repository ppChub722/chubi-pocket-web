import type { Metadata } from 'next'
import { Inter, Noto_Sans_Thai } from 'next/font/google'
import './globals.css'
import { GlobalModal } from '@/components/shared/GlobalModal'
import { GlobalLoader } from '@/components/shared/GlobalLoader'
import { Toaster } from '@/components/ui/sonner'
import { ThemeInjector } from '@/components/shared/ThemeInjector'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { AuthModal } from '@/components/auth/AuthModal'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  variable: '--font-thai',
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'ChubiPocket',
  description: 'Financial Management App',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansThai.variable}`}
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
          <GlobalModal />
          <AuthModal />
          <GlobalLoader />
          <ThemeInjector />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
