<script setup lang="ts">
import type { CommonRouteTabOption } from '#shared/types'

definePageMeta({
  middleware: 'auth',
})

const { t } = useI18n()

const tabs = computed<CommonRouteTabOption[]>(() => [
  {
    name: 'conversations',
    to: '/conversations',
    display: t('nav.conversations'),
  },
])

useHydratedHead({
  title: () => t('nav.conversations'),
})
</script>

<template>
  <MainContent>
    <template #title>
      <MainTitle as="router-link" to="/conversations" icon="i-ri:at-line">
        {{ t('nav.conversations') }}
      </MainTitle>
    </template>

    <template #header>
      <CommonRouteTabs replace :options="tabs" />
    </template>

    <TimelineConversations v-if="isHydrated" />
  </MainContent>
</template>
