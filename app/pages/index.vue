<script setup lang="ts">
import { getRootPageState } from '~/utils/auth'

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
</script>

<template>
  <MainContent>
    <div min-h="[calc(100vh-8rem)]" flex="~ items-center justify-center" p6>
      <UserSignIn v-if="rootPageState === 'sign-in'" :default-server="publicServer" />
      <div v-else role="status" aria-busy="true">
        <span block i-ri:loader-2-fill animate-spin text-xl text-secondary aria-hidden="true" />
        <span sr-only>{{ $t('state.loading') }}</span>
      </div>
    </div>
  </MainContent>
</template>
