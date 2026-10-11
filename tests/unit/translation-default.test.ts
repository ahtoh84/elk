import { describe, expect, it } from 'vitest'
import { DEFAULT__PREFERENCES_SETTINGS, getDefaultUserSettings, migrateTranslationPreference } from '~/composables/settings/definition'

describe('translation preference default', () => {
  it('hides translation controls for users who have not chosen a preference', () => {
    expect(DEFAULT__PREFERENCES_SETTINGS.hideTranslation).toBe(true)
    expect(getDefaultUserSettings([]).preferences.hideTranslation).toBe(true)
  })

  it('migrates existing settings that still contain the previous visible-by-default value', () => {
    const settings = getDefaultUserSettings([])
    settings.preferences.hideTranslation = false

    migrateTranslationPreference(settings)

    expect(settings.preferences.hideTranslation).toBe(true)
  })

  it('preserves the user choice after the migration has run once', () => {
    const settings = getDefaultUserSettings([])
    migrateTranslationPreference(settings)

    settings.preferences.hideTranslation = false
    migrateTranslationPreference(settings)

    expect(settings.preferences.hideTranslation).toBe(false)
  })
})
