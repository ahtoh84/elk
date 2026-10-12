<script setup lang="ts">
import type { ColorMode } from '~/composables/settings'

const colorMode = useColorMode()

function setColorMode(mode: ColorMode) {
  colorMode.preference = mode
}

const modes = [
  {
    icon: 'i-ri-moon-line',
    label: 'settings.interface.dark_mode',
    mode: 'dark',
  },
  {
    icon: 'i-ri-sun-line',
    label: 'settings.interface.light_mode',
    mode: 'light',
  },
  {
    icon: 'i-ri-computer-line',
    label: 'settings.interface.system_mode',
    mode: 'system',
  },
] as const
</script>

<template>
  <section class="settings-color-mode">
    <h2 id="interface-cm" class="settings-control-title">
      {{ $t('settings.interface.color_mode') }}
    </h2>
    <div class="settings-mode-options" role="group" aria-labelledby="interface-cm">
      <button
        v-for="{ icon, label, mode } in modes"
        :key="mode"
        type="button"
        class="settings-mode-option"
        :aria-pressed="colorMode.preference === mode ? 'true' : 'false'"
        @click="setColorMode(mode)"
      >
        <span aria-hidden="true" class="settings-mode-preview" :class="`settings-mode-preview--${mode}`">
          <span class="settings-mode-preview-sidebar"><span /><span /><span /></span>
          <span class="settings-mode-preview-content"><span /><span /><span /></span>
        </span>
        <span class="settings-mode-label">
          <span aria-hidden="true" :class="icon" />
          <span>{{ $t(label) }}</span>
          <span v-if="colorMode.preference === mode" aria-hidden="true" class="settings-mode-check i-ri:checkbox-circle-fill" />
        </span>
      </button>
    </div>
  </section>
</template>
