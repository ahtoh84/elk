<script setup lang="ts">
import { invoke, useScrollLock } from '@vueuse/core'

const modelValue = defineModel<boolean>({ default: false })
const colorMode = useColorMode()
const mobileMoreOpen = useState<boolean>('nav-side-more-open', () => false)
const isBottomNavHidden = useState<boolean>('bottom-nav-hidden', () => false)

const userSettings = useUserSettings()

const drawerEl = ref<HTMLDivElement>()
const isLocked = useScrollLock(import.meta.client ? document.body : null)

function toggleVisible() {
  modelValue.value = !modelValue.value
}

const buttonEl = ref<HTMLDivElement>()
/**
 * Close the drop-down menu if the mouse click is not on the drop-down menu button when the drop-down menu is opened
 * @param mouse
 */
function clickEvent(mouse: MouseEvent) {
  const target = mouse.target as Node | null
  if (target && !buttonEl.value?.contains(target) && !drawerEl.value?.contains(target)) {
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
  isLocked.value = val
  if (val && typeof document !== 'undefined')
    document.addEventListener('click', clickEvent)

  if (!val)
    mobileMoreOpen.value = false
})

onBeforeUnmount(() => {
  isLocked.value = false
  if (typeof document !== 'undefined')
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
    <Teleport to="body">
      <Transition
        enter-active-class="nav-bottom-drawer-enter-active"
        enter-from-class="nav-bottom-drawer-enter-from opacity-0 children:(translate-y-2 scale-98)"
        enter-to-class="opacity-100 children:(translate-y-0)"
        leave-active-class="nav-bottom-drawer-leave-active"
        leave-from-class="opacity-100 children:(translate-y-0)"
        leave-to-class="nav-bottom-drawer-leave-to opacity-0 children:(translate-y-2 scale-98)"
      >
        <div
          v-show="modelValue"
          class="nav-bottom-drawer"
          :class="{ 'nav-bottom-drawer--nav-hidden': isBottomNavHidden }"
          z-20
          @click="modelValue = false"
        >
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
            of-y-auto scrollbar-hide overscroll-contain
            rounded-t-lg bg="white/85 dark:neutral-900/85" backdrop-filter
            border-t-1 border-base
            @click.stop
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
                block px-5 py-2 w-full
                text-sm text-base capitalize text-left whitespace-nowrap
                transition-colors duration-200 transform
                hover:bg-active active:bg-active focus-visible:ring-2 focus-visible:ring-current
                class="nav-drawer-action"
                @click="toggleDark()"
              >
                <span class="i-ri:sun-line dark:i-ri:moon-line flex-shrink-0 text-xl me-4 !align-middle" />
                {{ colorMode.value === 'light' ? $t('menu.toggle_theme.dark') : $t('menu.toggle_theme.light') }}
              </button>

              <!-- Zen Mode -->
              <button
                flex flex-row items-center
                block px-5 py-2 w-full
                text-sm text-base capitalize text-left whitespace-nowrap
                transition-colors duration-200 transform
                hover:bg-active active:bg-active focus-visible:ring-2 focus-visible:ring-current
                class="nav-drawer-action"
                :class="{
                  'nav-drawer-action--active': getPreferences(userSettings, 'zenMode'),
                }"
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
    </Teleport>
  </div>
</template>

<style scoped>
.nav-bottom-drawer-enter-active {
  transition: opacity var(--motion-moderate, 160ms) var(--ease-fluid, cubic-bezier(0.23, 1, 0.32, 1));
}

.nav-bottom-drawer-leave-active {
  transition: opacity var(--motion-moderate-exit, 120ms) var(--ease-fluid-exit, cubic-bezier(0.23, 1, 0.32, 1));
}

.nav-bottom-drawer-panel {
  transform-origin: center bottom;
  max-height: calc(100vh - 200px);
  max-height: calc(100dvh - 200px);
}

.nav-bottom-drawer-panel-dragging {
  transition-duration: 0ms !important;
}

.nav-bottom-drawer {
  position: fixed;
  inset-inline: 0;
  top: 0;
  bottom: calc(3.5rem + env(safe-area-inset-bottom));
  display: flex;
  align-items: flex-end;
  background-color: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  transition: bottom 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.nav-bottom-drawer--nav-hidden {
  bottom: env(safe-area-inset-bottom, 0px);
}

.nav-drawer-action {
  transition:
    background-color var(--motion-moderate, 160ms) ease,
    color var(--motion-moderate, 160ms) ease;
}

.nav-drawer-action--active {
  background-color: var(--c-nav-active-bg, var(--c-primary-fade));
  color: var(--c-primary);
  font-weight: 600;
}

:root.dark .nav-drawer-action--active {
  background-color: var(--c-nav-active-bg, var(--c-primary-fade));
}

@media (prefers-reduced-motion: no-preference) {
  .nav-bottom-drawer-enter-active .nav-bottom-drawer-panel {
    transition: transform var(--motion-moderate, 160ms) var(--ease-fluid, cubic-bezier(0.23, 1, 0.32, 1));
  }

  .nav-bottom-drawer-leave-active .nav-bottom-drawer-panel {
    transition: transform var(--motion-moderate-exit, 120ms) var(--ease-fluid-exit, cubic-bezier(0.23, 1, 0.32, 1));
  }

  .nav-bottom-drawer-panel {
    transition: transform var(--motion-moderate, 160ms) var(--ease-fluid, cubic-bezier(0.23, 1, 0.32, 1));
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-bottom-drawer-enter-active {
    transition: opacity var(--motion-moderate, 160ms) ease-out;
  }

  .nav-bottom-drawer-leave-active {
    transition: opacity var(--motion-moderate-exit, 120ms) ease-out;
  }

  .nav-bottom-drawer-panel {
    transition: none;
  }

  .nav-bottom-drawer-enter-from .nav-bottom-drawer-panel,
  .nav-bottom-drawer-leave-to .nav-bottom-drawer-panel {
    transform: none;
  }
}
</style>
