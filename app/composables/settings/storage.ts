import type { LocaleObject } from '@nuxtjs/i18n'
import type { Ref } from 'vue'
import type { FontSize, OldFontSize, PreferencesSettings, UserSettings } from './definition'
import { themes } from '~/composables/theme-colors'
import { LEGACY_DEFAULT_THEME, STORAGE_KEY_SETTINGS, THEME_SETTINGS_VERSION } from '~/constants'
import { oldFontSizeMap } from '~/constants/options'
import { migrateTranslationPreference } from './definition'

export function checkAndMigrateThemeSettings(settings: UserSettings): boolean {
  let changed = false
  if (settings.themeSettingsVersion == null || settings.themeSettingsVersion < THEME_SETTINGS_VERSION) {
    if (settings.themeSettingsVersion == null && settings.themeColors?.['--theme-color-name'] === LEGACY_DEFAULT_THEME) {
      settings.themeColors = undefined
      changed = true
    }

    if (settings.themeColors) {
      const rawTheme = themes.find(([key]) => key === settings.themeColors?.['--theme-color-name'])?.[1]
      if (rawTheme) {
        const hasMissingKeys = Object.keys(rawTheme).some(key => !(key in settings.themeColors!))
        if (hasMissingKeys) {
          settings.themeColors = { ...rawTheme }
          changed = true
        }
      }
    }

    settings.themeSettingsVersion = THEME_SETTINGS_VERSION
    changed = true
  }
  return changed
}

export function useUserSettings() {
  const { locales } = useNuxtApp().$i18n
  const supportLanguages = (unref(locales) as LocaleObject[]).map(locale => locale.code)
  const settingsStorage = useUserLocalStorage<UserSettings>(STORAGE_KEY_SETTINGS, () => getDefaultUserSettings(supportLanguages))

  migrateTranslationPreference(settingsStorage.value)

  // Backward compatibility, font size was xs, sm, md, lg, xl before
  if (settingsStorage.value.fontSize && !settingsStorage.value.fontSize.includes('px'))
    settingsStorage.value.fontSize = oldFontSizeMap[settingsStorage.value.fontSize as OldFontSize] as FontSize

  checkAndMigrateThemeSettings(settingsStorage.value)

  return settingsStorage
}

// TODO: refactor & simplify this

export function usePreferences<T extends keyof PreferencesSettings>(name: T): Ref<PreferencesSettings[T]> {
  const userSettings = useUserSettings()
  return computed({
    get() {
      return getPreferences(userSettings.value, name)
    },
    set(value) {
      userSettings.value.preferences[name] = value
    },
  })
}

export function getPreferences<T extends keyof PreferencesSettings>(userSettings: UserSettings, name: T): PreferencesSettings[T] {
  const preference = userSettings?.preferences?.[name] ?? DEFAULT__PREFERENCES_SETTINGS[name]

  if (name === 'enableAutoplay')
    return getPreferences(userSettings, 'enableDataSaving') ? false : preference

  return preference
}

export function togglePreferences(key: keyof PreferencesSettings) {
  const flag = usePreferences(key)
  flag.value = !flag.value
}
