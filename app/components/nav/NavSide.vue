<script setup lang="ts">
import { STORAGE_KEY_LAST_ACCESSED_EXPLORE_ROUTE, STORAGE_KEY_LAST_ACCESSED_NOTIFICATION_ROUTE, STORAGE_KEY_SIDE_NAV_MORE } from '~/constants'

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
const moreOpenInitialized = useState<boolean>('nav-side-more-open-initialized', () => false)
const lastAccessedNotificationRoute = useLocalStorage(STORAGE_KEY_LAST_ACCESSED_NOTIFICATION_ROUTE, '')
const lastAccessedExploreRoute = useLocalStorage(STORAGE_KEY_LAST_ACCESSED_EXPLORE_ROUTE, '')
const moreButtonId = computed(() => `nav-side-more-${props.variant}`)
const moreItemsId = computed(() => `nav-side-more-items-${props.variant}`)
const floatingMoreOpen = ref(false)

const isMoreRoute = computed(() => {
  const path = route.path
  const fixedRoutes = ['/explore', '/favourites', '/bookmarks', '/scheduled-posts', '/lists', '/hashtags', '/settings']

  return fixedRoutes.some(route => path === route || path.endsWith(route) || path.includes(`${route}/`))
    || path.endsWith('/public')
    || path.endsWith('/public/local')
    || path.includes('/collections')
})

const showMoreItems = computed(() => props.variant === 'desktop' ? floatingMoreOpen.value : moreOpen.value)
const userOnlyDisabled = computed(() => !isHydrated.value || !currentUser.value)

watch(moreOpen, (value) => {
  if (import.meta.client)
    localStorage.setItem(STORAGE_KEY_SIDE_NAV_MORE, String(value))
})

watch(() => route.path, () => {
  floatingMoreOpen.value = false
  if (isMoreRoute.value)
    moreOpen.value = true
})

onMounted(() => {
  if (!moreOpenInitialized.value) {
    const stored = localStorage.getItem(STORAGE_KEY_SIDE_NAV_MORE)
    if (stored !== null)
      moreOpen.value = stored === 'true'
    moreOpenInitialized.value = true
  }

  if (isMoreRoute.value)
    moreOpen.value = true
})

