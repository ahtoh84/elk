<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const { as = 'button', command, disabled, content, icon } = defineProps<{
  text?: string | number
  content: string
  color: string
  icon: string
  activeIcon?: string
  inactiveIcon?: string
  hover: string
  elkGroupHover: string
  active?: boolean
  disabled?: boolean
  as?: string
  command?: boolean
}>()

defineSlots<{
  text: (props: object) => void
}>()

const el = ref<HTMLDivElement>()

useCommand({
  scope: 'Actions',

  order: -2,
  visible: () => command && !disabled,

  name: () => content,
  icon: () => icon,

  onActivate() {
    if (!checkLogin())
      return
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    })
    el.value?.dispatchEvent(clickEvent)
  },
})
</script>

<template>
  <component
    :is="as"
    v-bind="$attrs" ref="el"
    w-fit flex gap-1 items-center select-none status-action-button
    rounded group
    motion-pressable
    :hover=" !disabled ? hover : undefined"
    focus:outline-none
    :focus-visible="hover"
    :class="active ? color : (disabled ? 'text-secondary/50 cursor-not-allowed' : 'text-secondary')"
    :aria-label="content"
    :disabled="disabled"
    :aria-disabled="disabled"
  >
    <CommonTooltip placement="bottom" :content="content">
      <div
        rounded-full p2
        v-bind="disabled ? {} : {
          'elk-group-hover': elkGroupHover,
          'group-focus-visible': elkGroupHover,
          'group-focus-visible:ring': '2 current',
        }"
      >
        <div v-if="activeIcon" class="grid items-center justify-center">
          <div
            class="col-start-1 row-start-1 status-icon-swap"
            :class="[
              active ? 'status-icon-hidden' : 'status-icon-shown',
              disabled && inactiveIcon ? inactiveIcon : icon,
            ]"
          />
          <div
            class="col-start-1 row-start-1 status-icon-swap"
            :class="[
              active ? 'status-icon-shown' : 'status-icon-hidden',
              activeIcon,
            ]"
          />
        </div>
        <div v-else :class="disabled && inactiveIcon ? inactiveIcon : icon" />
      </div>
    </CommonTooltip>

    <CommonAnimateNumber v-if="text !== undefined || $slots.text" :increased="active" text-sm>
      <span text-secondary-light>
        <slot name="text">{{ text }}</slot>
      </span>
      <template #next>
        <span :class="[color]">
          <slot name="text">{{ text }}</slot>
        </span>
      </template>
    </CommonAnimateNumber>
  </component>
</template>

<style scoped>
.status-action-button {
  transition:
    color var(--motion-fast, 80ms) ease-out,
    transform var(--motion-fast, 80ms) var(--ease-fluid, cubic-bezier(0.23, 1, 0.32, 1));
}

.status-icon-swap {
  transition:
    opacity var(--motion-fast, 80ms) ease-out,
    transform var(--motion-fast, 80ms) var(--ease-fluid, cubic-bezier(0.23, 1, 0.32, 1));
}

.status-icon-shown {
  opacity: 1;
  transform: scale(1);
}

.status-icon-hidden {
  opacity: 0;
  transform: scale(0.65);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .status-action-button {
    transition: color var(--motion-fast, 80ms) ease-out;
  }

  .status-icon-swap {
    transition: opacity var(--motion-fast, 80ms) ease-out;
  }

  .status-icon-shown,
  .status-icon-hidden {
    transform: none;
  }
}
</style>
