<script setup lang="ts">
const { back = false, flushTop = false, noOverflowHidden = false } = defineProps<{
  /**
   * Should we show a back button?
   * Note: this will be forced to false on xl screens to avoid duplicating the sidebar's back button.
   */
  back?: boolean | 'small-only'
  /** Show the back button on small screens */
  backOnSmallScreen?: boolean
  /** Do not applying overflow hidden to let use floatable components in title */
  noOverflowHidden?: boolean
  /** Attach the first body element to the top edge of the content panel */
  flushTop?: boolean
}>()

const container = ref()
const body = ref<HTMLElement>()
const route = useRoute()
const userSettings = useUserSettings()
const { height: windowHeight } = useWindowSize()
const { height: containerHeight } = useElementBounding(container)
const pullToRefreshContext = providePullToRefresh()
const isPullToRefreshEnabled = computed(() => route.meta.pullToRefresh === true && isHydrated.value && pullToRefreshContext.hasHandlers.value)
const { pullDistance, isDragging, isRefreshing } = usePullToRefresh(body, pullToRefreshContext.refresh, isPullToRefreshEnabled)
const wideLayout = computed(() => route.meta.wideLayout ?? false)
const sticky = computed(() => route.path?.startsWith('/settings/'))
const containerClass = computed(() => {
  // we keep original behavior when not in settings page and when the window height is smaller than the container height
  if (!isHydrated.value || !sticky.value || (windowHeight.value < containerHeight.value))
    return null

  return 'lg:sticky lg:top-0'
})

const showBackButton = computed(() => {
  switch (back) {
    case 'small-only':
      return isSmallOrMediumScreen.value
    case true:
      return !isExtraLargeScreen.value
    default:
      return false
  }
})

interface NavAutoHideContext {
  isHidden: ComputedRef<boolean>
  isDragging: ComputedRef<boolean>
  progress: ComputedRef<number>
}

const navAutoHide = inject<NavAutoHideContext | null>('navAutoHide', null)
const isHeaderHidden = computed(() => navAutoHide?.isHidden.value ?? false)
const isHeaderDragging = computed(() => navAutoHide?.isDragging.value ?? false)
const headerProgress = computed(() => navAutoHide?.progress.value ?? 0)
</script>

<template>
  <div ref="container" :class="containerClass">
    <div
      v-if="isPullToRefreshEnabled"
      class="pull-to-refresh-indicator"
      :class="{ 'pull-to-refresh-indicator--dragging': isDragging }"
      :style="{
        opacity: isRefreshing ? 1 : Math.min(pullDistance / 36, 1),
        transform: `translate3d(-50%, ${Math.max(-44, pullDistance - 44)}px, 0)`,
      }"
      role="status"
      aria-live="polite"
      :aria-hidden="!isRefreshing"
    >
      <div class="i-ri:refresh-line" :class="{ 'animate-spin': isRefreshing }" />
      <span v-if="isRefreshing" sr-only>{{ $t('timeline.refreshing') }}</span>
    </div>
    <div
      class="main-content-header-container"
      sticky top-0 z-20
      pt="[env(safe-area-inset-top,0)]"
      bg="[rgba(var(--rgb-bg-base),0.7)]"
      :class="{
        'backdrop-blur': !getPreferences(userSettings, 'optimizeForLowPerformanceDevice'),
        'main-content-header-container--hidden': isHeaderHidden && !isHeaderDragging,
        'main-content-header-container--dragging': isHeaderDragging,
      }"
      :style="isHeaderDragging ? { transform: `translate3d(0, calc(-${headerProgress} * 100%), 0)` } : undefined"
      :inert="isHeaderHidden && !isHeaderDragging"
    >
      <div
        class="main-content-header" flex="~ justify-between" min-h-53px px-2 py-1
        :class="{ 'xl:hidden': $route.name !== 'tag' && !($route.path === '/settings' || $route.path.startsWith('/settings/')) }"
        border="b base"
      >
        <div flex="~ items-center" w-full>
          <button
            v-if="backOnSmallScreen || showBackButton"
            btn-text flex items-center p-3 xl:hidden
            :aria-label="$t('nav.back')"
            @click="$router.go(-1)"
          >
            <div text-lg i-ri:arrow-left-line class="rtl-flip" />
          </button>
          <div flex w-full>
            <slot name="title" />
          </div>
          <div sm:hidden h-7 w-1px />
        </div>
        <div flex="~ items-center shrink-0 gap-x-2" px-3>
          <slot name="actions" />
          <PwaBadge xl:hidden />
          <NavUser v-if="isHydrated" />
          <NavUserSkeleton v-else />
        </div>
      </div>
      <slot name="header">
        <div hidden />
      </slot>
    </div>
    <PwaInstallPrompt xl:hidden />
    <div
      ref="body"
      class="main-content-body"
      :style="noOverflowHidden ? { overflow: 'visible' } : undefined"
      :class="isHydrated && wideLayout ? 'xl:w-full sm:max-w-600px' : 'sm:max-w-600px md:shrink-0'"
      m-auto
    >
      <div class="main-content-top-spacer" hidden :class="{ 'xl:block': !flushTop && $route.name !== 'tag' && !$slots.header }" h-6 />
      <slot />
    </div>
  </div>
</template>

<style scoped>
.pull-to-refresh-indicator {
  position: fixed;
  z-index: 30;
  top: env(safe-area-inset-top, 0px);
  left: 50%;
  display: flex;
  width: 2.25rem;
  height: 2.25rem;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--c-border) 70%, transparent);
  border-radius: 9999px;
  background: rgb(var(--rgb-bg-base));
  color: var(--c-primary);
  pointer-events: none;
  box-shadow: 0 2px 8px rgb(0 0 0 / 12%);
  transition: transform 180ms ease, opacity 180ms ease;
}

.pull-to-refresh-indicator--dragging {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .pull-to-refresh-indicator {
    transition-duration: 0ms;
  }
}

.main-content-header-container {
  will-change: transform;
}

.main-content-header-container--dragging {
  transition: none !important;
}

.main-content-header-container--hidden {
  pointer-events: none;
  transform: translate3d(0, -100%, 0);
}

@media (min-width: 640px) {
  .main-content-header-container {
    transform: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .main-content-header-container {
    transition: opacity var(--motion-moderate-exit, 120ms) ease-out;
  }

  .main-content-header-container--hidden {
    transform: none;
    opacity: 0;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .main-content-header-container {
    transition: transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1);
  }
}
</style>
