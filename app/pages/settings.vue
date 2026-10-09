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

const navListEl = ref<HTMLElement>()
const activePillStyle = ref<{ top: number, height: number, ready: boolean }>({
  top: 0,
  height: 0,
  ready: false,
})

function updateSettingsPill(target?: HTMLElement) {
  if (!navListEl.value)
    return
  const activeLink = target || navListEl.value.querySelector('.settings-nav-link-active') as HTMLElement | null
  if (activeLink) {
    const navRect = navListEl.value.getBoundingClientRect()
    const activeRect = activeLink.getBoundingClientRect()
    const top = activeRect.top - navRect.top + navListEl.value.scrollTop
    const height = activeRect.height
    if (height > 0) {
      activePillStyle.value = {
        top,
        height,
        ready: true,
      }
    }
  }
  else {
    activePillStyle.value.ready = false
  }
}

function handleNavClick(event: MouseEvent) {
  const target = (event.target as HTMLElement).closest('.settings-nav-link') as HTMLElement | null
  if (target)
    updateSettingsPill(target)
}

onMounted(() => {
  nextTick(() => {
    updateSettingsPill()
    setTimeout(updateSettingsPill, 100)
    setTimeout(updateSettingsPill, 300)
  })
})

watch(() => route.fullPath, () => {
  nextTick(() => {
    updateSettingsPill()
    setTimeout(updateSettingsPill, 60)
  })
})

useResizeObserver(navListEl, () => {
  updateSettingsPill()
})
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
          <nav
            ref="navListEl"
            class="settings-navigation-list relative"
            :aria-label="$t('nav.settings')"
            @click="handleNavClick"
          >
            <!-- Physical Gliding Active Indicator Pill -->
            <div
              class="settings-nav-gliding-pill"
              :style="{
                transform: `translate3d(0, ${activePillStyle.top}px, 0)`,
                height: `${activePillStyle.height}px`,
                opacity: activePillStyle.ready ? 1 : 0,
              }"
              aria-hidden="true"
            >
              <div class="settings-nav-gliding-bar" />
            </div>
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

<style scoped>
.settings-nav-gliding-pill {
  position: absolute;
  inset-inline: 0.5rem;
  top: 0;
  border-radius: 0.75rem;
  background: var(--c-primary-fade);
  pointer-events: none;
  z-index: 0;
  transition:
    transform var(--motion-moderate, 160ms) var(--ease-fluid, cubic-bezier(0.23, 1, 0.32, 1)),
    height var(--motion-moderate, 160ms) var(--ease-fluid, cubic-bezier(0.23, 1, 0.32, 1)),
    opacity var(--motion-fast, 80ms) ease;
}

.settings-nav-gliding-bar {
  position: absolute;
  inset-block: 0.65rem;
  inset-inline-start: 0;
  width: 3px;
  border-radius: 999px;
  background: var(--c-primary);
}

@media (prefers-reduced-motion: reduce) {
  .settings-nav-gliding-pill {
    transition: opacity 120ms ease-out;
  }
}
</style>
