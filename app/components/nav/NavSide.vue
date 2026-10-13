<script setup lang="ts">
import { isMoreMenuRouteActive } from '~/composables/nav'
import { STORAGE_KEY_LAST_ACCESSED_EXPLORE_ROUTE, STORAGE_KEY_LAST_ACCESSED_NOTIFICATION_ROUTE } from '~/constants'

const props = withDefaults(defineProps<{
  command?: boolean
  variant?: 'desktop' | 'mobile'
}>(), {
  variant: 'desktop',
})
const { notifications } = useNotifications()
const useStarFavoriteIcon = usePreferences('useStarFavoriteIcon')
const route = useRoute()
const moreOpen = useState<boolean>('nav-side-more-open', () => false)
const lastAccessedNotificationRoute = useLocalStorage(STORAGE_KEY_LAST_ACCESSED_NOTIFICATION_ROUTE, '')
const lastAccessedExploreRoute = useLocalStorage(STORAGE_KEY_LAST_ACCESSED_EXPLORE_ROUTE, '')
const moreButtonId = computed(() => `nav-side-more-${props.variant}`)
const moreItemsId = computed(() => `nav-side-more-items-${props.variant}`)
const floatingMoreOpen = ref(false)
const showMoreItems = computed(() => props.variant === 'desktop' ? floatingMoreOpen.value : moreOpen.value)
const userOnlyDisabled = computed(() => !isHydrated.value || !currentUser.value)
const isParentNavCollapsed = inject<Ref<boolean>>('isNavCollapsed', ref(false))
const isNavCollapsed = computed(() => props.variant === 'desktop' && Boolean(unref(isParentNavCollapsed)))
provide('isNavCollapsed', isNavCollapsed)
provide('navSideVariant', computed(() => props.variant))

const isMoreRouteActive = computed(() => isMoreMenuRouteActive(route.path, currentServer.value))

watch(() => route.path, () => {
  floatingMoreOpen.value = false
  if (props.variant === 'mobile' && isMoreRouteActive.value)
    moreOpen.value = true
  else
    moreOpen.value = false
}, { immediate: true })

function toggleMore() {
  if (props.variant === 'desktop') {
    floatingMoreOpen.value = !floatingMoreOpen.value
    return
  }

  moreOpen.value = !moreOpen.value
}

const notificationsLink = computed(() => {
  const hydrated = isHydrated.value
  const user = currentUser.value
  const lastRoute = lastAccessedNotificationRoute.value
  if (!hydrated || !user || !lastRoute) {
    return '/notifications'
  }

  return `/notifications/${lastRoute}`
})
const exploreLink = computed(() => {
  const hydrated = isHydrated.value
  const server = currentServer.value
  let lastRoute = lastAccessedExploreRoute.value
  if (!hydrated) {
    return '/explore'
  }

  if (lastRoute.length) {
    lastRoute = `/${lastRoute}`
  }

  return server ? `/${server}/explore${lastRoute}` : `/explore${lastRoute}`
})
</script>

