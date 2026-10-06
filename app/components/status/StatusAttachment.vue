<script setup lang="ts">
import type { mastodon } from 'masto'
import { clamp } from '@vueuse/core'
import { decode } from 'blurhash'

const {
  attachment,
  fullSize = false,
  isPreview = false,
  preserveAspectRatio = false,
  isSensitive = false,
  spoilerHidden = false,
} = defineProps<{
  attachment: mastodon.v1.MediaAttachment
  attachments?: mastodon.v1.MediaAttachment[]
  fullSize?: boolean
  isPreview?: boolean
  preserveAspectRatio?: boolean
  isSensitive?: boolean
  spoilerHidden?: boolean
}>()

const src = computed(() => attachment.previewUrl || attachment.url || attachment.remoteUrl!)
const srcset = computed(() => [
  [attachment.url, attachment.meta?.original?.width],
  [attachment.remoteUrl, attachment.meta?.original?.width],
  [attachment.previewUrl, attachment.meta?.small?.width],
].filter(([url]) => url).map(([url, size]) => `${url} ${size}w`).join(', '))

const typeExtsMap = {
  video: ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'mpg', 'mpeg'],
  audio: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'],
  image: ['jpg', 'jpeg', 'png', 'svg', 'webp', 'bmp'],
  gifv: ['gifv', 'gif'],
}

const type = computed(() => {
  if (attachment.type && attachment.type !== 'unknown')
    return attachment.type
  // some server returns unknown type, we need to guess it based on file extension
  for (const [type, exts] of Object.entries(typeExtsMap)) {
    if (exts.some(ext => src.value?.toLowerCase().endsWith(`.${ext}`)))
      return type
  }
  return 'unknown'
})

const isVideoAttachment = computed(() => type.value === 'video' || type.value === 'gifv')

const rawAspectRatio = computed(() => {
  if (attachment.meta?.original?.aspect)
    return attachment.meta.original.aspect
  if (attachment.meta?.small?.aspect)
    return attachment.meta.small.aspect
  return undefined
})

const aspectRatio = computed(() => {
  if (fullSize || preserveAspectRatio || isVideoAttachment.value)
    return rawAspectRatio.value
  if (rawAspectRatio.value)
    return clamp(rawAspectRatio.value, 0.8, 6)
  return undefined
})

const objectPosition = computed(() => {
  const focusX = attachment.meta?.focus?.x || 0
  const focusY = attachment.meta?.focus?.y || 0
  const x = ((focusX / 2) + 0.5) * 100
  const y = ((focusY / -2) + 0.5) * 100

  return `${x}% ${y}%`
})

const video = ref<HTMLVideoElement | undefined>()
const videoReady = ref(false)
const videoPlayFailed = ref(false)
let videoFrameToken = 0
const prefersReducedMotion = usePreferredReducedMotion()
const isAudio = computed(() => attachment.type === 'audio')
const isVideo = computed(() => type.value === 'video')
const isGif = computed(() => type.value === 'gifv')
const sensitiveMediaRevealed = ref(false)
const isSpoilerHidden = computed(() => isSensitive && spoilerHidden && !sensitiveMediaRevealed.value)
const imageSrc = computed(() => isSpoilerHidden.value ? attachment.previewUrl || src.value : src.value)
const imageSrcset = computed(() => isSpoilerHidden.value ? undefined : srcset.value)

const enableAutoplay = usePreferences('enableAutoplay')
const unmuteVideos = usePreferences('unmuteVideos')

useIntersectionObserver(video, (entries) => {
  const ready = video.value?.dataset.ready === 'true'
  if (isSpoilerHidden.value) {
    if (ready && !video.value?.paused)
      video.value?.pause()

    return
  }

  if (prefersReducedMotion.value === 'reduce' || !enableAutoplay.value) {
    if (ready && !video.value?.paused)
      video.value?.pause()

    return
  }

  entries.forEach((entry) => {
    if (entry.intersectionRatio <= 0.75) {
      if (ready && !video.value?.paused)
        video.value?.pause()
    }
    else {
      video.value?.play().then(() => {
        video.value!.dataset.ready = 'true'
      }).catch(() => {
        videoPlayFailed.value = true
      })
    }
  })
}, { threshold: 0.75 })

