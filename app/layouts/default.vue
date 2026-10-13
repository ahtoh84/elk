<script setup lang="ts">
import { usePreferences } from '~/composables/settings'
import { shouldUseFullscreenRootEntry } from '~/utils/auth'

const route = useRoute()
const info = useBuildInfo()

const fullscreenRootEntry = computed(() =>
  shouldUseFullscreenRootEntry(route.path, isAuthReady.value, !!currentUser.value),
)
const wideLayout = computed(() => route.meta.wideLayout ?? false)
const isSettingsPage = computed(() => route.path === '/settings' || route.path.startsWith('/settings/'))
provide('isNavCollapsed', isSettingsPage)
const isBottomMoreMenuOpen = useState<boolean>('bottom-more-menu-open', () => false)
const autoHideBottomNavEnabled = computed(() =>
  isHydrated.value
  && isSmallScreen.value
  && !isBottomMoreMenuOpen.value
  && route.meta.hideBottomNavOnScroll === true,
)
const { isHidden: isBottomNavHiddenRaw } = useAutoHideBottomNav(autoHideBottomNavEnabled)
const isBottomNavHidden = computed(() =>
  !isBottomMoreMenuOpen.value && isBottomNavHiddenRaw.value,
)
const isBottomNavHiddenState = useState<boolean>('bottom-nav-hidden', () => false)
watchEffect(() => {
  isBottomNavHiddenState.value = isBottomNavHidden.value
})

const showUserPicker = logicAnd(
  usePreferences('experimentalUserPicker'),
  () => useUsers().value.length > 1,
)

const isGrayscale = usePreferences('grayscaleMode')

const mainEl = ref<HTMLElement>()
watchEffect(() => {
  if (mainEl.value) {
    if (fullscreenRootEntry.value) {
      mainEl.value.classList.add('fullscreen-root-layout')
      mainEl.value.classList.remove('app-workspace-main', 'flex', 'flex-row', 'flex-nowrap', 'mxa', 'lg:max-w-80rem')
    }
    else {
      mainEl.value.classList.remove('fullscreen-root-layout')
      mainEl.value.classList.add('app-workspace-main', 'flex', 'flex-row', 'flex-nowrap', 'mxa', 'lg:max-w-80rem')
    }
  }
})
</script>

<template>
  <div h-full :data-mode="isHydrated && isGrayscale ? 'grayscale' : ''">
    <main
      ref="mainEl"
      class="w-full"
      :class="[
        fullscreenRootEntry
          ? 'fullscreen-root-layout'
          : 'app-workspace-main flex flex-row flex-nowrap mxa lg:max-w-80rem',
      ]"
    >
      <template v-if="!fullscreenRootEntry">
        <aside
          class="shrink-0 zen-hide relative"
          :class="[
            isSettingsPage
              ? 'w-1/8 md:w-1/6 lg:w-20 justify-end lg:justify-center lg:me-0 nav-compact-mode'
              : 'w-1/8 md:w-1/6 lg:w-1/5 xl:w-1/4 justify-end xl:me-4',
          ]"
          hidden sm:flex
        >
          <div
            sticky top-0 h-100dvh flex="~ col"
            :class="isSettingsPage ? 'w-20 items-center' : 'w-20 xl:w-100 lt-xl-items-center'"
          >
            <slot name="left">
              <div flex="~ col" overflow-y-auto justify-between h-full max-w-full overflow-x-hidden>
                <NavTitle />
                <NavSide command variant="desktop" />
                <div flex-auto />
                <div v-if="isHydrated && currentUser" flex flex-col sticky bottom-0 bg-base>
                  <div p6 pb8 w-full class="user-section-pad">
                    <div v-if="!isSettingsPage" hidden xl:block>
                      <UserPicker v-if="showUserPicker" />
                      <div v-else flex="~" items-center justify-between>
                        <NuxtLink
                          hidden xl:block
                          rounded-3 text-primary text-start w-full
                          hover:bg-active cursor-pointer transition-100
                          :to="getAccountRoute(currentUser.account)"
                        >
                          <AccountInfo :account="currentUser.account" md:break-words />
                        </NuxtLink>
                        <UserDropdown />
                      </div>
                    </div>
                    <UserDropdown :compact="isSettingsPage" :class="{ 'xl:hidden': !isSettingsPage }" />
                  </div>
                </div>
              </div>
            </slot>
          </div>
        </aside>
        <div
          class="mobile-viewport-shell" w-full
          :class="isHydrated && wideLayout ? 'lg:w-full sm:w-600px' : 'sm:w-600px md:shrink-0'"
          border-base
        >
          <div class="mobile-viewport-page">
            <slot />
          </div>
          <div
            class="bottom-nav-container"
            :class="{ 'bottom-nav-container--hidden': isBottomNavHidden }"
            sticky left-0 right-0 bottom-0 z-10 bg-base pb="[env(safe-area-inset-bottom)]" transition="padding 20"
          >
            <CommonOfflineChecker v-if="isHydrated" class="offline-checker" />
            <div
              class="bottom-nav-shell"
              :class="{ 'bottom-nav-shell--hidden': isBottomNavHidden }"
              :inert="isBottomNavHidden"
            >
              <NavBottom v-if="isHydrated" sm:hidden />
            </div>
          </div>
        </div>
        <aside v-if="isHydrated && !wideLayout" class="hidden lg:w-1/5 xl:w-1/4 shrink-0 sm:none xl:block zen-hide">
          <div sticky top-0 h-100dvh flex="~ col" gap-2 py3 ms-2>
            <slot name="right">
              <SearchWidget mt-4 mx-1 hidden xl:block />

              <div flex-auto />
              <PwaPrompt />
              <PwaInstallPrompt />
              <LazyCommonPreviewPrompt v-if="info.env === 'preview'" />
              <NavFooter />
            </slot>
          </div>
        </aside>
      </template>
      <slot v-else />
    </main>
    <ModalContainer />
  </div>
</template>

<style scoped>
.app-workspace-main {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  width: 100%;
  margin-inline: auto !important;
  max-width: 80rem;
}

.fullscreen-root-layout {
  display: block !important;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
}

.mobile-viewport-shell {
  min-height: 100vh;
  min-height: 100dvh;
}

.mobile-viewport-page {
  min-height: calc(100vh - 3.5rem);
  min-height: calc(100dvh - 3.5rem);
}

@media (min-width: 640px) {
  .mobile-viewport-page {
    min-height: 100vh;
    min-height: 100dvh;
  }
}

.bottom-nav-container--hidden {
  background: transparent;
  pointer-events: none;
}

.offline-checker {
  transition: opacity var(--motion-moderate-exit, 120ms) ease-out;
}

.bottom-nav-container--hidden .offline-checker {
  transform: translateY(3.5rem);
}

.bottom-nav-shell {
  transition: opacity var(--motion-moderate-exit, 120ms) ease-out;
}

.bottom-nav-shell--hidden {
  pointer-events: none;
  transform: translate3d(0, calc(100% + env(safe-area-inset-bottom, 0px)), 0);
}

@media (prefers-reduced-motion: reduce) {
  .bottom-nav-shell,
  .offline-checker {
    transition: opacity var(--motion-moderate-exit, 120ms) ease-out;
  }

  .bottom-nav-shell--hidden,
  .bottom-nav-container--hidden .offline-checker {
    transform: none;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .bottom-nav-shell,
  .offline-checker {
    transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }
}
</style>