<template>
  <nav sm:px3 flex="~ col gap2" shrink text-size-base leading-normal md:text-lg h-full mt-1 overflow-y-auto overflow-x-hidden>
    <NavSideItem :text="$t('nav.search')" to="/search" icon="i-ri:search-line" xl:hidden :command="command" />

    <div class="spacer" shrink xl:hidden />
    <NavSideItem :text="$t('nav.home')" to="/home" icon="i-ri:home-5-line" user-only :command="command" />
    <NavSideItem :text="$t('nav.local')" :to="isHydrated ? `/${currentServer}/public/local` : '/public/local'" icon="i-ri:group-2-line" :command="command" />
    <NavSideItem :text="$t('nav.explore')" :to="exploreLink" icon="i-ri:compass-3-line" :command="command" />
    <NavSideItem :text="$t('nav.notifications')" :to="notificationsLink" icon="i-ri:notification-4-line" user-only :command="command">
      <template #icon>
        <div flex relative>
          <div class="i-ri:notification-4-line" text-xl />
          <div v-if="notifications" class="top-[-0.3rem] right-[-0.3rem]" absolute font-semibold rounded-full h-4 w-4 text-xs bg-primary text-inverted flex items-center justify-center>
            {{ notifications < 10 ? notifications : '•' }}
          </div>
        </div>
      </template>
    </NavSideItem>

    <div class="spacer" shrink hidden sm:block />
    <NavSideItem :text="$t('action.compose')" to="/compose" icon="i-ri:quill-pen-line" user-only :command="command" />

    <CommonDropdown
      v-model:shown="floatingMoreOpen"
      class="w-fit"
      :triggers="[]"
      hidden sm:block
      placement="bottom-start"
      :distance="4"
      auto-boundary-max-size
      popper-class="nav-side-more-popper"
    >
      <CommonTooltip class="w-fit" :disabled="!isMediumOrLargeScreen" :content="$t('nav.more_menu')" placement="right">
        <button
          :id="`${moreButtonId}-floating`"
          type="button"
          class="nav-more-button w-fit rounded-3 px2 mx3 transition-100 focus-visible:ring-2 focus-visible:ring-current"
          :class="[
            isMoreRouteActive ? 'nav-more-button--active text-primary' : 'elk-group-hover-bg-active',
            isNavCollapsed ? 'nav-more-button--compact' : 'xl:ml0 xl:mr0 xl:px5 xl:w-auto',
          ]"
          flex items-center gap4 focus:outline-none
          :aria-label="$t('nav.more_menu')"
          :aria-expanded="showMoreItems"
          :aria-controls="`${moreItemsId}-floating`"
          @click.stop="toggleMore"
        >
          <span :class="showMoreItems ? 'i-ri:arrow-down-s-line' : 'i-ri:more-fill'" text-xl />
          <span v-if="!isNavCollapsed" block sm:hidden xl:block select-none class="nav-more-text">{{ $t('nav.more_menu') }}</span>
        </button>
      </CommonTooltip>

      <template #popper>
        <div :id="`${moreItemsId}-floating`" min-w-52 flex="~ col gap1" p-1>
          <NuxtLink to="/conversations" :class="userOnlyDisabled ? 'op50 pointer-events-none' : undefined" :tabindex="userOnlyDisabled ? -1 : undefined">
            <CommonDropdownItem :text="$t('nav.conversations')" icon="i-ri:at-line" :command="command" />
          </NuxtLink>
          <NuxtLink :to="isHydrated ? `/${currentServer}/public` : '/public'">
            <CommonDropdownItem :text="$t('nav.federated')" icon="i-ri:earth-line" :command="command" />
          </NuxtLink>
          <NuxtLink to="/favourites" :class="userOnlyDisabled ? 'op50 pointer-events-none' : undefined" :tabindex="userOnlyDisabled ? -1 : undefined">
            <CommonDropdownItem :text="$t('nav.favourites')" :icon="useStarFavoriteIcon ? 'i-ri:star-line' : 'i-ri:heart-3-line'" :command="command" />
          </NuxtLink>
          <NuxtLink to="/bookmarks" :class="userOnlyDisabled ? 'op50 pointer-events-none' : undefined" :tabindex="userOnlyDisabled ? -1 : undefined">
            <CommonDropdownItem :text="$t('nav.bookmarks')" icon="i-ri:bookmark-line" :command="command" />
          </NuxtLink>
          <NuxtLink :to="isHydrated ? `/${currentServer}/lists` : '/lists'" :class="userOnlyDisabled ? 'op50 pointer-events-none' : undefined" :tabindex="userOnlyDisabled ? -1 : undefined">
            <CommonDropdownItem :text="$t('nav.lists')" icon="i-ri:list-check" :command="command" />
          </NuxtLink>
          <NuxtLink to="/hashtags" :class="userOnlyDisabled ? 'op50 pointer-events-none' : undefined" :tabindex="userOnlyDisabled ? -1 : undefined">
            <CommonDropdownItem :text="$t('nav.hashtags')" icon="i-ri:hashtag" :command="command" />
          </NuxtLink>
          <NuxtLink to="/scheduled-posts" :class="userOnlyDisabled ? 'op50 pointer-events-none' : undefined" :tabindex="userOnlyDisabled ? -1 : undefined">
            <CommonDropdownItem :text="$t('nav.scheduled_posts')" icon="i-ri:calendar-schedule-line" :command="command" />
          </NuxtLink>
          <NuxtLink :to="isHydrated ? `/${currentServer}/collections` : '/collections'" :class="userOnlyDisabled ? 'op50 pointer-events-none' : undefined" :tabindex="userOnlyDisabled ? -1 : undefined">
            <CommonDropdownItem :text="$t('nav.collections')" icon="i-ri:shapes-line" :command="command" />
          </NuxtLink>
          <NuxtLink to="/settings">
            <CommonDropdownItem :text="$t('nav.settings')" icon="i-ri:settings-3-line" :command="command" />
          </NuxtLink>
        </div>
      </template>
    </CommonDropdown>

    <div sm:hidden>
      <CommonTooltip :disabled="!isMediumOrLargeScreen" :content="$t('nav.more_menu')" placement="right">
        <button
          :id="`${moreButtonId}-inline`"
          type="button"
          class="nav-more-button transition-colors duration-200 transform hover:bg-active active:bg-active"
          :class="{
            'nav-more-button--active': isMoreRouteActive,
            'nav-more-button--open': showMoreItems && !isMoreRouteActive,
          }"
          flex items-center gap4 focus:outline-none
          w-full px5
          :aria-label="$t('nav.more_menu')"
          :aria-expanded="showMoreItems"
          :aria-controls="`${moreItemsId}-inline`"
          @click.stop="toggleMore"
        >
          <span :class="showMoreItems ? 'i-ri:arrow-down-s-line' : 'i-ri:more-fill'" text-xl />
          <span select-none>{{ $t('nav.more_menu') }}</span>
        </button>
      </CommonTooltip>

      <Transition name="nav-more-items">
        <div v-if="showMoreItems" :id="`${moreItemsId}-inline`" class="nav-more-items">
          <div class="nav-more-items-content" flex="~ col gap2">
            <NavSideItem :text="$t('nav.conversations')" to="/conversations" icon="i-ri:at-line" user-only :command="command" />
            <NavSideItem :text="$t('nav.federated')" :to="isHydrated ? `/${currentServer}/public` : '/public'" icon="i-ri:earth-line" :command="command" />
            <NavSideItem :text="$t('nav.favourites')" to="/favourites" :icon="useStarFavoriteIcon ? 'i-ri:star-line' : 'i-ri:heart-3-line'" user-only :command="command" />
            <NavSideItem :text="$t('nav.bookmarks')" to="/bookmarks" icon="i-ri:bookmark-line" user-only :command="command" />
            <NavSideItem :text="$t('nav.lists')" :to="isHydrated ? `/${currentServer}/lists` : '/lists'" icon="i-ri:list-check" user-only :command="command" />
            <NavSideItem :text="$t('nav.hashtags')" to="/hashtags" icon="i-ri:hashtag" user-only :command="command" />
            <NavSideItem :text="$t('nav.scheduled_posts')" to="/scheduled-posts" icon="i-ri:calendar-schedule-line" user-only :command="command" />
            <NavSideItem :text="$t('nav.collections')" :to="isHydrated ? `/${currentServer}/collections` : '/collections'" icon="i-ri:shapes-line" user-only :command="command" />
            <NavSideItem :text="$t('nav.settings')" to="/settings" icon="i-ri:settings-3-line" :command="command" />
          </div>
        </div>
      </Transition>
    </div>
  </nav>
