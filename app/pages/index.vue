<script setup lang="ts">
import { getRootPageState, shouldUseFullscreenSignIn } from '~/utils/auth'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const rootPageState = computed(() => {
  // Keep the sign-in callback page visible while its credentials are being exchanged.
  if (route.path === '/signin/callback' && !currentUser.value)
    return 'sign-in'

  return getRootPageState(isAuthReady.value, !!currentUser.value)
})
const fullscreenSignIn = computed(() =>
  shouldUseFullscreenSignIn(route.path, isAuthReady.value, !!currentUser.value),
)
const isRestoringRootAuth = computed(() => rootPageState.value === 'restoring')
</script>

<template>
  <div
    v-if="isRestoringRootAuth"
    class="fullscreen-root-content"
    role="status"
    aria-busy="true"
    :aria-label="$t('a11y.loading_page')"
  >
    <span i-ri:loader-2-line animate-spin text-2xl text-secondary aria-hidden="true" />
  </div>
  <div v-else-if="fullscreenSignIn" class="fullscreen-root-content">
    <UserSignIn :default-server="publicServer" />
  </div>
  <MainContent v-else>
    <div v-if="rootPageState === 'sign-in'" min-h="[calc(100vh-8rem)]" flex="~ items-center justify-center" p6>
      <UserSignIn :default-server="publicServer" />
    </div>
    <TimelineSkeleton
      v-else
      role="status"
      aria-busy="true"
      :aria-label="$t('a11y.loading_page')"
    />
  </MainContent>
</template>

<style scoped>
.fullscreen-root-content {
  box-sizing: border-box;
  display: grid;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  place-items: center;
  padding: clamp(1.5rem, 5vw, 4rem);
}
</style>
