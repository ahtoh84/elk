import { describe, expect, it } from 'vitest'
import { checkAndMigrateThemeSettings } from '../../app/composables/settings/storage'
import { resolveTheme, themes } from '../../app/composables/theme-colors'
import { THEME_SETTINGS_VERSION } from '../../app/constants'

describe('settings storage themeColors migration and idempotency', () => {
  it('migrates incomplete themeColors once and sets THEME_SETTINGS_VERSION to 2', () => {
    const settings: any = {
      themeSettingsVersion: 1,
      themeColors: {
        '--theme-color-name': '#b8956a',
        '--c-bg-base': '#faf8f5',
      },
    }

    const changed = checkAndMigrateThemeSettings(settings)
    expect(changed).toBe(true)
    expect(settings.themeSettingsVersion).toBe(THEME_SETTINGS_VERSION)
    expect(settings.themeColors?.['--c-dark-bg-base']).toBe('#1c1915')
  })

  it('restores canonical values when old theme had all keys present but was resolved in dark mode', () => {
    const rawPaper = themes.find(([k]) => k === '#b8956a')![1]
    const darkResolvedPaper = resolveTheme(rawPaper, true)

    // The dark-resolved object has all 62 keys, but light base properties were overwritten by dark values
    expect(Object.keys(darkResolvedPaper).length).toBe(62)
    expect(darkResolvedPaper['--c-bg-base']).toBe('#1c1915')

    const settings: any = {
      themeSettingsVersion: 1,
      themeColors: { ...darkResolvedPaper },
    }

    const changed = checkAndMigrateThemeSettings(settings)
    expect(changed).toBe(true)
    expect(settings.themeSettingsVersion).toBe(THEME_SETTINGS_VERSION)
    // The canonical light base values must be restored so light-mode first paint gets #faf8f5, not #1c1915
    expect(settings.themeColors['--c-bg-base']).toBe('#faf8f5')
    expect(settings.themeColors['--c-dark-bg-base']).toBe('#1c1915')
  })

  it('preserves object reference and avoids rewriting when already on THEME_SETTINGS_VERSION 2', () => {
    const rawPaper = themes.find(([k]) => k === '#b8956a')![1]
    const settings: any = {
      themeSettingsVersion: THEME_SETTINGS_VERSION,
      themeColors: rawPaper,
    }

    const changed = checkAndMigrateThemeSettings(settings)
    expect(changed).toBe(false)
    expect(settings.themeColors).toBe(rawPaper)
  })
})
