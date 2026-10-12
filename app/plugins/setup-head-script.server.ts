import { LEGACY_DEFAULT_THEME, STORAGE_KEY_CURRENT_USER_HANDLE, STORAGE_KEY_SETTINGS } from '~/constants'
import { oldFontSizeMap } from '~/constants/options'

const WHITESPACE_REGEX = /\s*\n\s*/g

/**
 * Injecting scripts before renders
 */
export default defineNuxtPlugin(() => {
  useHead({
    script: [
      {
        innerHTML: `
;(function() {
  const html = document.documentElement
  try {
    const localColor = localStorage.getItem('nuxt-color-mode')
    if (localColor && !document.cookie.includes('nuxt-color-mode=')) {
      document.cookie = 'nuxt-color-mode=' + localColor + '; path=/; max-age=31536000'
    }
    const isDark = document.cookie.includes('nuxt-color-mode=dark')
      || localColor === 'dark'
      || ((!localColor || localColor === 'system') && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (isDark && !html.classList.contains('dark')) {
      html.classList.add('dark')
    }
  } catch (e) {}

  const handle = localStorage.getItem('${STORAGE_KEY_CURRENT_USER_HANDLE}') || '[anonymous]'
  const allSettings = JSON.parse(localStorage.getItem('${STORAGE_KEY_SETTINGS}') || '{}')
  const settings = allSettings[handle]
  if (!settings) { return }

  ${import.meta.dev ? 'console.log({ settings })' : ''}

  if (settings.fontSize) {
    const oldFontSizeMap = ${JSON.stringify(oldFontSizeMap)}
    html.style.setProperty('--font-size', oldFontSizeMap[settings.fontSize] || settings.fontSize)
  }
  if (settings.language) {
    html.setAttribute('lang', settings.language)
  }
  if (settings.preferences.zenMode) {
    html.classList.add('zen')
  }
  const hasLegacyDefaultTheme = settings.themeSettingsVersion == null && settings.themeColors?.['--theme-color-name'] === ${JSON.stringify(LEGACY_DEFAULT_THEME)}
  if (settings.themeColors && !hasLegacyDefaultTheme) {
    Object.entries(settings.themeColors).map(i => html.style.setProperty(i[0], i[1]))
  }
})()`.trim().replace(WHITESPACE_REGEX, ';'),
      },
    ],
  })
})
