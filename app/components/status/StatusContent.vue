<script setup lang="ts">
import type { mastodon } from 'masto'

const { status, context } = defineProps<{
  status: mastodon.v1.Status
  newer?: mastodon.v1.Status
  context?: mastodon.v2.FilterContext | 'details'
  isPreview?: boolean
  inNotification?: boolean
  isNested: boolean
}>()

const isDM = computed(() => status.visibility === 'direct')
const isDetails = computed(() => context === 'details')

// Content Filter logic
const filterResult = computed(() => status.filtered?.length ? status.filtered[0] : null)
const filter = computed(() => filterResult.value?.filter)

const filterPhrase = computed(() => filter.value?.title)
const isFiltered = computed(() => status.account.id !== currentUser.value?.account.id && filterPhrase && context && context !== 'details' && !!filter.value?.context.includes(context))

const spoilerTextPresent = computed(() => !!status.spoilerText && status.spoilerText.trim().length > 0)
const embeddedMediaPreference = usePreferences('experimentalEmbeddedMedia')
const allowEmbeddedMedia = computed(() => status.card?.html && embeddedMediaPreference.value)
const hasStatusText = computed(() => !!status.content?.trim() || !!status.spoilerText?.trim())
</script>

<template>
  <div
    space-y-3
    :class="{
      'py2 px3.5 bg-dm rounded-4 me--1': isDM,
      'ms--3.5 mt--1 ms--1': isDM && context !== 'details',
    }"
  >
    <div v-if="isFiltered && !spoilerTextPresent && filterPhrase" class="content-rich line-compact" text-secondary>
      {{ `${$t('status.filter_hidden_phrase')}: ${filterPhrase}` }}
    </div>
    <StatusBody :status="status" :newer="newer" :with-action="!isDetails" :is-nested="isNested" :class="isDetails ? 'text-xl' : ''" />
    <StatusTranslation :status="status" />
    <StatusPoll v-if="status.poll" :status="status" />
    <StatusMedia
      v-if="status.mediaAttachments?.length"
      :status="status"
      :is-preview="isPreview"
      :breakout="!isNested"
      :spoiler-hidden="status.sensitive"
      :style="!hasStatusText && status.mediaAttachments.length > 1 ? { marginTop: '2.5rem' } : undefined"
    />
    <StatusPreviewCard
      v-if="status.card && !allowEmbeddedMedia && !isNested"
      :card="status.card"
      :small-picture-only="status.mediaAttachments?.length > 0"
    />
    <StatusEmbeddedMedia v-if="allowEmbeddedMedia" :status="status" />
    <StatusCard
      v-if="status.reblog"
      :status="status.reblog" border="~ rounded"
      :actions="false"
    />
  </div>
</template>
