<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  alias: ['/signin/callback'],
  pullToRefresh: true,
  hideBottomNavOnScroll: true,
})

const route = useRoute()
const router = useRouter()
if (import.meta.client && route.path === '/signin/callback') {
  watch(currentUser, (user) => {
    if (user)
      router.replace('/home')
  }, { immediate: true })
}

const { t } = useI18n()
useHydratedHead({
  title: () => t('nav.home'),
})
</script>

<template>
  <MainContent>
    <template #title>
      <MainTitle as="router-link" to="/home" icon="i-ri:home-5-line">
        {{ $t('nav.home') }}
      </MainTitle>
    </template>

    <TimelineSkeleton
      v-if="!isHydrated"
      role="status"
      aria-busy="true"
      :aria-label="$t('a11y.loading_page')"
    />
    <TimelineHome v-else-if="currentUser" />
  </MainContent>
</template>
