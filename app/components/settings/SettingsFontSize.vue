<script setup lang="ts">
import type { FontSize } from '~/composables/settings'
import { DEFAULT_FONT_SIZE } from '~/constants'

const userSettings = useUserSettings()

const sizes = (Array.from({ length: 11 })).fill(0).map((x, i) => `${10 + i}px`) as FontSize[]

function setFontSize(e: Event) {
  if (e.target && 'valueAsNumber' in e.target)
    userSettings.value.fontSize = sizes[e.target.valueAsNumber as number]
}
</script>

<template>
  <section class="settings-font-size">
    <div class="settings-control-heading">
      <h2 id="interface-fs" class="settings-control-title">
        {{ $t('settings.interface.font_size') }}
      </h2>
      <output for="interface-font-size" class="settings-control-value">
        {{ userSettings.fontSize }}{{ userSettings.fontSize === DEFAULT_FONT_SIZE ? $t('settings.interface.default') : '' }}
      </output>
    </div>
    <p class="settings-type-preview" :style="{ fontSize: userSettings.fontSize }">
      {{ $t('app_desc_short') }}
    </p>
    <div class="settings-font-slider">
      <span aria-hidden="true" text-xs>Aa</span>
      <input
        id="interface-font-size"
        class="settings-font-range"
        aria-labelledby="interface-fs"
        :value="sizes.indexOf(userSettings.fontSize)"
        :aria-valuetext="`${userSettings.fontSize}${userSettings.fontSize === DEFAULT_FONT_SIZE ? ` ${$t('settings.interface.default')}` : ''}`"
        :min="0"
        :max="sizes.length - 1"
        :step="1"
        type="range"
        @change="setFontSize"
      >
      <span aria-hidden="true" text-xl>Aa</span>
    </div>
  </section>
</template>
