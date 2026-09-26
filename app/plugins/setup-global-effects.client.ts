import type { OldFontSize } from '~/composables/settings'
import { getThemeColors } from '~/composables/theme-colors'
import { DEFAULT_FONT_SIZE, THEME_COLORS } from '~/constants'
import { oldFontSizeMap } from '~/constants/options'

export default defineNuxtPlugin(() => {
  const userSettings = useUserSettings()
  const colorMode = useColorMode()
  const html = document.documentElement
  watchEffect(() => {
    const { fontSize } = userSettings.value
    html.style.setProperty('--font-size', fontSize ? (oldFontSizeMap[fontSize as OldFontSize] ?? fontSize) : DEFAULT_FONT_SIZE)
  })
  watchEffect(() => {
    html.classList.toggle('zen', getPreferences(userSettings.value, 'zenMode'))
  })
  watch(
    [
      () => userSettings.value.themeColors?.['--theme-color-name'] || THEME_COLORS.defaultTheme,
      () => colorMode.value,
    ],
    ([themeName, colorMode]) => {
      const themeColors = getThemeColors(themeName, colorMode === 'dark')
      Object.entries(themeColors).forEach(([k, v]) => html.style.setProperty(k, v))
    },
    { immediate: true },
  )
})
