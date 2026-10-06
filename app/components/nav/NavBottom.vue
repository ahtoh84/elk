<script setup lang="ts">
import type { Component } from 'vue'
import type { NavButtonName } from '../../composables/settings'

import {
  NavButtonBookmark,
  NavButtonCollection,
  NavButtonCompose,
  NavButtonExplore,
  NavButtonFavorite,
  NavButtonFederated,
  NavButtonHashtag,
  NavButtonHome,
  NavButtonList,
  NavButtonLocal,
  NavButtonMention,
  NavButtonMoreMenu,
  NavButtonNotification,
  NavButtonScheduledPosts,
  NavButtonSearch,
} from '#components'

import { getActiveNavButtonName } from '~/composables/nav'
import { STORAGE_KEY_BOTTOM_NAV_BUTTONS } from '~/constants'

interface NavButton {
  name: string
  component: Component
}

const navButtons: NavButton[] = [
  { name: 'home', component: NavButtonHome },
  { name: 'search', component: NavButtonSearch },
  { name: 'notification', component: NavButtonNotification },
  { name: 'mention', component: NavButtonMention },
  { name: 'favorite', component: NavButtonFavorite },
  { name: 'bookmark', component: NavButtonBookmark },
  { name: 'compose', component: NavButtonCompose },
  { name: 'scheduledPosts', component: NavButtonScheduledPosts },
  { name: 'explore', component: NavButtonExplore },
  { name: 'local', component: NavButtonLocal },
  { name: 'federated', component: NavButtonFederated },
  { name: 'list', component: NavButtonList },
  { name: 'collection', component: NavButtonCollection },
  { name: 'hashtag', component: NavButtonHashtag },
  { name: 'moreMenu', component: NavButtonMoreMenu },
]

const defaultSelectedNavButtonNames: NavButtonName[] = ['home', 'local', 'compose', 'notification', 'moreMenu']
const selectedNavButtonNames = useLocalStorage<NavButtonName[]>(STORAGE_KEY_BOTTOM_NAV_BUTTONS, defaultSelectedNavButtonNames)

const selectedNavButtons = computed(() => selectedNavButtonNames.value.map(name => navButtons.find(navButton => navButton.name === name)))

// only one icon can be lit up at the same time
const moreMenuVisible = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  moreMenuVisible.value = false
})

const activeNavButtonIndex = computed(() => {
  const activeName = moreMenuVisible.value ? 'moreMenu' : getActiveNavButtonName(route.path)
  return activeName ? selectedNavButtonNames.value.indexOf(activeName) : -1
})

const navIndicatorStyle = computed(() => ({
  '--nav-button-width': `${100 / Math.max(selectedNavButtons.value.length, 1)}%`,
  '--nav-button-translate': `${activeNavButtonIndex.value * 100}%`,
}))
</script>

<template>
  <!-- This weird styles above are used for scroll locking, don't change it unless you know exactly what you're doing. -->
  <nav
    relative h-14 border="t base" flex flex-row text-xl
    of-y-scroll scrollbar-hide overscroll-none
    class="nav-bottom after-content-empty after:(h-[calc(100%+0.5px)] w-0.1px pointer-events-none)"
  >
    <span
      v-if="activeNavButtonIndex >= 0"
      class="nav-bottom-indicator"
      :style="navIndicatorStyle"
      aria-hidden="true"
    >
      <span class="nav-bottom-indicator-bar" />
    </span>

    <template v-for="navButton in selectedNavButtons" :key="navButton!.name">
      <NavButtonMoreMenu
        v-if="navButton!.name === 'moreMenu'"
        v-model="moreMenuVisible"
      />
      <Component
        :is="navButton!.component"
        v-else
        :active-class="moreMenuVisible ? '' : 'text-primary'"
      />
    </template>
  </nav>
</template>

<style scoped>
.nav-bottom-indicator {
  position: absolute;
  inset-inline-start: 0;
  bottom: 0.25rem;
  display: flex;
  width: var(--nav-button-width);
  height: 0.25rem;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  transform: translate3d(var(--nav-button-translate), 0, 0);
  transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.nav-bottom-indicator-bar {
  display: block;
  width: 1.5rem;
  height: 0.125rem;
  border-radius: 9999px;
  background: var(--c-primary);
}

@media (prefers-reduced-motion: reduce) {
  .nav-bottom-indicator {
    transition-duration: 0ms;
  }
}
</style>
