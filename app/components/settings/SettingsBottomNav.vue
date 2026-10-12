<script setup lang="ts">
import type { NavButtonName } from '~/composables/settings'
import { STORAGE_KEY_BOTTOM_NAV_BUTTONS } from '~/constants'

interface NavButton {
  name: NavButtonName
  label: string
  icon: string
}

const availableNavButtons: NavButton[] = [
  { name: 'home', label: 'nav.home', icon: 'i-ri:home-5-line' },
  { name: 'search', label: 'nav.search', icon: 'i-ri:search-line' },
  { name: 'notification', label: 'nav.notifications', icon: 'i-ri:notification-4-line' },
  { name: 'mention', label: 'nav.conversations', icon: 'i-ri:at-line' },
  { name: 'favorite', label: 'nav.favourites', icon: 'i-ri:heart-line' },
  { name: 'bookmark', label: 'nav.bookmarks', icon: 'i-ri:bookmark-line' },
  { name: 'compose', label: 'nav.compose', icon: 'i-ri:quill-pen-line' },
  { name: 'scheduledPosts', label: 'nav.scheduled_posts', icon: 'i-ri:calendar-schedule-line' },
  { name: 'explore', label: 'nav.explore', icon: 'i-ri:compass-3-line' },
  { name: 'local', label: 'nav.local', icon: 'i-ri:group-2-line' },
  { name: 'federated', label: 'nav.federated', icon: 'i-ri:earth-line' },
  { name: 'list', label: 'nav.lists', icon: 'i-ri:list-check' },
  { name: 'collection', label: 'nav.collections', icon: 'i-ri:shapes-line' },
  { name: 'hashtag', label: 'nav.hashtags', icon: 'i-ri:hashtag' },
  { name: 'moreMenu', label: 'nav.more_menu', icon: 'i-ri:more-fill' },
] as const

const defaultSelectedNavButtonNames: NavButtonName[] = ['home', 'local', 'compose', 'notification', 'moreMenu']
const maxButtonNumber = 5
const navButtonNamesSetting = useLocalStorage<NavButtonName[]>(STORAGE_KEY_BOTTOM_NAV_BUTTONS, defaultSelectedNavButtonNames)
const selectedNavButtonNames = ref<NavButtonName[]>(navButtonNamesSetting.value)

const selectedNavButtons = computed<NavButton[]>(() =>
  selectedNavButtonNames.value.map(name =>
    availableNavButtons.find(navButton => navButton.name === name)!,
  ),
)

const canSave = computed(() =>
  selectedNavButtonNames.value.length > 0
  && selectedNavButtonNames.value.includes('moreMenu')
  && JSON.stringify(selectedNavButtonNames.value) !== JSON.stringify(navButtonNamesSetting.value),
)

function isAdded(name: NavButtonName) {
  return selectedNavButtonNames.value.includes(name)
}

function append(navButtonName: NavButtonName) {
  if (selectedNavButtonNames.value.length < maxButtonNumber)
    selectedNavButtonNames.value = [...selectedNavButtonNames.value, navButtonName]
}

function remove(navButtonName: NavButtonName) {
  selectedNavButtonNames.value = selectedNavButtonNames.value.filter(name => name !== navButtonName)
}

function clear() {
  selectedNavButtonNames.value = []
}

function reset() {
  selectedNavButtonNames.value = [...defaultSelectedNavButtonNames]
}

function save() {
  navButtonNamesSetting.value = selectedNavButtonNames.value
}
</script>

<template>
  <section class="settings-bottom-nav">
    <h2 id="interface-bn" class="settings-control-title">
      {{ $t('settings.interface.bottom_nav') }}
    </h2>
    <form
      aria-labelledby="interface-bn"
      :aria-describedby="selectedNavButtonNames.includes('moreMenu') ? 'interface-bn-desc' : 'interface-bn-desc interface-bn-more-required'"
      @submit.prevent="save"
    >
      <p id="interface-bn-desc" class="settings-control-description">
        {{ $t('settings.interface.bottom_nav_instructions') }}
      </p>
      <!-- preview -->
      <div aria-hidden="true" class="settings-bottom-nav-preview">
        <div class="settings-bottom-nav-preview-icons">
          <span v-for="navButton in selectedNavButtons" :key="navButton.name">
            <span :class="navButton.icon" />
          </span>
        </div>
        <span class="settings-bottom-nav-home-indicator" />
      </div>

      <details class="settings-navigation-editor">
        <summary
          class="settings-navigation-summary"
          aria-controls="interface-bn-choices"
        >
          <span flex-1 min-w-0>{{ $t('settings.interface.bottom_nav_options') }}</span>
          <span role="status" aria-live="polite" flex-shrink-0 text-sm text-secondary tabular-nums>
            {{ $t('settings.interface.bottom_nav_selected_count', [selectedNavButtonNames.length, maxButtonNumber]) }}
          </span>
          <span aria-hidden="true" class="settings-navigation-chevron i-ri:arrow-down-s-line" />
        </summary>

        <!-- button selection -->
        <div id="interface-bn-choices" class="settings-navigation-choices">
          <button
            v-for="{ name, label, icon } in availableNavButtons"
            :key="name"
            class="settings-navigation-choice"
            :disabled="!isAdded(name) && selectedNavButtonNames.length >= maxButtonNumber"
            type="button"
            role="switch"
            :aria-checked="isAdded(name)"
            @click="isAdded(name) ? remove(name) : append(name)"
          >
            <span aria-hidden="true" :class="icon" />
            <span class="settings-navigation-choice-label">{{ $t(label) }}</span>
            <span aria-hidden="true" class="settings-navigation-choice-check" :class="isAdded(name) ? 'i-ri:checkbox-circle-fill' : 'i-ri:add-circle-line'" />
          </button>
        </div>
      </details>

      <p v-if="!selectedNavButtonNames.includes('moreMenu')" id="interface-bn-more-required" role="alert" mt2 text-sm text-danger>
        {{ $t('settings.interface.bottom_nav_more_menu_required') }}
      </p>

      <div class="settings-navigation-actions">
        <button
          class="settings-navigation-clear settings-quiet-button"
          type="button"
          :disabled="selectedNavButtonNames.length === 0"
          @click="clear"
        >
          <span aria-hidden="true" class="block i-ri:delete-bin-line" />
          {{ $t('action.clear') }}
        </button>
        <button
          class="settings-quiet-button"
          type="reset"
          @click="reset"
        >
          <span aria-hidden="true" class="block i-ri:repeat-line" />
          {{ $t('action.reset') }}
        </button>
        <button
          btn-solid class="settings-save-button" flex="~ gap2 center"
          type="submit"
          :disabled="!canSave"
        >
          <span aria-hidden="true" i-ri:save-2-fill />
          {{ $t('action.save') }}
        </button>
      </div>
    </form>
  </section>
</template>
