import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import SettingsPage from '~/pages/settings.vue'

const route = vi.hoisted(() => ({ name: 'settings-interface', path: '/settings/interface' }))
const session = await vi.hoisted(async () => {
  const { ref } = await import('vue')
  return { user: ref<object | null>(null), hydrated: ref(true) }
})

mockNuxtImport('useRoute', () => () => route)
mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))
mockNuxtImport('useCommand', () => () => {})
mockNuxtImport('currentUser', () => session.user)
mockNuxtImport('isHydrated', () => session.hydrated)

async function mountSettings(path: string) {
  route.path = path
  return mountSuspended(SettingsPage, {
    global: {
      stubs: {
        MainContent: { template: '<div><slot name="title" /><slot name="actions" /><slot /></div>' },
        MainTitle: { template: '<h2><slot /></h2>' },
        NuxtPage: true,
      },
    },
  })
}

describe('settings navigation', () => {
  beforeEach(() => {
    session.user.value = null
    session.hydrated.value = true
  })

  it('marks the exact settings page as current', async () => {
    const wrapper = await mountSettings('/settings/interface')

    expect(wrapper.get('[href="/settings/interface"]').attributes('aria-current')).toBe('page')
    expect(wrapper.get('[href="/settings/interface"]').classes()).toContain('settings-nav-link-active')
    expect(wrapper.findAll('.settings-nav-link-active')).toHaveLength(1)
  })

  it('does not render an exit link inside the settings header', async () => {
    const wrapper = await mountSettings('/settings/interface')

    expect(wrapper.find('.settings-exit-link').exists()).toBe(false)
    expect(wrapper.find('[href="/home"]').exists()).toBe(false)
  })

  it('keeps the parent selected for nested pages without matching unrelated prefixes', async () => {
    const wrapper = await mountSettings('/settings/language/translations')
    expect(wrapper.get('[href="/settings/language"]').classes()).toContain('settings-nav-link-active')

    const unrelatedPage = await mountSettings('/settings/language-other')
    expect(unrelatedPage.findAll('.settings-nav-link-active')).toHaveLength(0)
  })

  it('keeps the initial navigation stable until the stored account has hydrated', async () => {
    session.user.value = { account: { id: '1' } }
    session.hydrated.value = false
    const wrapper = await mountSettings('/settings/interface')

    expect(wrapper.find('[href="/settings/profile"]').exists()).toBe(false)
    expect(wrapper.find('[href="/settings/notifications"]').exists()).toBe(false)

    session.hydrated.value = true
    await nextTick()

    expect(wrapper.get('[href="/settings/profile"]').exists()).toBe(true)
    expect(wrapper.get('[href="/settings/notifications"]').exists()).toBe(true)
    expect(wrapper.get('[href="/settings/language"]').attributes('href')).toBe('/settings/language')
  })
})
