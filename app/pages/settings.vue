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
</script>

<template>
  <div class="settings-page">
    <div class="settings-frame">
      <div class="settings-sidebar" :class="isRootPath ? 'block lg:flex-none flex-1' : 'hidden lg:block'">
        <MainContent class="settings-sidebar-content">
          <template #title>
            <MainTitle icon="i-ri:settings-3-line">
              {{ $t('nav.settings') }}
            </MainTitle>
          </template>
          <nav class="settings-navigation-list" :aria-label="$t('nav.settings')">
            <SettingsItem
              v-if="currentUser"
              navigation
              command
              icon="i-ri:user-line"
              :text="$t('settings.profile.label')"
              to="/settings/profile"
              :match="$route.path.startsWith('/settings/profile/')"
            />
            <SettingsItem
              navigation
              command
              icon="i-ri-compasses-2-line"
              :text="$t('settings.interface.label')"
              to="/settings/interface"
              :match="$route.path.startsWith('/settings/interface/')"
            />
            <SettingsItem
              v-if="currentUser"
              navigation
              command
              icon="i-ri:notification-badge-line"
              :text="$t('settings.notifications_settings')"
              to="/settings/notifications"
              :match="$route.path.startsWith('/settings/notifications/')"
            />
            <SettingsItem
              navigation
              command
              icon="i-ri-globe-line"
              :text="$t('settings.language.label')"
              to="/settings/language"
              :match="$route.path.startsWith('/settings/language/')"
            />
            <SettingsItem
              navigation
              command
              icon="i-ri-equalizer-line"
              :text="$t('settings.preferences.label')"
              to="/settings/preferences"
              :match="$route.path.startsWith('/settings/preferences/')"
            />
            <SettingsItem
              navigation
              command
              icon="i-ri-group-line"
              :text="$t('settings.users.label')"
              to="/settings/users"
              :match="$route.path.startsWith('/settings/users/')"
            />
            <SettingsItem
              navigation
              command
              icon="i-ri:information-line"
              :text="$t('settings.about.label')"
              to="/settings/about"
              :match="$route.path.startsWith('/settings/about/')"
            />
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
