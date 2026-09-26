<script setup lang="ts">
import type { ThemeColors } from '~/composables/settings'
import { getThemeOptions } from '~/composables/theme-colors'
import { THEME_COLORS } from '~/constants'

const settings = useUserSettings()
const colorMode = useColorMode()

const useThemes = computed(() => getThemeOptions(colorMode.value === 'dark'))

const currentTheme = computed(() => settings.value.themeColors?.['--theme-color-name'] || THEME_COLORS.defaultTheme)

function updateTheme(theme: ThemeColors) {
  // Store a fresh object so the user settings ref and the CSS synchronizer
  // both observe the palette change immediately.
  settings.value.themeColors = { ...theme }
}
</script>

<template>
  <section space-y-2>
    <h2 id="interface-tc" font-medium>
      {{ $t('settings.interface.theme_color') }}
    </h2>
    <div flex="~ gap4 wrap" p2 role="group" aria-labelledby="interface-tc">
      <button
        v-for="[key, theme] in useThemes" :key="key"
        :style="{
          '--theme-preview-rgb': theme['--rgb-primary'],
          'background': 'rgb(var(--theme-preview-rgb))',
          '--local-ring-color': 'rgb(var(--theme-preview-rgb))',
        }"
        type="button"
        :class="currentTheme === theme['--theme-color-name'] ? 'ring-2' : 'scale-90'"
        :aria-pressed="currentTheme === theme['--theme-color-name'] ? 'true' : 'false'"
        :aria-label="theme['--theme-color-label']"
        :title="theme['--theme-color-label']"
        w-8 h-8 rounded-full transition-all
        ring="$local-ring-color offset-3 offset-$c-bg-base"
        @click="updateTheme(theme)"
      />
    </div>
  </section>
</template>
