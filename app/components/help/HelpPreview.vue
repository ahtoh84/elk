<script setup lang="ts">
const emit = defineEmits<{
  (event: 'close'): void
}>()

const vAutoFocus = (el: HTMLElement) => el.focus()
</script>

<template>
  <div my-8 px-3 sm:px-8 md:max-w-200 flex="~ col gap-4" relative>
    <button v-auto-focus type="button" btn-action-icon absolute top--8 right-0 m1 :aria-label="$t('action.close')" @click="emit('close')">
      <span i-ri:close-line />
    </button>

    <img :alt="$t('app_logo')" :src="`/${''}logo.svg`" w-20 h-20 height="80" width="80" mxa class="rtl-flip">
    <h1 mxa text-4xl mb4>
      {{ $t('help.title') }}
    </h1>
    <p>
      {{ $t('help.desc_para1') }}
    </p>
    <p>
      <b text-primary>{{ $t('help.desc_highlight') }}</b>
      {{ $t('help.desc_para2') }}
    </p>
    <p>
      {{ $t('help.desc_para4') }}
      <NuxtLink font-bold text-primary href="https://github.com/elk-zone/elk" target="_blank">
        {{ $t('help.desc_para5') }}
      </NuxtLink>
      {{ $t('help.desc_para6') }}
    </p>
    <NuxtLink hover:text-primary href="https://github.com/sponsors/elk-zone" target="_blank">
      {{ $t('help.desc_para3') }}
    </NuxtLink>
    <p flex="~ gap-2 wrap justify-center" mxa>
      <template v-for="team of elkTeamMembers" :key="team.github">
        <NuxtLink :href="team.link" target="_blank" external class="help-team-member">
          <img :src="`/avatars/${team.github}-100x100.png`" :alt="team.display" rounded-full w-15 h-15 height="60" width="60">
        </NuxtLink>
      </template>
    </p>
    <p italic flex justify-center w-full>
      <NuxtLink href="https://github.com/sponsors/elk-zone" target="_blank">
        <span text-xl font-script hover:text-primary transition-colors duration-150>{{ $t('help.footer_team') }}</span>
      </NuxtLink>
    </p>

    <button type="button" btn-solid mxa @click="emit('close')">
      {{ $t('action.enter_app') }}
    </button>
  </div>
</template>

<style scoped>
.help-team-member {
  border: 1px solid transparent;
  border-radius: 9999px;
  transition:
    border-color 150ms ease-out,
    transform 150ms cubic-bezier(0.23, 1, 0.32, 1);
}

.help-team-member:focus-visible {
  border-color: var(--c-primary);
  outline: 2px solid var(--c-primary);
  outline-offset: 3px;
}

@media (hover: hover) and (pointer: fine) {
  .help-team-member:hover {
    border-color: var(--c-primary);
    transform: scale(1.04);
  }
}

@media (prefers-reduced-motion: reduce) {
  .help-team-member {
    transition: border-color 120ms ease-out;
  }

  .help-team-member:hover {
    transform: none;
  }
}
</style>
