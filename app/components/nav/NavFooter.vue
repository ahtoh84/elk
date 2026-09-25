<script setup lang="ts">
const config = useRuntimeConfig()
const userSettings = useUserSettings()

const colorMode = useColorMode()
function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <footer p4 text-sm text-secondary-light flex="~ col">
    <div flex="~ gap2" items-center mb4>
      <CommonTooltip :content="$t('nav.toggle_theme')">
        <button flex dark-i-ri:sun-line i-ri:moon-line text-lg :aria-label="$t('nav.toggle_theme')" @click="toggleDark()" />
      </CommonTooltip>
      <CommonTooltip :content="$t('nav.zen_mode')">
        <button
          flex
          text-lg
          :class="getPreferences(userSettings, 'zenMode') ? 'i-ri:layout-right-2-line' : 'i-ri:layout-right-line'"
          :aria-label="$t('nav.zen_mode')"
          @click="togglePreferences('zenMode')"
        />
      </CommonTooltip>
      <CommonTooltip :content="$t('magic_keys.dialog_header')">
        <button flex i-ri:keyboard-box-line dark-i-ri:keyboard-box-line text-lg :aria-label="$t('magic_keys.dialog_header')" @click="toggleKeyboardShortcuts" />
      </CommonTooltip>
    </div>
    <div>
      <NuxtLink href="https://qaf.men" target="_blank" external hover:underline>
        QAF.MEN
      </NuxtLink>
      <span> based on </span>
      <NuxtLink href="https://github.com/elk-zone/elk" target="_blank" external hover:underline>
        Elk
      </NuxtLink>
      <span>.</span>
      <template v-if="config.public.privacyPolicyUrl">
        <span> · </span>
        <NuxtLink cursor-pointer hover:underline :to="config.public.privacyPolicyUrl">
          {{ $t('nav.privacy') }}
        </NuxtLink>
      </template>
    </div>
  </footer>
</template>
