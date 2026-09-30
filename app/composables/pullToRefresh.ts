export const PULL_TO_REFRESH_THRESHOLD = 56
const PULL_TO_REFRESH_MAX_DISTANCE = 96

type PullToRefreshHandler = () => void | Promise<void>

interface PullToRefreshContext {
  hasHandlers: ComputedRef<boolean>
  register: (handler: PullToRefreshHandler) => () => void
  refresh: () => Promise<void>
}

const pullToRefreshKey = Symbol('pull-to-refresh')

export function getPullDistance(distance: number) {
  return Math.min(PULL_TO_REFRESH_MAX_DISTANCE, Math.max(0, distance * 0.5))
}

export function shouldIgnorePullToRefreshTarget(target: EventTarget | null) {
  if (!(target instanceof Element))
    return true

  return !!target.closest(
    'button, input, textarea, select, option, video, audio, [contenteditable="true"], [role="button"], [data-pull-to-refresh-ignore], .status-media-container--carousel, .nav-bottom, [role="dialog"]',
  )
}

export function providePullToRefresh(): PullToRefreshContext {
  const handlers = new Set<PullToRefreshHandler>()
  const handlerCount = ref(0)

  const context: PullToRefreshContext = {
    hasHandlers: computed(() => handlerCount.value > 0),
    register(handler) {
      handlers.add(handler)
      handlerCount.value = handlers.size
      return () => {
        handlers.delete(handler)
        handlerCount.value = handlers.size
      }
    },
    async refresh() {
      for (const handler of handlers)
        await handler()
    },
  }

  provide(pullToRefreshKey, context)
  return context
}

export function usePullToRefreshRegistration(handler: PullToRefreshHandler) {
  const context = inject<PullToRefreshContext | undefined>(pullToRefreshKey)
  if (!context)
    return

  let unregister: (() => void) | undefined
  onMounted(() => {
    unregister = context.register(handler)
  })
  onBeforeUnmount(() => unregister?.())
}

export function usePullToRefresh(
  target: Ref<HTMLElement | undefined>,
  refresh: () => Promise<void>,
  enabled: ComputedRef<boolean>,
) {
  const pullDistance = ref(0)
  const isDragging = ref(false)
  const isRefreshing = ref(false)

  let startX = 0
  let startY = 0
  let tracking = false
  let verticalGesture = false

  function isStandalone() {
    if (!import.meta.client)
      return false

    return window.matchMedia?.('(display-mode: standalone)').matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true
  }

  function isAtTop() {
    const scrollingElement = document.scrollingElement
    return Math.max(window.scrollY, scrollingElement?.scrollTop ?? 0, document.body.scrollTop) <= 0
  }

  function reset() {
    tracking = false
    verticalGesture = false
    isDragging.value = false
    pullDistance.value = 0
  }

  function onTouchStart(event: TouchEvent) {
    if (!enabled.value || !isStandalone() || isRefreshing.value || !isAtTop() || event.touches.length !== 1)
      return

    if (shouldIgnorePullToRefreshTarget(event.target))
      return

    const touch = event.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    tracking = true
    verticalGesture = false
  }

  function onTouchMove(event: TouchEvent) {
    if (!tracking || event.touches.length !== 1)
      return

    const touch = event.touches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    if (!verticalGesture) {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 4)
        return

      if (deltaY <= 0 || Math.abs(deltaX) > Math.abs(deltaY)) {
        reset()
        return
      }

      verticalGesture = true
    }

    if (deltaY <= 0) {
      reset()
      return
    }

    event.preventDefault()
    isDragging.value = true
    pullDistance.value = getPullDistance(deltaY)
  }

  async function onTouchEnd() {
    if (!tracking)
      return

    const shouldRefresh = verticalGesture && pullDistance.value >= PULL_TO_REFRESH_THRESHOLD
    if (!shouldRefresh) {
      reset()
      return
    }

    tracking = false
    verticalGesture = false
    isDragging.value = false
    isRefreshing.value = true
    pullDistance.value = PULL_TO_REFRESH_THRESHOLD
    try {
      await refresh()
    }
    catch (error) {
      console.error('Pull-to-refresh failed', error)
    }
    finally {
      isRefreshing.value = false
      pullDistance.value = 0
    }
  }

  function onTouchCancel() {
    reset()
  }

  watch(target, (element, _, onCleanup) => {
    if (!element)
      return

    element.addEventListener('touchstart', onTouchStart, { passive: true })
    element.addEventListener('touchmove', onTouchMove, { passive: false })
    element.addEventListener('touchend', onTouchEnd, { passive: true })
    element.addEventListener('touchcancel', onTouchCancel, { passive: true })

    onCleanup(() => {
      element.removeEventListener('touchstart', onTouchStart)
      element.removeEventListener('touchmove', onTouchMove)
      element.removeEventListener('touchend', onTouchEnd)
      element.removeEventListener('touchcancel', onTouchCancel)
    })
  }, { immediate: true })

  onBeforeUnmount(reset)

  return {
    pullDistance,
    isDragging,
    isRefreshing,
  }
}
