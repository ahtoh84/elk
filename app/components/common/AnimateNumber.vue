<script setup lang="ts">
defineProps<{
  increased?: boolean
}>()
</script>

<template>
  <div of-hidden h="1.25rem">
    <div class="animate-number-roll" flex="~ col" :class="increased ? 'translate-y--1/2' : 'translate-y-0'">
      <slot />
      <slot name="next" />
    </div>
  </div>
</template>

<style scoped>
.animate-number-roll {
  transition: transform 150ms cubic-bezier(0.23, 1, 0.32, 1);
}

@media (prefers-reduced-motion: reduce) {
  .animate-number-roll {
    transition: none;
  }
}
</style>
