<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const { blurhash = '', shouldLoadImage = true } = defineProps<{
  blurhash?: string
  src: string
  srcset?: string
  shouldLoadImage?: boolean
}>()

const emit = defineEmits<{
  (event: 'loaded', image: HTMLImageElement): void
  (event: 'error', error: Event): void
}>()
</script>

<template>
  <UnLazyImage
    v-bind="$attrs"
    :blurhash="blurhash"
    :src="src"
    :src-set="srcset"
    :lazy-load="shouldLoadImage"
    auto-sizes
    @loaded="emit('loaded', $event)"
    @error="emit('error', $event)"
  />
</template>