const userSettings = useUserSettings()

const shouldLoadAttachment = ref(isPreview || !getPreferences(userSettings.value, 'enableDataSaving'))

function loadAttachment() {
  shouldLoadAttachment.value = true
}

function revealSensitiveMedia() {
  sensitiveMediaRevealed.value = true
  loadAttachment()
}

const blurHashSrc = computed(() => {
  if (!attachment.blurhash)
    return ''
  const pixels = decode(attachment.blurhash, 32, 32)
  return getDataUrlFromArr(pixels, 32, 32)
})

const sensitiveBlurhash = computed(() => isSensitive ? attachment.blurhash || '' : '')
const shouldLoadImage = computed(() => shouldLoadAttachment.value || isSpoilerHidden.value)

const videoThumbnail = computed(() => (isSpoilerHidden.value || shouldLoadAttachment.value)
  ? attachment.previewUrl || blurHashSrc.value
  : blurHashSrc.value)
const imageLoaded = ref(!sensitiveBlurhash.value || !shouldLoadImage.value)

function resetImageLoadState() {
  imageLoaded.value = !sensitiveBlurhash.value || !shouldLoadImage.value
}

function onImageLoaded() {
  imageLoaded.value = true
}

function onVideoFrameReady() {
  const element = video.value
  if (!element || videoReady.value)
    return

  const token = ++videoFrameToken
  const markVideoReady = () => {
    if (token === videoFrameToken)
      videoReady.value = true
  }

  if ('requestVideoFrameCallback' in element)
    element.requestVideoFrameCallback(markVideoReady)
  else
    requestAnimationFrame(() => requestAnimationFrame(markVideoReady))
}

watch(shouldLoadAttachment, () => {
  videoFrameToken++
  videoReady.value = false
  videoPlayFailed.value = false
  resetImageLoadState()
})

watch(shouldLoadImage, resetImageLoadState)

watch(() => attachment.url, () => {
  videoFrameToken++
  videoReady.value = false
  videoPlayFailed.value = false
  resetImageLoadState()
})

watch([() => isSensitive, () => spoilerHidden], ([sensitive, hidden]) => {
  if (sensitive && hidden)
    sensitiveMediaRevealed.value = false
})

watch(isSpoilerHidden, async (hidden) => {
  if (hidden) {
    video.value?.pause()
    videoReady.value = false
    videoPlayFailed.value = false
    return
  }

  await nextTick()
  if (!video.value || !shouldLoadAttachment.value || !enableAutoplay.value || prefersReducedMotion.value === 'reduce')
    return

  video.value.play().then(() => {
    video.value!.dataset.ready = 'true'
  }).catch(() => {
    videoPlayFailed.value = true
  })
})

onBeforeUnmount(() => {
  videoFrameToken++
})
</script>

