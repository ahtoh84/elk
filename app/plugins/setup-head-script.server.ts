import { LEGACY_DEFAULT_THEME, STORAGE_KEY_CURRENT_USER_HANDLE, STORAGE_KEY_SETTINGS } from '~/constants'
import { oldFontSizeMap } from '~/constants/options'

export function generateHeadScript(): string {
  return `;(function() {
  const html = document.documentElement;
  let isDark = false;
  try {
    const localColor = localStorage.getItem('nuxt-color-mode');
    if (localColor && !document.cookie.includes('nuxt-color-mode=')) {
      document.cookie = 'nuxt-color-mode=' + localColor + '; path=/; max-age=31536000';
    }
    isDark = document.cookie.includes('nuxt-color-mode=dark') || localColor === 'dark' || ((!localColor || localColor === 'system') && Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches));
    if (isDark && !html.classList.contains('dark')) {
      html.classList.add('dark');
    }
  } catch (e) {}

  try {
    const handle = localStorage.getItem('${STORAGE_KEY_CURRENT_USER_HANDLE}') || '[anonymous]';
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
      Object.keys(settings.themeColors).forEach(function(key) {
        html.style.setProperty(key, settings.themeColors[key]);
      });
      if (!settings.themeColors['--c-nav-active-bg']) {
        const isInk = settings.themeColors['--theme-color-name'] === '#242424';
        html.style.setProperty('--c-nav-active-bg', (isInk && !isDark) ? '#f0f0f0' : (settings.themeColors['--c-primary-fade'] || 'transparent'));
      }
      if (!settings.themeColors['--c-container-border']) {
        const isInk = settings.themeColors['--theme-color-name'] === '#242424';
        html.style.setProperty('--c-container-border', (isInk && !isDark) ? '#D5D5D5' : (settings.themeColors['--c-border'] || 'transparent'));
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
