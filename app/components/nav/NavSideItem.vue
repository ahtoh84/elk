<script setup lang="ts">
const { text, icon, to, userOnly = false, command } = defineProps<{
  text?: string
  icon: string
  to: string | Record<string, string>
  userOnly?: boolean
  command?: boolean
}>()

defineSlots<{
  icon: (props: object) => void
  default: (props: object) => void
}>()

const router = useRouter()

useCommand({
  scope: 'Navigation',

  name: () => text ?? (typeof to === 'string' ? to as string : to.name),
  icon: () => icon,
  visible: () => command,

  onActivate() {
    router.push(to)
  },
})

const route = useRoute()
const isItemActive = computed(() => {
  if (!to)
    return false
  const targetPath = typeof to === 'string' ? to : (to.path || '')
  if (!targetPath)
    return false
  const currentPath = route.path
  if (currentPath === targetPath || (targetPath !== '/' && currentPath.startsWith(`${targetPath}/`)))
    return true
  const server = currentServer.value
  if (server && currentPath.startsWith(`/${server}/`)) {
    const withoutServer = currentPath.slice(server.length + 1)
    if (withoutServer === targetPath || (targetPath !== '/' && withoutServer.startsWith(`${targetPath}/`)))
      return true
  }
  return false
})

const activeClass = ref('nav-side-item-active')
onHydrated(async () => {
  // TODO: force NuxtLink to reevaluate, we now we are in this route though, so we should force it to active
  // we don't have currentServer defined until later
  activeClass.value = ''
  await nextTick()
  activeClass.value = 'nav-side-item-active'
})

// Optimize rendering for the common case of being logged in, only show visual feedback for disabled user-only items
// when we know there is no user.
const noUserDisable = computed(() => !isHydrated.value || (userOnly && !currentUser.value))
const noUserVisual = computed(() => isHydrated.value && userOnly && !currentUser.value)
const isNavCollapsed = inject<Ref<boolean>>('isNavCollapsed', ref(false))
const navSideVariant = inject<Ref<'desktop' | 'mobile'> | 'desktop' | 'mobile'>('navSideVariant', 'desktop')
const isMobileVariant = computed(() => unref(navSideVariant) === 'mobile')
const isCollapsed = computed(() => !isMobileVariant.value && Boolean(unref(isNavCollapsed)))
</script>

<template>
  <NuxtLink
    :to="to"
    :disabled="noUserDisable"
    :class="noUserVisual ? 'op50 pointer-events-none ' : ''"
    :active-class="activeClass"
    exact-active-class="nav-side-item-exact-active"
    group focus:outline-none disabled:pointer-events-none
    :tabindex="noUserDisable ? -1 : undefined"
    @click="$scrollToTop"
  >
    <CommonTooltip :disabled="!isMediumOrLargeScreen" :content="text" placement="right">
      <div
        class="item"
        flex items-center gap4
        :class="[
          isItemActive ? 'item--active' : '',
          isCollapsed ? 'nav-side-item--compact' : (isMobileVariant ? '' : 'xl:ml0 xl:mr5 xl:px5 xl:w-auto'),
          (isMobileVariant || (isSmallScreen && !isCollapsed))
            ? `
              w-full
              px5 sm:mxa
              transition-colors duration-200 transform
              hover:bg-active active:bg-active
            ` : `
              w-fit rounded-3
              px2 mx3 sm:mxa
              transition-100
              ${!isItemActive ? 'elk-group-hover-bg-active' : ''}
              group-focus-visible:ring-2
              group-focus-visible:ring-current
            `,
        ]"
      >
        <slot name="icon">
          <div :class="icon" text-xl />
        </slot>
        <slot>
          <span
            v-if="!isCollapsed"
            select-none
            class="nav-side-item-text"
            :class="isMobileVariant ? 'block' : 'block sm:hidden xl:block'"
          >
            {{ isHydrated ? text : '&nbsp;' }}
          </span>
        </slot>
      </div>
    </CommonTooltip>
  </NuxtLink>
</template>

<style scoped>
  .item {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    transition: background-color var(--motion-moderate, 160ms) ease, color var(--motion-moderate, 160ms) ease;
  }

  .item--active,
  .item--active:hover,
  :deep(.nav-side-item-active) .item,
  .nav-side-item-active .item,
  :deep(a.router-link-active) .item {
    background-color: transparent;
    color: var(--c-text-base);
    font-weight: 700;
  }

  @media screen and ( max-height: 820px ) and ( min-width: 1280px ) {
    .item {
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }
  }
  @media screen and ( max-height: 780px ) and ( min-width: 640px ) {
    .item {
      padding-top: 0.35rem;
      padding-bottom: 0.35rem;
    }
  }
  @media screen and ( max-height: 780px ) and ( min-width: 1280px ) {
    .item {
      padding-top: 0.05rem;
      padding-bottom: 0.05rem;
    }
  }
</style>
