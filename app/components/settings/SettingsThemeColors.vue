<script setup lang="ts">
import type { ThemeColors } from '~/composables/settings'
import { getThemeOptions } from '~/composables/theme-colors'
import { THEME_COLORS } from '~/constants'

const settings = useUserSettings()
const colorMode = useColorMode()

const useThemes = computed(() => getThemeOptions(colorMode.value === 'dark'))

const currentTheme = computed(() => settings.value.themeColors?.['--theme-color-name'] || THEME_COLORS.defaultTheme)
const currentThemeLabel = computed(() => useThemes.value.find(([, theme]) => theme['--theme-color-name'] === currentTheme.value)?.[1]['--theme-color-label'])

function updateTheme(theme: ThemeColors) {
  // Store a fresh object so the user settings ref and the CSS synchronizer
  // both observe the palette change immediately.
  settings.value.themeColors = { ...theme }
}
</script>

<template>
  <section class="settings-theme-colors">
    <div class="settings-control-heading">
      <h2 id="interface-tc" class="settings-control-title">
        {{ $t('settings.interface.theme_color') }}
      </h2>
      <span class="settings-control-value">{{ currentThemeLabel }}</span>
    </div>
    <div class="settings-theme-options" role="group" aria-labelledby="interface-tc">
      <button
        v-for="[key, theme] in useThemes" :key="key"
        :style="{
          '--theme-preview-rgb': theme['--rgb-primary'],
        }"
        type="button"
        :aria-pressed="currentTheme === theme['--theme-color-name'] ? 'true' : 'false'"
        :aria-label="theme['--theme-color-label']"
        :title="theme['--theme-color-label']"
        class="settings-theme-swatch"
        @click="updateTheme(theme)"
      >
        <span aria-hidden="true" class="settings-theme-color" />
        <span v-if="currentTheme === theme['--theme-color-name']" aria-hidden="true" class="settings-theme-check">
          <span class="i-ri:check-line" />
        </span>
      </button>
    </div>
  </section>
</template>
