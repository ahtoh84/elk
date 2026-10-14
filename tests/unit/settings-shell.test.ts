import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import DefaultLayout from '~/layouts/default.vue'

const route = vi.hoisted(() => ({ path: '/settings/interface', meta: { wideLayout: true } }))
const hydrated = await vi.hoisted(async () => {
  const { ref } = await import('vue')
  return ref(true)
})

mockNuxtImport('useRoute', () => () => route)
mockNuxtImport('isHydrated', () => hydrated)

async function mountLayout(path: string) {
  route.path = path
  route.meta.wideLayout = path === '/settings' || path.startsWith('/settings/')

  return mountSuspended(DefaultLayout, {
    slots: { default: () => h('div', { 'data-page-content': '' }, 'Page content') },
    global: {
      stubs: {
        NavTitle: true,
        NavSide: { template: '<nav data-site-navigation />' },
        NavBottom: { template: '<nav data-bottom-navigation />' },
        ModalContainer: { template: '<div data-modal-container />' },
        CommonOfflineChecker: true,
        SearchWidget: true,
        PwaPrompt: true,
        PwaInstallPrompt: true,
        NavFooter: true,
      },
    },
  })
}

describe('settings workspace', () => {
  it.each(['/settings', '/settings/interface', '/settings/profile/appearance'])(
    'keeps the desktop site navigation and mobile navigation on %s',
    async (path) => {
      const wrapper = await mountLayout(path)

      expect(wrapper.find('[data-site-navigation]').exists()).toBe(true)
      expect(wrapper.find('[data-bottom-navigation]').exists()).toBe(true)
      expect(wrapper.get('[data-page-content]').text()).toBe('Page content')
      expect(wrapper.find('[data-modal-container]').exists()).toBe(true)
      expect(wrapper.find('aside.nav-compact-mode').exists()).toBe(true)
      const asideClasses = wrapper.find('aside').classes()
      expect(asideClasses).toContain('md:w-1/6')
      expect(asideClasses).toContain('lg:w-1/5')
      expect(asideClasses).toContain('xl:w-20')
    },
  )

  it.each(['/home', '/settings-other'])(
    'keeps the normal site navigation on %s',
    async (path) => {
      const wrapper = await mountLayout(path)

      expect(wrapper.find('[data-site-navigation]').exists()).toBe(true)
      expect(wrapper.find('[data-bottom-navigation]').exists()).toBe(true)
      expect(wrapper.find('aside.nav-compact-mode').exists()).toBe(false)
    },
  )
})
