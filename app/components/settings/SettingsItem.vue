<script setup lang="ts">
const { text, description, icon, to, command, external, target, navigation } = defineProps<{
  text?: string
  content?: string
  description?: string
  icon?: string
  to?: string | Record<string, string>
  command?: boolean
  disabled?: boolean
  external?: true
  large?: true
  navigation?: true
  match?: boolean
  target?: string
}>()

const router = useRouter()
const scrollOnClick = computed(() => to && !(target === '_blank' || external))

useCommand({
  scope: 'Settings',

  name: () => text
    ?? (to
      ? typeof to === 'string'
        ? to
        : to.name
      : ''
    ),
  description: () => description,
  icon: () => icon || '',
  visible: () => command && to,

  onActivate() {
    router.push(to!)
  },
})
</script>

<template>
  <NuxtLink
    :disabled="disabled"
    :to="to"
    :external="external"
    :target="target"
    exact-active-class="text-primary"
    :class="[
      navigation ? 'settings-nav-link' : 'settings-item-link',
      disabled ? 'op25 pointer-events-none' : '',
      match ? 'text-primary' : '',
      navigation && match ? 'settings-nav-link-active' : '',
    ]"
    :aria-current="match ? 'page' : undefined"
    block w-full group focus:outline-none
    :tabindex="disabled ? -1 : undefined"
    @click="scrollOnClick ? $scrollToTop() : undefined"
  >
    <div
      class="settings-item-row"
      w-full flex px5 py3 md:gap2 gap4 items-center
      transition-150 group-hover:bg-active
      group-focus-visible:ring="2 current"
    >
      <div flex-1 flex items-center md:gap2 gap4>
        <div
          v-if="$slots.icon || icon"
          flex items-center justify-center flex-shrink-0
          :class="$slots.description ? 'w-12 h-12' : ''"
        >
          <slot name="icon">
            <div
              v-if="icon"
              :class="[icon, large ? 'text-xl mr-1' : 'text-xl md:text-size-inherit']"
            />
          </slot>
        </div>
        <div flex="~ col gap-0.5">
          <p>
            <slot>
              <span v-if="navigation" class="inline-grid select-none">
                <span class="col-start-1 row-start-1 transition-colors duration-160" :class="match ? 'font-semibold' : 'font-normal'">{{ text }}</span>
                <span aria-hidden="true" class="col-start-1 row-start-1 invisible font-semibold pointer-events-none select-none">{{ text }}</span>
              </span>
              <span v-else>{{ text }}</span>
            </slot>
          </p>
          <p v-if="$slots.description || description" text-sm text-secondary>
            <slot name="description">
              {{ description }}
            </slot>
          </p>
        </div>
      </div>
      <p v-if="$slots.content || content" text-sm text-secondary>
        <slot name="content">
          {{ content }}
        </slot>
      </p>
      <div v-if="to" :class="!external ? 'i-ri:arrow-right-s-line' : 'i-ri:external-link-line'" text-xl text-secondary-light class="rtl-flip" />
    </div>
  </NuxtLink>
</template>
