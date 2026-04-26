'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GlobalComponentsView } from '@/app/playground/components/GlobalComponentsView'
import { DesignSheetView } from '@/app/playground/components/DesignSheetView'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/store/useThemeStore'
import { useModalStore } from '@/store/useModalStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

type View = 'global' | 'design'

export default function PlaygroundPage() {
  const [activeView, setActiveView] = useState<View>('global')
  const t = useTranslations('Playground')
  const tCommon = useTranslations('Common')
  const tAuth = useTranslations('Auth')
  const router = useRouter()

  // Initialize auth and trigger hydration
  useAuth()

  const changeLanguage = (locale: string) => {
    document.cookie = `chubi_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`
    router.refresh()
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Menu */}
      <aside className="bg-muted/10 w-64 space-y-6 border-r p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground text-sm">
            Local Development Menu
          </p>
        </div>
        <nav className="space-y-2">
          <Button
            variant={activeView === 'global' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('global')}
          >
            {t('globalComponents')}
          </Button>
          <Button
            variant={activeView === 'design' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveView('design')}
          >
            {t('designSheet')}
          </Button>
        </nav>
        <div className="mt-auto space-y-4 border-t pt-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Auth</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  useModalStore.getState().setAuthView('login')
                  useModalStore.getState().openModal({ type: 'custom' })
                }}
              >
                {tAuth('login')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={async () => {
                  await useAuthStore.getState().logout()
                }}
              >
                {tAuth('logout')}
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => {
              const current = useThemeStore.getState().theme
              const next = current === 'dark' ? 'light' : 'dark'
              useThemeStore.getState().setTheme(next)
            }}
          >
            <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span>{tCommon('toggleTheme')}</span>
          </Button>

          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-medium">
              Language
            </label>
            <select
              className="bg-background w-full rounded border p-2 text-sm"
              onChange={(e) => changeLanguage(e.target.value)}
              defaultValue="th" // Ideally this should be initialized from cookie/server
            >
              <option value="th">Thai</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {activeView === 'global'
                ? t('globalComponents')
                : t('designSheet')}
            </h1>
          </div>

          {activeView === 'global' && <GlobalComponentsView />}
          {activeView === 'design' && <DesignSheetView />}
        </div>
      </main>
    </div>
  )
}
