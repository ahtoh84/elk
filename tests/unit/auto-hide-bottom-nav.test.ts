import { describe, expect, it } from 'vitest'

import {
  BOTTOM_NAV_SCROLL_THRESHOLD,
  getBottomNavScrollAction,
} from '~/composables/auto-hide-bottom-nav'

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
})
