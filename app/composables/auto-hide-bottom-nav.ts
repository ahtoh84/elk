export const BOTTOM_NAV_SCROLL_THRESHOLD = 4
export const BOTTOM_NAV_IDLE_DELAY = 180

export type BottomNavScrollAction = 'hide' | 'show' | 'none'

export function getBottomNavScrollAction(
  previousScrollTop: number,
  currentScrollTop: number,
  threshold = BOTTOM_NAV_SCROLL_THRESHOLD,
): BottomNavScrollAction {
  if (currentScrollTop <= 0)
    return 'show'

  const delta = currentScrollTop - previousScrollTop
  if (Math.abs(delta) < threshold)
    return 'none'

  // A growing scrollTop means the user's finger is moving upward through older posts.
  return delta > 0 ? 'hide' : 'show'
}

export function useAutoHideBottomNav(enabled: ComputedRef<boolean>) {
  const isHidden = ref(false)

  let lastScrollTop = 0
  let animationFrame: number | undefined
  let idleTimer: number | undefined

  function getScrollTop() {
    if (!import.meta.client)
      return 0

    const scrollingElement = document.scrollingElement
    return Math.max(window.scrollY, scrollingElement?.scrollTop ?? 0, document.body.scrollTop)
  }

  function clearIdleTimer() {
    if (idleTimer !== undefined) {
      window.clearTimeout(idleTimer)
      idleTimer = undefined
    }
  }

  function revealAfterScrollStops() {
    clearIdleTimer()
    idleTimer = window.setTimeout(() => {
      isHidden.value = false
      idleTimer = undefined
    }, BOTTOM_NAV_IDLE_DELAY)
  }

  function reset() {
    if (animationFrame !== undefined) {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = undefined
    }
    clearIdleTimer()
    isHidden.value = false
    lastScrollTop = getScrollTop()
  }

  function updateFromScroll() {
    animationFrame = undefined

    if (!enabled.value) {
      reset()
      return
    }

    const currentScrollTop = getScrollTop()
    const action = getBottomNavScrollAction(lastScrollTop, currentScrollTop)

    // Keep the previous meaningful position so small events accumulate instead of
    // making the navigation flicker on low-frequency touch scroll events.
    if (action !== 'none')
      lastScrollTop = currentScrollTop

    if (action === 'hide')
      isHidden.value = true
    else if (action === 'show')
      isHidden.value = false

    revealAfterScrollStops()
  }

  function onScroll() {
    if (!enabled.value || animationFrame !== undefined)
      return

    animationFrame = window.requestAnimationFrame(updateFromScroll)
  }

  watch(enabled, (value) => {
    if (!import.meta.client)
      return

    reset()
    if (value)
      lastScrollTop = getScrollTop()
  }, { immediate: true })

  onMounted(() => {
    lastScrollTop = getScrollTop()
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    reset()
  })

  return {
    isHidden,
  }
}
