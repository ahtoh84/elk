import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h } from 'vue'

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
})
