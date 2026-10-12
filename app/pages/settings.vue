<script setup lang="ts">
definePageMeta({
  wideLayout: true,
})

const { t } = useI18n()

useHydratedHead({
  title: () => t('nav.settings'),
})

const route = useRoute()

const isRootPath = computed(() => route.name === 'settings')

interface SettingsNavigationItem {
  icon: string
  label: string
  to: string
  signedInOnly?: boolean
}

const navigationGroups: SettingsNavigationItem[][] = [
  [
    { icon: 'i-ri:user-line', label: 'settings.profile.label', to: '/settings/profile', signedInOnly: true },
    { icon: 'i-ri:group-line', label: 'settings.users.label', to: '/settings/users' },
  ],
  [
    { icon: 'i-ri:compasses-2-line', label: 'settings.interface.label', to: '/settings/interface' },
    { icon: 'i-ri:notification-badge-line', label: 'settings.notifications_settings', to: '/settings/notifications', signedInOnly: true },
    { icon: 'i-ri:globe-line', label: 'settings.language.label', to: '/settings/language' },
    { icon: 'i-ri:equalizer-line', label: 'settings.preferences.label', to: '/settings/preferences' },
  ],
  [
    { icon: 'i-ri:information-line', label: 'settings.about.label', to: '/settings/about' },
  ],
]

const visibleNavigationGroups = computed(() => navigationGroups
  // Keep the server and first client render identical while stored accounts load.
  .map(group => group.filter(item => !item.signedInOnly || (isHydrated.value && currentUser.value))))
</script>

<template>
  <div class="settings-page">
    <div class="settings-frame">
      <div class="settings-sidebar" :class="isRootPath ? 'block lg:flex-none flex-1' : 'hidden lg:block'">
        <MainContent class="settings-sidebar-content">
          <template #title>
            <MainTitle :as="isRootPath ? 'h1' : 'h2'" class="settings-navigation-title" secondary>
              {{ $t('nav.settings') }}
            </MainTitle>
          </template>
          <template #actions>
            <NuxtLink to="/home" class="settings-exit-link" :aria-label="$t('nav.home')">
              <span aria-hidden="true" class="i-ri:arrow-left-line rtl-flip" />
              <span>{{ $t('nav.home') }}</span>
            </NuxtLink>
          </template>
          <nav class="settings-navigation-list" :aria-label="$t('nav.settings')">
            <ul v-for="(group, groupIndex) in visibleNavigationGroups" :key="groupIndex" class="settings-navigation-group">
              <li v-for="item in group" :key="item.to">
                <SettingsItem
                  navigation
                  command
                  :icon="item.icon"
                  :text="$t(item.label)"
                  :to="item.to"
                  :match="route.path === item.to || route.path.startsWith(`${item.to}/`)"
                />
              </li>
            </ul>
          </nav>
        </MainContent>
      </div>
      <div class="settings-content" :class="isRootPath ? 'hidden lg:block' : 'block'">
        <ClientOnly>
          <NuxtPage />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>
