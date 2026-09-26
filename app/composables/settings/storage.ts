import type { LocaleObject } from '@nuxtjs/i18n'
import type { Ref } from 'vue'
import type { FontSize, OldFontSize, PreferencesSettings, UserSettings } from './definition'
import { LEGACY_DEFAULT_THEME, STORAGE_KEY_SETTINGS, THEME_SETTINGS_VERSION } from '~/constants'
import { oldFontSizeMap } from '~/constants/options'

export function useUserSettings() {
  const { locales } = useNuxtApp().$i18n
  const supportLanguages = (unref(locales) as LocaleObject[]).map(locale => locale.code)
  const settingsStorage = useUserLocalStorage<UserSettings>(STORAGE_KEY_SETTINGS, () => getDefaultUserSettings(supportLanguages))

  // Backward compatibility, font size was xs, sm, md, lg, xl before
  if (settingsStorage.value.fontSize && !settingsStorage.value.fontSize.includes('px'))
    settingsStorage.value.fontSize = oldFontSizeMap[settingsStorage.value.fontSize as OldFontSize] as FontSize

  // Ink is now the default theme. Older settings stored Paper even when the
  // user had never selected a theme, which made the primary color disagree
  // with the new Ink base variables. Migrate that legacy default once while
  // preserving themes selected after this version was introduced.
  if (settingsStorage.value.themeSettingsVersion == null) {
    if (settingsStorage.value.themeColors?.['--theme-color-name'] === LEGACY_DEFAULT_THEME)
      settingsStorage.value.themeColors = undefined
    settingsStorage.value.themeSettingsVersion = THEME_SETTINGS_VERSION
  }

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
