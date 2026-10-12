<script setup lang="ts">
defineProps<{ describedBy: string }>()
</script>

<template>
  <div
    role="alert"
    aria-live="polite"
    :aria-describedby="describedBy"
    flex="~ col"
    gap-1 text-sm
    pt-1 ps-2 pe-1 pb-2
    text-error
    border="~ base rounded error"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
