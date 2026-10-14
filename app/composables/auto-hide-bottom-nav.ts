export const BOTTOM_NAV_SCROLL_THRESHOLD = 4
export const BOTTOM_NAV_HEIGHT = 56

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
  const isDragging = ref(false)
  const offset = ref(0)
  const progress = computed(() => {
    return Math.max(0, Math.min(1, offset.value / BOTTOM_NAV_HEIGHT))
  })

  let lastScrollTop = 0
  let animationFrame: number | undefined
  let scrollEndTimeout: ReturnType<typeof setTimeout> | undefined
  let lastTimestamp = 0
  let velocity = 0

  function getScrollTop() {
    if (!import.meta.client)
      return 0

    const scrollingElement = document.scrollingElement
    return Math.max(window.scrollY, scrollingElement?.scrollTop ?? 0, document.body.scrollTop)
  }

  function reset() {
    if (animationFrame !== undefined) {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = undefined
    }
    if (scrollEndTimeout !== undefined) {
      clearTimeout(scrollEndTimeout)
      scrollEndTimeout = undefined
    }
    isHidden.value = false
    isDragging.value = false
    offset.value = 0
    velocity = 0
    lastScrollTop = getScrollTop()
  }

  function settle() {
    isDragging.value = false
    const currentScrollTop = getScrollTop()

    if (currentScrollTop <= 0) {
      offset.value = 0
      isHidden.value = false
    }
    else if (velocity > 0.25) {
      // Fast downward flick
      offset.value = BOTTOM_NAV_HEIGHT
      isHidden.value = true
    }
    else if (velocity < -0.25) {
      // Fast upward flick
      offset.value = 0
      isHidden.value = false
    }
    else {
      // Settle based on threshold
      if (offset.value >= BOTTOM_NAV_HEIGHT * 0.4) {
        offset.value = BOTTOM_NAV_HEIGHT
        isHidden.value = true
      }
      else {
        offset.value = 0
        isHidden.value = false
      }
    }
    velocity = 0
  }

  function updateFromScroll() {
    if (!enabled.value) {
      reset()
      return
    }

    const currentScrollTop = getScrollTop()
    const delta = currentScrollTop - lastScrollTop
    const now = performance.now()
    const dt = lastTimestamp ? now - lastTimestamp : 16
    lastTimestamp = now

    if (dt > 0 && Math.abs(delta) >= 1)
      velocity = delta / dt

    if (currentScrollTop <= 0) {
      offset.value = 0
      isHidden.value = false
      isDragging.value = false
      lastScrollTop = 0
      return
    }

    // Ignore bottom rubber-banding on mobile Safari
    const scrollHeight = document.scrollingElement?.scrollHeight ?? document.documentElement?.scrollHeight ?? 0
    if (window.innerHeight > 0 && scrollHeight > window.innerHeight) {
      const maxScroll = scrollHeight - window.innerHeight
      if (currentScrollTop >= maxScroll && delta > 0) {
        lastScrollTop = currentScrollTop
        return
      }
    }

    if (Math.abs(delta) >= 1) {
      isDragging.value = true
      offset.value = Math.max(0, Math.min(BOTTOM_NAV_HEIGHT, offset.value + delta))
      lastScrollTop = currentScrollTop

      if (offset.value >= BOTTOM_NAV_HEIGHT)
        isHidden.value = true
      else if (offset.value <= 0)
        isHidden.value = false
    }

    // Debounced settle
    if (scrollEndTimeout !== undefined)
      clearTimeout(scrollEndTimeout)
    scrollEndTimeout = setTimeout(settle, 120)
  }

  function onScroll() {
    if (!enabled.value || animationFrame !== undefined)
      return

    let executed = false
    animationFrame = window.requestAnimationFrame(() => {
      executed = true
      animationFrame = undefined
      updateFromScroll()
    })
    if (executed)
      animationFrame = undefined
  }

  function onScrollEnd() {
    if (scrollEndTimeout !== undefined) {
      clearTimeout(scrollEndTimeout)
      scrollEndTimeout = undefined
    }
    settle()
  }

  function onTouchStart() {
    if (!enabled.value)
      return
    lastScrollTop = getScrollTop()
    lastTimestamp = performance.now()
    velocity = 0
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
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    if ('onscrollend' in window)
      window.addEventListener('scrollend', onScrollEnd, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('touchstart', onTouchStart)
    if ('onscrollend' in window)
      window.removeEventListener('scrollend', onScrollEnd)
    reset()
  })

  return {
    isHidden,
    isDragging,
    offset,
    progress,
  }
}
