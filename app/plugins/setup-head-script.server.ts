import { LEGACY_DEFAULT_THEME, STORAGE_KEY_CURRENT_USER_HANDLE, STORAGE_KEY_SETTINGS, THEME_SETTINGS_VERSION } from '~/constants'
import { oldFontSizeMap } from '~/constants/options'
import themesJson from '~/constants/themes.json'

const mock = process.mock
const canonicalThemes = Object.fromEntries(themesJson)

export function generateHeadScript(options: {
  mockUser?: { id?: string, acct?: string } | null
} = {}): string {
  const mockUser = options.mockUser === null
    ? null
    : (options.mockUser ?? mock?.user?.account ?? null)
  const mockUserId = mockUser?.id
  const mockUserAcct = mockUser?.acct
  const mockMigrationScript = mockUserId && mockUserAcct
    ? `if (handle === ${JSON.stringify(mockUserId)}) {
      handle = ${JSON.stringify(mockUserAcct)};
      try { localStorage.setItem('${STORAGE_KEY_CURRENT_USER_HANDLE}', handle); } catch (e) {}
    }`
    : ''

  return `;(function() {
  const html = document.documentElement;
  let isDark = false;
  try {
    let cookieColor = null;
    const match = document.cookie.match(/(?:^|;\\s*)nuxt-color-mode=([^;]+)/);
    if (match) {
      cookieColor = decodeURIComponent(match[1]);
    }
    const localColor = localStorage.getItem('nuxt-color-mode');
    if (localColor && !cookieColor) {
      document.cookie = 'nuxt-color-mode=' + localColor + '; path=/; max-age=31536000';
      cookieColor = localColor;
    }
    const mode = cookieColor || localColor || 'system';
    if (mode === 'dark') {
      isDark = true;
    } else if (mode === 'light') {
      isDark = false;
    } else {
      isDark = Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    if (isDark) {
      if (!html.classList.contains('dark')) {
        html.classList.add('dark');
      }
    } else {
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
      }
    }
  } catch (e) {}

  try {
    let handle = localStorage.getItem('${STORAGE_KEY_CURRENT_USER_HANDLE}') || '[anonymous]';
    ${mockMigrationScript}
    const rawSettings = localStorage.getItem('${STORAGE_KEY_SETTINGS}');
    if (!rawSettings) return;
    const allSettings = JSON.parse(rawSettings);
    const settings = allSettings && allSettings[handle];
    if (!settings) return;

    if (settings.fontSize) {
      const oldFontSizeMap = ${JSON.stringify(oldFontSizeMap)};
      html.style.setProperty('--font-size', oldFontSizeMap[settings.fontSize] || settings.fontSize);
    }
    if (settings.language) {
      html.setAttribute('lang', settings.language);
    }
    if (settings.preferences && settings.preferences.zenMode) {
      html.classList.add('zen');
    }
    const hasLegacyDefaultTheme = settings.themeSettingsVersion == null && settings.themeColors && settings.themeColors['--theme-color-name'] === ${JSON.stringify(LEGACY_DEFAULT_THEME)};
    if (settings.themeColors && !hasLegacyDefaultTheme) {
      let theme = settings.themeColors;
      const themeVersion = settings.themeSettingsVersion;
      if (themeVersion == null || themeVersion < ${THEME_SETTINGS_VERSION}) {
        const canonicalThemes = ${JSON.stringify(canonicalThemes)};
        const themeName = theme && theme['--theme-color-name'];
        if (canonicalThemes && canonicalThemes[themeName]) {
          theme = canonicalThemes[themeName];
        }
      }
      const isInk = theme['--theme-color-name'] === '#242424';
      const darkRegex = /^--(c|rgb)-/;
      Object.keys(theme).forEach(function(key) {
        if (!key.startsWith('--c-') && !key.startsWith('--rgb-') && key !== '--theme-color-name') return;
        let val = theme[key];
        if (isDark) {
          const darkKey = key.replace(darkRegex, '--$1-dark-');
          if (theme[darkKey]) {
            val = theme[darkKey];
          }
        } else if (key === '--c-primary' && val && !val.startsWith('color-mix')) {
          val = 'color-mix(in srgb, ' + val + ', black 25%)';
        }
        html.style.setProperty(key, val);
      });
      if (!theme['--c-nav-active-bg']) {
        html.style.setProperty('--c-nav-active-bg', (isInk && !isDark) ? '#f0f0f0' : (theme['--c-primary-fade'] || 'transparent'));
      } else {
        html.style.setProperty('--c-nav-active-bg', isDark && theme['--c-dark-nav-active-bg'] ? theme['--c-dark-nav-active-bg'] : theme['--c-nav-active-bg']);
      }
      if (!theme['--c-container-border']) {
        html.style.setProperty('--c-container-border', (isInk && !isDark) ? '#D5D5D5' : (theme['--c-border'] || 'transparent'));
      } else {
        html.style.setProperty('--c-container-border', isDark && theme['--c-dark-container-border'] ? theme['--c-dark-container-border'] : theme['--c-container-border']);
      }
    }
  } catch (e) {}
})()`.trim()
}

/**
 * Injecting scripts before renders
 */
export default defineNuxtPlugin(() => {
  useHead({
    script: [
      {
        innerHTML: generateHeadScript(),
      },
    ],
  })
})
