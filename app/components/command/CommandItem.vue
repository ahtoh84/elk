<script setup lang="ts">
import type { ResolvedCommand } from '~/composables/command'

const { active = false } = defineProps<{
  cmd: ResolvedCommand
  index: number
  active?: boolean
}>()

const emit = defineEmits<{
  (event: 'activate'): void
}>()
</script>

<template>
  <div
    class="flex px-3 py-2 my-1 items-center rounded-lg hover:bg-active cursor-pointer scroll-m-10"
    :class="{ 'bg-active': active }"
    :data-index="index"
    @click="emit('activate')"
  >
    <div v-if="cmd.icon" me-2 :class="cmd.icon" />

    <div class="flex-1 flex items-baseline gap-2 min-w-0">
      <span class="inline-grid select-none">
        <span
          class="col-start-1 row-start-1 transition-colors duration-80"
          :class="active ? 'font-medium type-body text-base' : 'font-normal type-body text-base'"
        >
          {{ cmd.name }}
        </span>
        <span
          aria-hidden="true"
          class="col-start-1 row-start-1 invisible font-medium type-body pointer-events-none select-none"
        >
          {{ cmd.name }}
        </span>
      </span>
      <div v-if="cmd.description" class="type-caption text-secondary truncate">
        {{ cmd.description }}
      </div>
    </div>

    <div
      v-if="cmd.onComplete"
      class="flex items-center gap-1"
      :class="active ? 'opacity-100' : 'opacity-0'"
    >
      <div class="text-xs text-secondary">
        {{ $t('command.complete') }}
      </div>
      <CommandKey name="Tab" />
    </div>
    <div
      v-if="cmd.onActivate"
      class="flex items-center gap-1"
      :class="active ? 'opacity-100' : 'opacity-0'"
    >
      <div class="text-xs text-secondary">
        {{ $t('command.activate') }}
      </div>
      <CommandKey name="Enter" />
    </div>
  </div>
</template>
