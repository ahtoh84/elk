import { describe, expect, it } from 'vitest'

import {
  getPullDistance,
  PULL_TO_REFRESH_THRESHOLD,
  shouldIgnorePullToRefreshTarget,
} from '~/composables/pullToRefresh'

describe('pull-to-refresh helpers', () => {
  it('applies a rubber-band limit to the pull distance', () => {
    expect(getPullDistance(0)).toBe(0)
    expect(getPullDistance(40)).toBe(20)
    expect(getPullDistance(1000)).toBe(96)
  })

  it('ignores interactive and horizontal media targets', () => {
    const root = document.createElement('div')
    root.innerHTML = '<button>action</button><div class="status-media-container--carousel"><img></div><div class="feed-copy">text</div>'

    expect(shouldIgnorePullToRefreshTarget(root.querySelector('button'))).toBe(true)
    expect(shouldIgnorePullToRefreshTarget(root.querySelector('img'))).toBe(true)
    expect(shouldIgnorePullToRefreshTarget(root.querySelector('.feed-copy'))).toBe(false)
  })

  it('uses a threshold that requires an intentional pull', () => {
    expect(PULL_TO_REFRESH_THRESHOLD).toBeGreaterThan(40)
    expect(PULL_TO_REFRESH_THRESHOLD).toBeLessThan(80)
  })
})
