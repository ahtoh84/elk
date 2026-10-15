import { mountSuspended } from '@nuxt/test-utils/runtime'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, ref } from 'vue'

import MainContent from '~/components/main/MainContent.vue'
import {
  BOTTOM_NAV_SCROLL_THRESHOLD,
  getBottomNavScrollAction,
  useAutoHideBottomNav,
} from '~/composables/auto-hide-bottom-nav'

let wrapper: ReturnType<typeof mount> | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('auto-hide bottom navigation helpers', () => {
  it('hides while the user scrolls towards older posts', () => {
    expect(getBottomNavScrollAction(120, 140)).toBe('hide')
  })

  it('shows when the user scrolls back towards newer posts or reaches the top', () => {
    expect(getBottomNavScrollAction(140, 120)).toBe('show')
    expect(getBottomNavScrollAction(20, 0)).toBe('show')
  })

  it('ignores small scroll changes to prevent flicker', () => {
    expect(getBottomNavScrollAction(120, 120 + BOTTOM_NAV_SCROLL_THRESHOLD - 1)).toBe('none')
  })

  it('keeps the navigation hidden after upward scrolling stops', async () => {
    vi.useFakeTimers()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 1
    })

    let navigation!: ReturnType<typeof useAutoHideBottomNav>
    wrapper = mount(defineComponent({
      setup() {
        navigation = useAutoHideBottomNav(computed(() => true))
        return () => h('div')
      },
    }))

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 })
    window.dispatchEvent(new Event('scroll'))
    await Promise.resolve()

    expect(navigation.isHidden.value).toBe(true)

    vi.advanceTimersByTime(1000)

    expect(navigation.isHidden.value).toBe(true)
  })

  it('tracks drag progress continuously and snaps back when reaching the top', async () => {
    vi.useFakeTimers()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 1
    })

    let navigation!: ReturnType<typeof useAutoHideBottomNav>
    wrapper = mount(defineComponent({
      setup() {
        navigation = useAutoHideBottomNav(computed(() => true))
        return () => h('div')
      },
    }))

    // Scroll down 28px (half of 56px)
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 28 })
    window.dispatchEvent(new Event('scroll'))
    await Promise.resolve()

    expect(navigation.isDragging.value).toBe(true)
    expect(navigation.progress.value).toBeCloseTo(0.5, 1)

    // Scroll to top
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
    window.dispatchEvent(new Event('scroll'))
    await Promise.resolve()

    expect(navigation.progress.value).toBe(0)
    expect(navigation.isHidden.value).toBe(false)
  })

  it('applies hidden and dragging classes to MainContent header from provided navAutoHide context', async () => {
    const isHidden = ref(false)
    const isDragging = ref(false)
    const progress = ref(0)

    const suspendedWrapper = await mountSuspended(MainContent, {
      global: {
        provide: {
          navAutoHide: {
            isHidden,
            isDragging,
            progress,
          },
        },
        stubs: {
          PwaBadge: true,
          PwaInstallPrompt: true,
          NavUser: true,
          NavUserSkeleton: true,
        },
      },
    })

    const header = suspendedWrapper.find('.main-content-header-container')
    expect(header.exists()).toBe(true)
    expect(header.classes()).not.toContain('main-content-header-container--hidden')
    expect(header.classes()).not.toContain('main-content-header-container--dragging')

    // Dragging state
    isDragging.value = true
    progress.value = 0.5
    await suspendedWrapper.vm.$nextTick()
    expect(header.classes()).toContain('main-content-header-container--dragging')
    expect(header.attributes('style')).toContain('translate3d(0, calc(-0.5 * 100%), 0)')

    // Settled hidden state
    isDragging.value = false
    isHidden.value = true
    progress.value = 1
    await suspendedWrapper.vm.$nextTick()
    expect(header.classes()).toContain('main-content-header-container--hidden')
    expect(header.classes()).not.toContain('main-content-header-container--dragging')
  })
})
