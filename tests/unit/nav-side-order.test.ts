import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NavSide from '~/components/nav/NavSide.vue'

const navState = await vi.hoisted(async () => {
  const { ref } = await import('vue')
  return {
    route: ref({ path: '/home' }),
    hydrated: ref(true),
    currentUser: ref({ account: { id: 'test-user' } }),
    currentServer: ref('qaf.men'),
    moreOpen: ref(false),
    lastAccessedRoute: ref(''),
    preference: ref(false),
    mediumOrLargeScreen: ref(false),
    smallScreen: ref(false),
  }
})

mockNuxtImport('useRoute', () => () => navState.route.value)
mockNuxtImport('isHydrated', () => navState.hydrated)
mockNuxtImport('currentUser', () => navState.currentUser)
mockNuxtImport('currentServer', () => navState.currentServer)
mockNuxtImport('useState', () => () => navState.moreOpen)
mockNuxtImport('useLocalStorage', () => () => navState.lastAccessedRoute)
mockNuxtImport('useNotifications', () => () => ({ notifications: 0 }))
mockNuxtImport('usePreferences', () => () => navState.preference)
mockNuxtImport('isMediumOrLargeScreen', () => navState.mediumOrLargeScreen)
mockNuxtImport('isSmallScreen', () => navState.smallScreen)

function navigationStubs() {
  const linkStub = {
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : \'\'"><slot /></a>',
  }

  return {
    NuxtLink: linkStub,
    NavSideItem: linkStub,
    CommonDropdown: { template: '<div><slot /><slot name="popper" /></div>' },
    CommonTooltip: { template: '<div><slot /></div>' },
    CommonDropdownItem: { props: ['text'], template: '<span>{{ text }}</span>' },
    Transition: { template: '<div><slot /></div>' },
  }
}

async function getMoreMenuHrefs(variant: 'desktop' | 'mobile') {
  const wrapper = await mountSuspended(NavSide, {
    props: { variant },
    global: {
      mocks: { $t: (key: string) => key },
      stubs: navigationStubs(),
    },
  })

  if (variant === 'mobile')
    await wrapper.get('#nav-side-more-mobile-inline').trigger('click')

  const menu = wrapper.get(`#nav-side-more-items-${variant === 'desktop' ? 'desktop-floating' : 'mobile-inline'}`)
  const hrefs = menu.findAll('a').map(link => link.attributes('href'))
  wrapper.unmount()
  return hrefs
}

describe('side navigation more menu order', () => {
  beforeEach(() => {
    navState.route.value = { path: '/home' }
    navState.hydrated.value = true
    navState.currentUser.value = { account: { id: 'test-user' } }
    navState.currentServer.value = 'qaf.men'
    navState.moreOpen.value = false
    navState.lastAccessedRoute.value = ''
  })

  it.each(['desktop', 'mobile'] as const)('places Explore above Direct Messages in the %s menu', async (variant) => {
    const hrefs = await getMoreMenuHrefs(variant)
    const exploreIndex = hrefs.indexOf('/qaf.men/explore')
    const directMessagesIndex = hrefs.indexOf('/conversations')

    expect(exploreIndex).toBeGreaterThan(-1)
    expect(directMessagesIndex).toBeGreaterThan(-1)
    expect(exploreIndex).toBeLessThan(directMessagesIndex)
  })
})
