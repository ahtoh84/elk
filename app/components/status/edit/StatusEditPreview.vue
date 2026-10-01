<script setup lang="ts">
import type { mastodon } from 'masto'

defineProps<{
  edit: mastodon.v1.StatusEdit
}>()
</script>

<template>
  <div px3 py-4 flex="~ col">
    <div text-center flex="~ row gap-1 wrap">
      <AccountInlineInfo :account="edit.account" />
      <span>
        {{ $t('status_history.edited', [useFormattedDateTime(edit.createdAt).value]) }}
      </span>
    </div>

    <div h1px bg="gray/20" my2 />

    <StatusBody :status="edit" />
    <StatusMedia v-if="edit.mediaAttachments.length" :status="edit" :spoiler-hidden="edit.sensitive" />
  </div>
</template>
