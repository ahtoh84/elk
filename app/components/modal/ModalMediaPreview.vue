<script setup lang="ts">
const emit = defineEmits(['close'])

const locked = useScrollLock(document.body)

// Use to avoid strange error when directlying assigning to v-model on ModelMediaPreviewCarousel
const index = mediaPreviewIndex

const hasNext = computed(() => index.value < mediaPreviewList.value.length - 1)
const hasPrev = computed(() => index.value > 0)

const keys = useMagicKeys()

whenever(keys.arrowLeft, prev)
whenever(keys.arrowRight, next)

function next() {
  if (hasNext.value)
    index.value++
}

function prev() {
  if (hasPrev.value)
    index.value--
}

function onClick(e: MouseEvent) {
  const path = e.composedPath() as HTMLElement[]
  const el = path.find(el => ['A', 'BUTTON', 'IMG', 'VIDEO', 'P'].includes(el.tagName?.toUpperCase()))
  if (!el)
    emit('close')
}

onMounted(() => locked.value = true)
onUnmounted(() => locked.value = false)
</script>

<template>
  <div relative h-full w-full @click="onClick">
    <button
      v-if="mediaPreviewList.length > 1"
      :disabled="!hasNext"
      :class="{ 'opacity-40': !hasNext }"
      type="button"
      class="pointer-events-auto btn-action-icon h-11 w-11 bg-white/10 hover:bg-white/20 absolute right-2 top-1/2 -translate-y-1/2 z5"
      :aria-label="$t('action.next')"
      :title="$t('action.next')" @click="next"
    >
      <div i-ri:arrow-right-s-line text-white />
    </button>
    <button
      v-if="mediaPreviewList.length > 1"
      :disabled="!hasPrev"
      :class="{ 'opacity-40': !hasPrev }"
      type="button"
      class="pointer-events-auto btn-action-icon h-11 w-11 bg-white/10 hover:bg-white/20 absolute left-2 top-1/2 -translate-y-1/2 z5"
      :aria-label="$t('action.prev')"
      :title="$t('action.prev')" @click="prev"
    >
      <div i-ri:arrow-left-s-line text-white />
    </button>

    <ModalMediaPreviewCarousel v-model="index" :media="mediaPreviewList" @close="emit('close')" />

    <button
      type="button"
      btn-action-icon h-11 w-11 bg="white/10" hover:bg="white/20"
      pointer-events-auto absolute left-2 top-2 z5
      :aria-label="$t('action.close')" @click="emit('close')"
    >
      <div i-ri:close-line text-white />
    </button>
  </div>
</template>
