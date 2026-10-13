import type { ThemeColors } from '~/composables/settings'
import { THEME_COLORS } from '~/constants'
import themesJson from '~/constants/themes.json'

const DARK_THEME_KEY_REGEX = /^--(c|rgb)-/
const themes = themesJson as [string, ThemeColors][]

export function resolveTheme(theme: ThemeColors, dark: boolean): ThemeColors {
  const resolved = { ...theme }

  if (dark) {
    for (const key of Object.keys(theme)) {
      if (!key.startsWith('--c-') && !key.startsWith('--rgb-'))
        continue

      const darkKey = key.replace(DARK_THEME_KEY_REGEX, '--$1-dark-')
      const darkValue = theme[darkKey]
      if (darkValue)
        resolved[key] = darkValue
    }
  }
  else {
    resolved['--c-primary'] = `color-mix(in srgb, ${theme['--c-primary']}, black 25%)`
  }

  const isInk = resolved['--theme-color-name'] === '#242424'
  if (!resolved['--c-nav-active-bg'])
    resolved['--c-nav-active-bg'] = (isInk && !dark) ? '#f0f0f0' : (resolved['--c-primary-fade'] || 'transparent')
  if (!resolved['--c-container-border'])
    resolved['--c-container-border'] = (isInk && !dark) ? '#D5D5D5' : (resolved['--c-border'] || 'transparent')

  return resolved
}

export function getThemeOptions(dark: boolean): [string, ThemeColors][] {
  return themes.map(([key, theme]) => [key, resolveTheme(theme, dark)])
}

export function getThemeColors(themeName: string, dark: boolean): ThemeColors {
  const theme = themes.find(([key]) => key === themeName)
    ?? themes.find(([key]) => key === THEME_COLORS.defaultTheme)
    ?? themes[0]

  return resolveTheme(theme![1], dark)
}