</template>

<style scoped>
  .spacer {
    margin-top: 0.5em;
  }

  .nav-more-button {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    transition:
      background-color var(--motion-moderate, 160ms) ease,
      color var(--motion-moderate, 160ms) ease;
  }

  .nav-more-button--active,
  .nav-more-button--active:hover {
    background-color: var(--c-nav-active-bg, var(--c-primary-fade));
    color: var(--c-primary);
    font-weight: 600;
  }

  :root.dark .nav-more-button--active,
  :root.dark .nav-more-button--active:hover {
    background-color: var(--c-nav-active-bg, var(--c-primary-fade));
  }

  @media (max-width: 639.98px) {
    .nav-more-button--open {
      background-color: var(--c-bg-active);
      color: var(--c-primary);
    }
  }

  .nav-more-items {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 160ms cubic-bezier(0.23, 1, 0.32, 1),
      transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .nav-more-items-enter-from,
  .nav-more-items-leave-to {
    opacity: 0;
    transform: translateY(-0.35rem);
  }

  @media (prefers-reduced-motion: reduce) {
    .nav-more-items {
      transition: opacity 120ms ease-out;
    }

    .nav-more-items-enter-from,
    .nav-more-items-leave-to {
      transform: none;
    }
  }

  @media screen and ( max-height: 920px ) and ( min-width: 640px ) {
    .spacer {
      margin-top: 0;
    }
  }
</style>
