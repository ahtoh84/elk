import { describe, expect, it } from 'vitest'
import { checkAndMigrateThemeSettings } from '../../app/composables/settings/storage'
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

  it('preserves object reference and avoids rewriting when already on THEME_SETTINGS_VERSION 2', () => {
    const rawThemeRef = {
      '--theme-color-name': '#b8956a',
      '--c-bg-base': '#faf8f5',
      '--c-dark-bg-base': '#1c1915',
    } as any
    const settings: any = {
      themeSettingsVersion: THEME_SETTINGS_VERSION,
      themeColors: rawThemeRef,
    }

    const changed = checkAndMigrateThemeSettings(settings)
    expect(changed).toBe(false)
    expect(settings.themeColors).toBe(rawThemeRef)
  })
})
