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

function getMediaAspectRatio(attachment: mastodon.v1.MediaAttachment) {
  const aspect = attachment.meta?.original?.aspect || attachment.meta?.small?.aspect
  if (!aspect)
    return 1

  return Math.min(Math.max(aspect, 0.8), 6)
}
</script>

<template>
  <div
    class="status-media-container"
    :class="{
      'status-media-container--carousel': isCarousel,
      'status-media-container--breakout': isCarousel && breakout,
    }"
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

.status-media-item {
  flex: 0 0 auto;
  width: auto;
  height: clamp(12rem, 62vw, 32rem);
}
</style>
