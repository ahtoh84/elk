<script setup lang="ts">
const { t } = useI18n()

useHydratedHead({
  title: () => `${t('settings.interface.label')} | ${t('nav.settings')}`,
})
</script>

<template>
  <MainContent back="small-only">
    <template #title>
      <MainTitle as="h1" secondary>
        {{ $t('settings.interface.label') }}
      </MainTitle>
    </template>
    <div class="settings-detail-content settings-interface-content">
      <div class="settings-appearance-group">
        <SettingsColorMode />
        <SettingsThemeColors />
      </div>
      <SettingsFontSize />
      <SettingsBottomNav />
    </div>
  </MainContent>
</template>