function toggleMore() {
  if (props.variant === 'desktop') {
    const next = !floatingMoreOpen.value
    floatingMoreOpen.value = next
    moreOpen.value = next
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
  <nav sm:px3 flex="~ col gap2" shrink text-size-base leading-normal md:text-lg h-full mt-1 overflow-y-auto>
    <NavSideItem :text="$t('nav.search')" to="/search" icon="i-ri:search-line" xl:hidden :command="command" />

    <div class="spacer" shrink xl:hidden />
    <NavSideItem :text="$t('nav.home')" to="/home" icon="i-ri:home-5-line" user-only :command="command" />
    <NavSideItem :text="$t('nav.notifications')" :to="notificationsLink" icon="i-ri:notification-4-line" user-only :command="command">
      <template #icon>
        <div flex relative>
          <div class="i-ri:notification-4-line" text-xl />
          <div v-if="notifications" class="top-[-0.3rem] right-[-0.3rem]" absolute font-bold rounded-full h-4 w-4 text-xs bg-primary text-inverted flex items-center justify-center>
            {{ notifications < 10 ? notifications : '•' }}
          </div>
        </div>
      </template>
    </NavSideItem>
    <NavSideItem :text="$t('nav.conversations')" to="/conversations" icon="i-ri:at-line" user-only :command="command" />

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
    >
      <CommonTooltip class="w-fit" :disabled="!isMediumOrLargeScreen" :content="$t('nav.more_menu')" placement="right">
        <button
          :id="`${moreButtonId}-floating`"
          type="button"
          class="nav-more-button w-fit rounded-3 px2 mx3 transition-100 elk-group-hover-bg-active focus-visible:ring-2 focus-visible:ring-current"
          flex items-center gap4 focus:outline-none
          xl="ml0 mr0 px5 w-auto"
          :aria-label="$t('nav.more_menu')"
          :aria-expanded="showMoreItems"
          :aria-controls="`${moreItemsId}-floating`"
          @click.stop="toggleMore"
        >
          <span :class="showMoreItems ? 'i-ri:arrow-down-s-line' : 'i-ri:more-fill'" text-xl />
          <span block sm:hidden xl:block select-none>{{ $t('nav.more_menu') }}</span>
        </button>
      </CommonTooltip>

      <template #popper>
        <div :id="`${moreItemsId}-floating`" min-w-52 flex="~ col gap1" p-1>
          <NuxtLink :to="exploreLink">
            <CommonDropdownItem :text="$t('nav.explore')" icon="i-ri:compass-3-line" :command="command" />
          </NuxtLink>
          <NuxtLink to="/favourites" :class="userOnlyDisabled ? 'op25 pointer-events-none' : undefined" :tabindex="userOnlyDisabled ? -1 : undefined">
            <CommonDropdownItem :text="$t('nav.favourites')" :icon="useStarFavoriteIcon ? 'i-ri:star-line' : 'i-ri:heart-3-line'" :command="command" />
          </NuxtLink>
          <NuxtLink to="/bookmarks" :class="userOnlyDisabled ? 'op25 pointer-events-none' : undefined" :tabindex="userOnlyDisabled ? -1 : undefined">
            <CommonDropdownItem :text="$t('nav.bookmarks')" icon="i-ri:bookmark-line" :command="command" />
          </NuxtLink>
          <NuxtLink to="/scheduled-posts" :class="userOnlyDisabled ? 'op25 pointer-events-none' : undefined" :tabindex="userOnlyDisabled ? -1 : undefined">
            <CommonDropdownItem :text="$t('nav.scheduled_posts')" icon="i-ri:calendar-schedule-line" :command="command" />
          </NuxtLink>
          <NuxtLink :to="isHydrated ? `/${currentServer}/public/local` : '/public/local'">
            <CommonDropdownItem :text="$t('nav.local')" icon="i-ri:group-2-line" :command="command" />
          </NuxtLink>
          <NuxtLink :to="isHydrated ? `/${currentServer}/public` : '/public'">
            <CommonDropdownItem :text="$t('nav.federated')" icon="i-ri:earth-line" :command="command" />
          </NuxtLink>
          <NuxtLink :to="isHydrated ? `/${currentServer}/lists` : '/lists'" :class="userOnlyDisabled ? 'op25 pointer-events-none' : undefined" :tabindex="userOnlyDisabled ? -1 : undefined">
            <CommonDropdownItem :text="$t('nav.lists')" icon="i-ri:list-check" :command="command" />
          </NuxtLink>
          <NuxtLink to="/hashtags" :class="userOnlyDisabled ? 'op25 pointer-events-none' : undefined" :tabindex="userOnlyDisabled ? -1 : undefined">
            <CommonDropdownItem :text="$t('nav.hashtags')" icon="i-ri:hashtag" :command="command" />
          </NuxtLink>
          <NuxtLink :to="isHydrated ? `/${currentServer}/collections` : '/collections'" :class="userOnlyDisabled ? 'op25 pointer-events-none' : undefined" :tabindex="userOnlyDisabled ? -1 : undefined">
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
          class="nav-more-button transition-colors duration-200 transform hover-bg-gray-100 hover-dark:(bg-gray-700 text-white)"
          flex items-center gap4 focus:outline-none
          w-full px5
          :aria-label="$t('nav.more_menu')"
          :aria-expanded="showMoreItems"
          :aria-controls="`${moreItemsId}-inline`"
          @click="toggleMore"
        >
          <span :class="showMoreItems ? 'i-ri:arrow-down-s-line' : 'i-ri:more-fill'" text-xl />
          <span select-none>{{ $t('nav.more_menu') }}</span>
        </button>
      </CommonTooltip>

      <div v-if="showMoreItems" :id="`${moreItemsId}-inline`" flex="~ col gap2">
        <NavSideItem :text="$t('nav.explore')" :to="exploreLink" icon="i-ri:compass-3-line" :command="command" />
        <NavSideItem :text="$t('nav.favourites')" to="/favourites" :icon="useStarFavoriteIcon ? 'i-ri:star-line' : 'i-ri:heart-3-line'" user-only :command="command" />
        <NavSideItem :text="$t('nav.bookmarks')" to="/bookmarks" icon="i-ri:bookmark-line" user-only :command="command" />
        <NavSideItem :text="$t('nav.scheduled_posts')" to="/scheduled-posts" icon="i-ri:calendar-schedule-line" user-only :command="command" />
        <NavSideItem :text="$t('nav.local')" :to="isHydrated ? `/${currentServer}/public/local` : '/public/local'" icon="i-ri:group-2-line " :command="command" />
        <NavSideItem :text="$t('nav.federated')" :to="isHydrated ? `/${currentServer}/public` : '/public'" icon="i-ri:earth-line" :command="command" />
        <NavSideItem :text="$t('nav.lists')" :to="isHydrated ? `/${currentServer}/lists` : '/lists'" icon="i-ri:list-check" user-only :command="command" />
        <NavSideItem :text="$t('nav.hashtags')" to="/hashtags" icon="i-ri:hashtag" user-only :command="command" />
        <NavSideItem :text="$t('nav.collections')" :to="isHydrated ? `/${currentServer}/collections` : '/collections'" icon="i-ri:shapes-line" user-only :command="command" />
        <NavSideItem :text="$t('nav.settings')" to="/settings" icon="i-ri:settings-3-line" :command="command" />
      </div>
    </div>
  </nav>
</template>

<style scoped>
  .spacer {
    margin-top: 0.5em;
  }
  @media screen and ( max-height: 920px ) and ( min-width: 640px ) {
    .spacer {
      margin-top: 0;
    }
  }
</style>
