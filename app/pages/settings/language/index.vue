<script setup lang="ts">
import type { ElkTranslationStatus } from '#shared/types/translation-status'

const { t, locale } = useI18n()

const translationStatus: ElkTranslationStatus = await import('~~/elk-translation-status.json').then(m => m.default)

useHydratedHead({
  title: () => `${t('settings.language.label')} | ${t('nav.settings')}`,
})
const status = computed(() => {
  const entry = translationStatus.locales[locale.value]
  return t('settings.language.status', [entry.total, translationStatus.total, entry.percentage])
})
</script>

<template>
  <MainContent back="small-only">
    <template #title>
      <MainTitle as="h1" secondary>
        {{ $t('settings.language.label') }}
      </MainTitle>
    </template>
    <div class="settings-detail-content">
      <section class="settings-section">
        <h2 class="settings-section-title">
          {{ $t('settings.language.display_language') }}
        </h2>
        <p class="settings-section-description">
          {{ status }}
        </p>
        <SettingsLanguage select-settings />
        <NuxtLink
          href="https://docs.elk.zone/guide/contributing"
          target="_blank"
          class="settings-inline-link"
        >
          <span inline-block i-ri:information-line />
          {{ $t('settings.language.how_to_contribute') }}
        </NuxtLink>
      </section>
      <section class="settings-section">
        <h2 class="settings-section-title">
          {{ $t('settings.language.post_language') }}
        </h2>
        <SettingsItem
          v-if="currentUser"
          command large
          icon="i-ri:quill-pen-line"
          :text="$t('settings.language.post_language')"
          :description="$t('settings.account_settings.description')"
          :to="`https://${currentUser!.server}/settings/preferences/other`"
          external target="_blank"
        />
      </section>
      <section class="settings-section">
        <h2 class="settings-section-title">
          {{ $t('settings.language.translations.heading') }}
        </h2>
        <SettingsTranslations />
      </section>
    </div>
  </MainContent>
</template>
