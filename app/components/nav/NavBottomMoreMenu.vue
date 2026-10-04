<script setup lang="ts">
import { invoke } from '@vueuse/core'

const modelValue = defineModel<boolean>({ default: false })
const colorMode = useColorMode()
const mobileMoreOpen = useState<boolean>('nav-side-more-open', () => false)

const userSettings = useUserSettings()

const drawerEl = ref<HTMLDivElement>()

function toggleVisible() {
  modelValue.value = !modelValue.value
}

const buttonEl = ref<HTMLDivElement>()
/**
 * Close the drop-down menu if the mouse click is not on the drop-down menu button when the drop-down menu is opened
 * @param mouse
 */
function clickEvent(mouse: MouseEvent) {
  if (mouse.target && !buttonEl.value?.contains(mouse.target as Node)) {
    if (modelValue.value) {
      document.removeEventListener('click', clickEvent)
      modelValue.value = false
    }
  }
}

function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

watch(modelValue, (val) => {
  if (val && typeof document !== 'undefined')
    document.addEventListener('click', clickEvent)

  if (!val)
    mobileMoreOpen.value = false
})

onBeforeUnmount(() => {
  document.removeEventListener('click', clickEvent)
})

// Pull down to close
const { dragging, dragDistance } = invoke(() => {
  const triggerDistance = 120

  let scrollTop = 0
  let beforeTouchPointY = 0

  const dragDistance = ref(0)
  const dragging = ref(false)

  useEventListener(drawerEl, 'scroll', (e: Event) => {
    scrollTop = (e.target as HTMLDivElement).scrollTop

    // Prevent the page from scrolling when the drawer is being dragged.
    if (dragDistance.value > 0)
      (e.target as HTMLDivElement).scrollTop = 0
  }, { passive: true })

  useEventListener(drawerEl, 'touchstart', (e: TouchEvent) => {
    if (!modelValue.value)
      return

    beforeTouchPointY = e.touches[0].pageY
    dragDistance.value = 0
  }, { passive: true })

  useEventListener(drawerEl, 'touchmove', (e: TouchEvent) => {
    if (!modelValue.value)
      return

    // Do not move the entire drawer when its contents are not scrolled to the top.
    if (scrollTop > 0 && dragDistance.value <= 0) {
      dragging.value = false
      beforeTouchPointY = e.touches[0].pageY
      return
    }

    const { pageY } = e.touches[0]

    // Calculate the drag distance.
    dragDistance.value += pageY - beforeTouchPointY
    if (dragDistance.value < 0)
      dragDistance.value = 0
    beforeTouchPointY = pageY

    // Marked as dragging.
    if (dragDistance.value > 1)
      dragging.value = true

    // Prevent the page from scrolling when the drawer is being dragged.
    if (dragDistance.value > 0) {
      if (e?.cancelable && e?.preventDefault)
        e.preventDefault()
      e?.stopPropagation()
    }
  }, { passive: true })

  useEventListener(drawerEl, 'touchend', () => {
    if (!modelValue.value)
      return

    if (dragDistance.value >= triggerDistance)
      modelValue.value = false

    dragging.value = false
    // code
  }, { passive: true })

  return {
    dragDistance,
    dragging,
  }
})
</script>

<template>
  <div ref="buttonEl" flex items-center static>
    <slot :toggle-visible="toggleVisible" :show="modelValue" />

    <!-- Drawer -->
    <Transition
      enter-active-class="nav-bottom-drawer-transition"
      enter-from-class="nav-bottom-drawer-enter-from opacity-0 children:(translate-y-2 scale-98)"
      enter-to-class="opacity-100 children:(translate-y-0)"
      leave-active-class="nav-bottom-drawer-transition"
      leave-from-class="opacity-100 children:(translate-y-0)"
      leave-to-class="nav-bottom-drawer-leave-to opacity-0 children:(translate-y-2 scale-98)"
    >
      <div
        v-show="modelValue"
        class="nav-bottom-drawer" z-20 h-100dvh
        flex items-end of-y-scroll of-x-hidden scrollbar-hide overscroll-none
        bg="black/50"
      >
        <!-- The style `scrollbar-hide overscroll-none overflow-y-scroll mb="-1px"` and `h="[calc(100%+0.5px)]"` is used to implement scroll locking, -->
        <!-- corresponding to issue: #106, so please don't remove it. -->
        <div absolute inset-0 opacity-0 h="[calc(100vh+0.5px)]" />
        <div
          ref="drawerEl"
          class="nav-bottom-drawer-panel"
          :style="{
            transform: dragging ? `translateY(${dragDistance}px)` : '',
          }"
          :class="{
            'nav-bottom-drawer-panel-dragging': dragging,
            'backdrop-blur-md': !getPreferences(userSettings, 'optimizeForLowPerformanceDevice'),
          }"
          flex-1 min-w-48 py-6 mb="-1px"
          of-y-auto scrollbar-hide overscroll-none
          rounded-t-lg bg="white/85 dark:neutral-900/85" backdrop-filter
          border-t-1 border-base
        >
          <!-- Nav -->
          <NavSide variant="mobile" />

          <!-- Divider line -->
          <div border="neutral-300 dark:neutral-700 t-1" m="x-3 y-2" />

          <!-- Function menu -->
          <div flex="~ col gap2">
            <!-- Toggle Theme -->
            <button
              flex flex-row items-center
              block px-5 py-2 focus-blue w-full
              text-sm text-base capitalize text-left whitespace-nowrap
              transition-colors duration-200 transform
              hover="bg-gray-100 dark:(bg-gray-700 text-white)"
              @click="toggleDark()"
            >
              <span class="i-ri:sun-line dark:i-ri:moon-line flex-shrink-0 text-xl me-4 !align-middle" />
              {{ colorMode.value === 'light' ? $t('menu.toggle_theme.dark') : $t('menu.toggle_theme.light') }}
            </button>

            <!-- Zen Mode -->
            <button
              flex flex-row items-center
              block px-5 py-2 focus-blue w-full
              text-sm text-base capitalize text-left whitespace-nowrap
              transition-colors duration-200 transform
              hover="bg-gray-100 dark:(bg-gray-700 text-white)"
              :aria-label="$t('nav.zen_mode')"
              @click="togglePreferences('zenMode')"
            >
              <span :class="getPreferences(userSettings, 'zenMode') ? 'i-ri:layout-right-2-line' : 'i-ri:layout-right-line'" class="flex-shrink-0 text-xl me-4 !align-middle" />
              {{ $t('nav.zen_mode') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.nav-bottom-drawer-transition {
  transition: opacity 220ms cubic-bezier(0.23, 1, 0.32, 1);
}

.nav-bottom-drawer-panel {
  transform-origin: center bottom;
  max-height: calc(100vh - 200px);
  max-height: calc(100dvh - 200px);
  transition: transform 220ms cubic-bezier(0.23, 1, 0.32, 1);
}

.nav-bottom-drawer-panel-dragging {
  transition-duration: 0ms;
}

.nav-bottom-drawer {
  position: fixed;
  inset-inline: 0;
  bottom: calc(3.5rem + env(safe-area-inset-bottom));
}

@media (prefers-reduced-motion: reduce) {
  .nav-bottom-drawer-transition {
    transition: opacity 120ms ease-out;
  }

  .nav-bottom-drawer-panel {
    transition-duration: 0ms;
  }

  .nav-bottom-drawer-enter-from .nav-bottom-drawer-panel,
  .nav-bottom-drawer-leave-to .nav-bottom-drawer-panel {
    transform: none;
  }
}
</style>
