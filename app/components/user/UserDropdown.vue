<script setup lang="ts">
defineProps<{
  compact?: boolean
}>()

const mask = useMask()
</script>

<template>
  <VDropdown :distance="0" placement="top-start" strategy="fixed" @apply-show="mask.show()" @apply-hide="mask.hide()">
    <button btn-action-icon :aria-label="$t('action.switch_account')">
      <div :class="compact ? 'hidden' : { 'hidden xl:block': currentUser }" class="user-dropdown-more-icon" i-ri:more-2-line />
      <AccountAvatar v-if="currentUser" :class="compact ? 'block' : 'xl:hidden'" class="user-dropdown-avatar" :account="currentUser.account" w-9 h-9 />
    </button>
    <template #popper="{ hide }">
      <UserSwitcher @click="hide" />
    </template>
  </VDropdown>
</template>
