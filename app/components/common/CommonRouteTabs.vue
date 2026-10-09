<script setup lang="ts">
import type { CommonRouteTabMoreOption, CommonRouteTabOption } from '#shared/types'

const { options, command, preventScrollTop = false } = defineProps<{
  options: CommonRouteTabOption[]
  moreOptions?: CommonRouteTabMoreOption
  command?: boolean
  replace?: boolean
  preventScrollTop?: boolean
}>()

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

useCommands(() => command
  ? options.map(tab => ({
      scope: 'Tabs',
      name: tab.display,
      icon: tab.icon ?? 'i-ri:file-list-2-line',
      onActivate: () => router.replace(tab.to),
    }))
  : [])

const containerEl = ref<HTMLElement>()
const indicatorStyle = ref<{ left: number, width: number, ready: boolean }>({
  left: 0,
  width: 0,
  ready: false,
})

function updateIndicator(target?: HTMLElement) {
  if (!containerEl.value)
    return
  const activeLink = target || containerEl.value.querySelector('.route-tab-active') as HTMLElement | null
  if (activeLink) {
    const textEl = activeLink.querySelector('.route-tab-label') as HTMLElement | null || activeLink
    const containerRect = containerEl.value.getBoundingClientRect()
    const textRect = textEl.getBoundingClientRect()
    const left = textRect.left - containerRect.left + containerEl.value.scrollLeft
    const width = textRect.width
    if (width > 0) {
      indicatorStyle.value = {
        left,
        width,
        ready: true,
      }
    }
  }
}

function handleTabClick(event: MouseEvent) {
  if (!preventScrollTop)
    $scrollToTop()
  const currentTarget = event.currentTarget as HTMLElement
  if (currentTarget)
    updateIndicator(currentTarget)
}

onMounted(() => {
  nextTick(() => {
    updateIndicator()
    setTimeout(updateIndicator, 100)
    setTimeout(updateIndicator, 300)
  })
})

watch(() => route.fullPath, () => {
  nextTick(() => {
    updateIndicator()
    setTimeout(updateIndicator, 60)
  })
})

watch(() => options, () => {
  nextTick(() => {
    updateIndicator()
  })
}, { deep: true })

useResizeObserver(containerEl, () => {
  updateIndicator()
})
</script>

<template>
  <div ref="containerEl" relative flex w-full items-center lg:text-lg of-x-auto scrollbar-hide border="b base">
    <!-- Physical Gliding Indicator Bar -->
    <div
      class="route-tab-indicator"
      :style="{
        transform: `translate3d(${indicatorStyle.left}px, 0, 0)`,
        width: `${indicatorStyle.width}px`,
        opacity: indicatorStyle.ready ? 1 : 0,
      }"
      aria-hidden="true"
    />

    <template
      v-for="(option, index) in options.filter(item => !item.hide)"
      :key="option?.name || index"
    >
      <NuxtLink
        v-if="!option.disabled"
        :to="option.to"
        :replace="replace"
        relative flex flex-auto cursor-pointer sm:px6 px2 rounded
        tabindex="0"
        hover:bg-active
        class="route-tab-link"
        exact-active-class="route-tab-active children:(text-secondary !text-base)"
        @click="handleTabClick($event)"
      >
        <span
          ws-nowrap mxa sm:px2 sm:py3 xl:pb4 xl:pt5 py2 text-center
          text-secondary-light hover:text-secondary
          class="route-tab-label"
        >
          {{ option.display || '&nbsp;' }}
        </span>
      </NuxtLink>
      <div v-else flex flex-auto sm:px6 px2 xl:pb4 xl:pt5>
        <span ws-nowrap mxa sm:px2 sm:py3 py2 text-center text-secondary-light op60>{{ option.display }}</span>
      </div>
    </template>
    <template v-if="isHydrated && moreOptions?.options?.length">
      <CommonDropdown placement="bottom" flex cursor-pointer mx-1.25rem>
        <CommonTooltip placement="top" :content="moreOptions.tooltip || t('action.more')">
          <button
            cursor-pointer
            flex
            gap-1
            w-12
            rounded
            hover:bg-active
            btn-action-icon
            op75
            px4
            group
            :aria-label="t('action.more')"
            :class="moreOptions.match ? 'text-primary' : 'text-secondary'"
          >
            <span v-if="moreOptions.icon" :class="moreOptions.icon" text-sm me--1 block />
            <span i-ri:arrow-down-s-line text-sm me--1 block />
          </button>
        </CommonTooltip>
        <template #popper>
          <NuxtLink
            v-for="(option, index) in moreOptions.options.filter(item => !item.hide)"
            :key="option?.name || index"
            :to="option.to"
          >
            <CommonDropdownItem>
              <span flex="~ row" gap-x-4 items-center :class="option.match ? 'text-primary' : ''">
                <span v-if="option.icon" :class="[option.icon, option.match ? 'text-primary' : 'text.secondary']" text-md me--1 block />
                <span v-else block>&#160;</span>
                <span>{{ option.display }}</span>
              </span>
            </CommonDropdownItem>
          </NuxtLink>
        </template>
      </CommonDropdown>
    </template>
  </div>
</template>

<style scoped>
.route-tab-link {
  transition: background-color var(--motion-fast, 80ms) ease;
}

.route-tab-label {
  transition: color var(--motion-moderate, 160ms) ease;
}

.route-tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: var(--c-primary);
  border-radius: 9999px;
  pointer-events: none;
  z-index: 1;
  transition:
    transform var(--motion-moderate, 160ms) var(--ease-fluid, cubic-bezier(0.23, 1, 0.32, 1)),
    width var(--motion-moderate, 160ms) var(--ease-fluid, cubic-bezier(0.23, 1, 0.32, 1)),
    opacity var(--motion-fast, 80ms) ease;
}

@media (prefers-reduced-motion: reduce) {
  .route-tab-indicator {
    transition: opacity 120ms ease-out;
  }
}
</style>
