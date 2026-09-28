<script setup lang="ts">
import type { mastodon } from 'masto'

const { status, isPreview = false, breakout = false } = defineProps<{
  status: mastodon.v1.Status | mastodon.v1.StatusEdit
  fullSize?: boolean
  isPreview?: boolean
  breakout?: boolean
}>()

const gridColumnNumber = computed(() => {
  const num = status.mediaAttachments.length
  if (num <= 1)
    return 1
  else if (num <= 4)
    return 2
  else
    return 3
})

const isCarousel = computed(() => status.mediaAttachments.length > 1)

const isDragging = ref(false)
const suppressClick = ref(false)

let dragState: {
  element: HTMLElement
  pointerId: number
  startX: number
  startY: number
  startScrollLeft: number
} | undefined

let dragSafetyListenersAttached = false

function getMediaAspectRatio(attachment: mastodon.v1.MediaAttachment) {
  const aspect = attachment.meta?.original?.aspect || attachment.meta?.small?.aspect
  if (!aspect)
    return 1

  return Math.min(Math.max(aspect, 0.8), 6)
}

function onWindowPointerUp(event: PointerEvent) {
  resetCarouselDrag(event.pointerId, true)
}

function onWindowPointerCancel(event: PointerEvent) {
  resetCarouselDrag(event.pointerId)
}

function onWindowBlur() {
  resetCarouselDrag(undefined, isDragging.value)
}

function onVisibilityChange() {
  if (document.visibilityState !== 'visible')
    resetCarouselDrag(undefined, isDragging.value)
}

function attachDragSafetyListeners() {
  if (dragSafetyListenersAttached)
    return

  window.addEventListener('pointerup', onWindowPointerUp)
  window.addEventListener('pointercancel', onWindowPointerCancel)
  window.addEventListener('blur', onWindowBlur)
  document.addEventListener('visibilitychange', onVisibilityChange)
  dragSafetyListenersAttached = true
}

function detachDragSafetyListeners() {
  if (!dragSafetyListenersAttached)
    return

  window.removeEventListener('pointerup', onWindowPointerUp)
  window.removeEventListener('pointercancel', onWindowPointerCancel)
  window.removeEventListener('blur', onWindowBlur)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  dragSafetyListenersAttached = false
}

function resetCarouselDrag(pointerId?: number, shouldSuppressClick = false) {
  const state = dragState
  if (!state || (pointerId !== undefined && pointerId !== state.pointerId))
    return

  const wasDragging = isDragging.value
  dragState = undefined
  isDragging.value = false
  detachDragSafetyListeners()

  if (shouldSuppressClick && wasDragging)
    suppressClick.value = true

  if (state.element.hasPointerCapture(state.pointerId))
    state.element.releasePointerCapture(state.pointerId)
}

function onCarouselPointerDown(event: PointerEvent) {
  if (!isCarousel.value || event.pointerType !== 'mouse' || event.button !== 0)
    return

  resetCarouselDrag()
  suppressClick.value = false

  const element = event.currentTarget as HTMLElement
  dragState = {
    element,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startScrollLeft: element.scrollLeft,
  }
  attachDragSafetyListeners()
}

function onCarouselPointerMove(event: PointerEvent) {
  if (!dragState || event.pointerId !== dragState.pointerId)
    return

  if ((event.buttons & 1) !== 1) {
    resetCarouselDrag(event.pointerId, true)
    return
  }

  const deltaX = event.clientX - dragState.startX
  const deltaY = event.clientY - dragState.startY

  if (!isDragging.value) {
    if (Math.abs(deltaX) < 4 && Math.abs(deltaY) < 4)
      return

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      resetCarouselDrag(event.pointerId)
      return
    }

    dragState.element.setPointerCapture(event.pointerId)
    isDragging.value = true
  }

  event.preventDefault()
  dragState.element.scrollLeft = dragState.startScrollLeft - deltaX
}

function onCarouselPointerUp(event: PointerEvent) {
  resetCarouselDrag(event.pointerId, true)
}

function onCarouselPointerCancel(event: PointerEvent) {
  resetCarouselDrag(event.pointerId)
}

function onCarouselLostPointerCapture(event: PointerEvent) {
  resetCarouselDrag(event.pointerId, true)
}

function onCarouselClick(event: MouseEvent) {
  if (!suppressClick.value)
    return

  event.preventDefault()
  event.stopPropagation()
  suppressClick.value = false
}

onBeforeUnmount(() => resetCarouselDrag())
</script>

<template>
  <div
    class="status-media-container"
    :class="{
      'status-media-container--carousel': isCarousel,
      'status-media-container--breakout': isCarousel && breakout,
      'status-media-container--dragging': isDragging,
    }"
    @pointerdown="onCarouselPointerDown"
    @pointermove="onCarouselPointerMove"
    @pointerup="onCarouselPointerUp"
    @pointercancel="onCarouselPointerCancel"
    @lostpointercapture="onCarouselLostPointerCapture"
    @dragstart.prevent
    @click.capture="onCarouselClick"
  >
    <template v-for="attachment of status.mediaAttachments" :key="attachment.id">
      <div
        v-if="isCarousel"
        class="status-media-item"
        :style="{ aspectRatio: getMediaAspectRatio(attachment) }"
      >
        <StatusAttachment
          :attachment="attachment"
          :attachments="status.mediaAttachments"
          :full-size="fullSize"
          w-full
          h-full
          :is-preview="isPreview"
        />
      </div>
      <StatusAttachment
        v-else
        :attachment="attachment"
        :attachments="status.mediaAttachments"
        :full-size="fullSize"
        w-full
        h-full
        :is-preview="isPreview"
      />
    </template>
  </div>
</template>

<style lang="postcss">
.status-media-container {
  --grid-cols: v-bind(gridColumnNumber);
  display: grid;
  grid-template-columns: repeat(var(--grid-cols, 1), 1fr);
  --at-apply: gap-2;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.status-media-container--carousel {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-inline: contain;
  scrollbar-width: none;
  touch-action: pan-x pan-y;
  cursor: grab;
}

.status-media-container--carousel::-webkit-scrollbar {
  display: none;
}

.status-media-container--breakout {
  --status-media-offset: calc(54px + 1.5rem);
  width: calc(100% + var(--status-media-offset));
  margin-inline-start: calc(-1 * var(--status-media-offset));
  padding-inline-start: var(--status-media-offset);
}

.status-media-container--dragging {
  cursor: grabbing;
  user-select: none;
}

.status-media-container--carousel img {
  user-select: none;
  -webkit-user-drag: none;
}

.status-media-item {
  flex: 0 0 auto;
  width: auto;
  height: clamp(10rem, 52vw, 26rem);
  transform-origin: center;
  transition: transform 420ms cubic-bezier(0.22, 1.2, 0.36, 1);
  will-change: transform;
}

.status-media-item:active {
  transform: scale(0.97);
  transition-duration: 120ms;
  transition-timing-function: ease-out;
}

.status-media-container--dragging .status-media-item:active {
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .status-media-item {
    transition: none;
  }
}
</style>