<template>
  <div relative ma flex :gap="isAudio ? '2' : ''">
    <template v-if="type === 'video'">
      <div relative class="status-attachment-spoiler-frame" :class="{ 'status-attachment-spoiler-frame--hidden': isSpoilerHidden }">
        <img
          v-if="videoThumbnail"
          :src="videoThumbnail"
          class="status-video-poster"
          :class="{ 'status-video-poster--spoiler': isSpoilerHidden }"
          aria-hidden="true"
          :width="attachment.meta?.original?.width"
          :height="attachment.meta?.original?.height"
          :style="{
            aspectRatio,
            objectPosition,
          }"
          rounded-lg
          object-cover
        >
        <video
          ref="video"
          :poster="videoThumbnail || undefined"
          :preload="shouldLoadAttachment ? 'auto' : 'none'"
          :muted="!unmuteVideos"
          loop
          playsinline
          :controls="shouldLoadAttachment && !isSpoilerHidden"
          rounded-lg
          object-cover
          fullscreen:object-contain
          :width="attachment.meta?.original?.width"
          :height="attachment.meta?.original?.height"
          :style="{
            aspectRatio,
            objectPosition,
          }"
          class="status-video"
          :class="[
            isSpoilerHidden ? 'status-video--spoiler-hidden' : '',
            !shouldLoadAttachment ? 'brightness-60 hover:brightness-70 transition-filter' : '',
            {
              'status-video--pending': videoThumbnail
                && enableAutoplay
                && prefersReducedMotion !== 'reduce'
                && !videoReady
                && !videoPlayFailed,
            },
          ]"
          @loadeddata="onVideoFrameReady"
          @playing="onVideoFrameReady"
        >
          <source v-if="!isSpoilerHidden" :src="attachment.url || attachment.previewUrl" type="video/mp4">
        </video>
        <button
          v-if="isSpoilerHidden"
          type="button"
          class="status-attachment-spoiler__reveal"
          absolute inset-0 z-2
          :aria-label="$t('status.spoiler_show_more')"
          @click="revealSensitiveMedia"
        />
        <button
          v-else-if="!shouldLoadAttachment"
          type="button"
          absolute inset-0 z-2 w-full h-full bg-transparent cursor-pointer
          text-sm
          text-white
          flex flex-col justify-center items-center
          focus:outline-none
          focus:ring="2 primary inset"
          :aria-label="$t('action.load_video')"
          @click="loadAttachment"
        >
          <span aria-hidden="true" class="i-ri:video-download-line" w-6 h-6 />
        </button>
      </div>
    </template>
    <template v-else-if="type === 'gifv'">
      <button
        type="button"
        relative overflow-hidden rounded-lg
        :aria-label="isSpoilerHidden ? $t('status.spoiler_show_more') : $t('action.open_image_preview_dialog')"
        @click="isSpoilerHidden ? revealSensitiveMedia() : !shouldLoadAttachment ? loadAttachment() : openMediaPreview(attachments ? attachments : [attachment], attachments?.indexOf(attachment) || 0)"
      >
        <img
          v-if="videoThumbnail"
          :src="videoThumbnail"
          class="status-video-poster"
          :class="{ 'status-video-poster--spoiler': isSpoilerHidden }"
          aria-hidden="true"
          :width="attachment.meta?.original?.width"
          :height="attachment.meta?.original?.height"
          :style="{
            aspectRatio,
            objectPosition,
          }"
          rounded-lg
          object-cover
        >
        <video
          ref="video"
          :poster="videoThumbnail || undefined"
          :preload="shouldLoadAttachment ? 'auto' : 'none'"
          :muted="!unmuteVideos"
          loop
          playsinline
          rounded-lg
          object-cover
          :width="attachment.meta?.original?.width"
          :height="attachment.meta?.original?.height"
          :style="{
            aspectRatio,
            objectPosition,
          }"
          class="status-video"
          :class="{
            'status-video--spoiler-hidden': isSpoilerHidden,
            'status-video--pending': isSpoilerHidden || (videoThumbnail
              && enableAutoplay
              && prefersReducedMotion !== 'reduce'
              && !videoReady
              && !videoPlayFailed),
          }"
          @loadeddata="onVideoFrameReady"
          @playing="onVideoFrameReady"
        >
          <source v-if="!isSpoilerHidden" :src="attachment.url || attachment.previewUrl" type="video/mp4">
        </video>
        <span
          v-if="!isSpoilerHidden && !shouldLoadAttachment"
          class="status-attachment-load"
          absolute
          text-sm
          text-white
          flex flex-col justify-center items-center
          gap-3 w-6 h-6
          pointer-events-none
          i-ri:video-download-line
        />
      </button>
    </template>
    <template v-else-if="type === 'audio'">
      <audio controls h-15>
        <source :src="attachment.url || attachment.previewUrl" type="audio/mp3">
      </audio>
    </template>
    <template v-else>
      <button
        type="button"
        focus:outline-none
        focus:ring="2 primary inset"
        rounded-lg
        h-full
        w-full
        :aria-label="isSpoilerHidden ? $t('status.spoiler_show_more') : $t('action.open_image_preview_dialog')"
        relative
        overflow-hidden
        @click="isSpoilerHidden ? revealSensitiveMedia() : !shouldLoadAttachment ? loadAttachment() : openMediaPreview(attachments ? attachments : [attachment], attachments?.indexOf(attachment) || 0)"
      >
        <CommonBlurhash
          :blurhash="sensitiveBlurhash"
          class="status-attachment-image"
          :src="imageSrc"
          :srcset="imageSrcset"
          :width="attachment.meta?.original?.width"
          :height="attachment.meta?.original?.height"
          :alt="attachment.description ?? 'Image'"
          :style="{
            aspectRatio,
            objectPosition,
          }"
          :should-load-image="shouldLoadImage"
          rounded-lg
          h-full
          w-full
          object-cover
          :draggable="shouldLoadAttachment"
          :class="[
            !shouldLoadImage ? 'brightness-60 hover:brightness-70 transition-filter' : '',
            {
              'status-attachment-image--spoiler': isSpoilerHidden,
              'status-attachment-image--blurhash-loading': sensitiveBlurhash
                && shouldLoadImage
                && !imageLoaded,
            },
          ]"
          @loaded="onImageLoaded"
        />
        <span
          v-if="!isSpoilerHidden && !shouldLoadAttachment"
          class="status-attachment-load"
          absolute
          text-sm
          text-white
          flex flex-col justify-center items-center
          gap-3 w-6 h-6
          pointer-events-none
          i-ri:file-download-line
        />
      </button>
    </template>
    <div
      :class="isAudio ? [] : [
        'absolute left-2',
        isVideo ? 'top-2' : 'bottom-2',
      ]"
      flex gap-col-2
    >
      <VDropdown v-if="!isSpoilerHidden && attachment.description && !getPreferences(userSettings, 'hideAltIndicatorOnPosts')" :distance="6" placement="bottom-start">
        <button
          font-bold text-sm
          :class="isAudio
            ? 'rounded-full h-15 w-15 btn-outline border-base text-secondary hover:bg-active hover:text-active'
            : 'rounded-1 bg-black/65 text-white hover:bg-black px1.2 py0.2'"
        >
          <div hidden>
            {{ $t('status.img_alt.read', [attachment.type]) }}
          </div>
          {{ $t('status.img_alt.ALT') }}
        </button>
        <template #popper>
          <div p4 flex flex-col gap-2 max-w-130>
            <div flex justify-between>
              <h2 font-bold text-xl text-secondary>
                {{ $t('status.img_alt.desc') }}
              </h2>
              <button v-close-popper text-sm btn-outline py0 px2 text-secondary border-base>
                {{ $t('status.img_alt.dismiss') }}
              </button>
            </div>
            <p whitespace-pre-wrap>
              {{ attachment.description }}
            </p>
          </div>
        </template>
      </VDropdown>
      <div v-if="!isSpoilerHidden && isGif && !getPreferences(userSettings, 'hideGifIndicatorOnPosts')">
        <button
          aria-hidden font-bold text-sm
          rounded-1 bg-black:65 text-white px1.2 py0.2 pointer-events-none
        >
          {{ $t('status.gif') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="postcss">
.status-video-poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.status-video {
  position: relative;
  z-index: 1;
  opacity: 1;
  transition: opacity 180ms ease-out;
}

.status-video--pending {
  opacity: 0;
}

.status-attachment-load {
  left: 50%;
  top: 50%;
  translate: -50% -50%;
}

.status-attachment-image {
  transition: opacity 180ms ease-out;
}

.status-attachment-image--blurhash-loading {
  filter: blur(8px);
  opacity: 0.92;
}

.status-attachment-spoiler-frame--hidden {
  overflow: hidden;
  border-radius: 0.5rem;
  background: #151515;
}

.status-video--spoiler-hidden {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.status-video-poster--spoiler,
.status-attachment-image--spoiler {
  filter: blur(14px) brightness(0.72);
  transform: scale(1.08);
  transition: none !important;
}

.status-media-container--single-video .status-video-poster--spoiler {
  position: relative;
  inset: auto;
  display: block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: min(430px, 70vh);
}

.status-attachment-spoiler__reveal {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.status-attachment-spoiler__reveal:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: -4px;
}

@media (prefers-reduced-motion: reduce) {
  .status-video,
  .status-attachment-image {
    transition-duration: 0ms;
  }

  .status-attachment-image--blurhash-loading:not(.status-attachment-image--spoiler) {
    filter: none;
    opacity: 1;
  }
}
</style>
