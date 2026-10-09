<script setup lang="ts">
const { t } = useI18n()

useHydratedHead({
  title: () => `${t('settings.preferences.label')} | ${t('nav.settings')}`,
})

const userSettings = useUserSettings()
</script>

<template>
  <MainContent back="small-only">
    <template #title>
      <MainTitle as="h1" secondary>
        {{ $t('settings.preferences.label') }}
      </MainTitle>
    </template>
    <section>
      <h2 px6 py4 mt2 font-semibold text-xl flex="~ gap-1" items-center sr-only>
        <span aria-hidden="true" block i-ri-equalizer-line />
        {{ $t('settings.preferences.label') }}
      </h2>
      <SettingsToggleItem
        :checked="getPreferences(userSettings, 'hideAltIndicatorOnPosts')"
        @click="togglePreferences('hideAltIndicatorOnPosts')"
      >
        {{ $t('settings.preferences.hide_alt_indi_on_posts') }}
      </SettingsToggleItem>
      <SettingsToggleItem
        :checked="getPreferences(userSettings, 'hideGifIndicatorOnPosts')"
        @click="togglePreferences('hideGifIndicatorOnPosts')"
      >
        {{ $t('settings.preferences.hide_gif_indi_on_posts') }}
      </SettingsToggleItem>
      <SettingsToggleItem
        :checked="getPreferences(userSettings, 'hideAccountHoverCard')"
        @click="togglePreferences('hideAccountHoverCard')"
      >
        {{ $t('settings.preferences.hide_account_hover_card') }}
      </SettingsToggleItem>
      <SettingsToggleItem
        :checked="getPreferences(userSettings, 'hideTagHoverCard')"
        @click="togglePreferences('hideTagHoverCard')"
      >
        {{ $t('settings.preferences.hide_tag_hover_card') }}
      </SettingsToggleItem>
      <SettingsToggleItem
        :checked="getPreferences(userSettings, 'enableAutoplay')"
        :disabled="getPreferences(userSettings, 'enableDataSaving')"
        @click="togglePreferences('enableAutoplay')"
      >
        {{ $t('settings.preferences.enable_autoplay') }}
      </SettingsToggleItem>
      <SettingsToggleItem
        :checked="getPreferences(userSettings, 'unmuteVideos')"
        @click="togglePreferences('unmuteVideos')"
      >
        {{ $t('settings.preferences.unmute_videos') }}
      </SettingsToggleItem>
      <SettingsToggleItem
        :checked="getPreferences(userSettings, 'optimizeForLowPerformanceDevice')"
        @click="togglePreferences('optimizeForLowPerformanceDevice')"
      >
        {{ $t('settings.preferences.optimize_for_low_performance_device') }}
      </SettingsToggleItem>
      <SettingsToggleItem
        :checked="getPreferences(userSettings, 'enableDataSaving')"
        @click="togglePreferences('enableDataSaving')"
      >
        {{ $t("settings.preferences.enable_data_saving") }}
        <template #description>
          {{ $t("settings.preferences.enable_data_saving_description") }}
        </template>
      </SettingsToggleItem>
      <SettingsToggleItem
        :checked="getPreferences(userSettings, 'enablePinchToZoom')"
        @click="togglePreferences('enablePinchToZoom')"
      >
        {{ $t('settings.preferences.enable_pinch_to_zoom') }}
      </SettingsToggleItem>
      <SettingsToggleItem
        :checked="getPreferences(userSettings, 'useStarFavoriteIcon')"
        @click="togglePreferences('useStarFavoriteIcon')"
      >
        {{ $t('settings.preferences.use_star_favorite_icon') }}
      </SettingsToggleItem>
    </section>
    <section>
      <details>
        <summary
          px6 py4 mt2 font-semibold text-xl flex="~ gap-2 wrap" items-center cursor-pointer
          focus-visible:ring="2 current"
          aria-controls="settings-wellbeing-options"
        >
          <span aria-hidden="true" block i-ri-hearts-line />
          <span role="heading" aria-level="2" flex-1 min-w-0>
            {{ $t('settings.preferences.wellbeing') }}
          </span>
        </summary>
        <div id="settings-wellbeing-options">
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'grayscaleMode')"
            @click="togglePreferences('grayscaleMode')"
          >
            {{ $t('settings.preferences.grayscale_mode') }}
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'hideBoostCount')"
            @click="togglePreferences('hideBoostCount')"
          >
            {{ $t('settings.preferences.hide_boost_count') }}
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'hideQuoteCount')"
            @click="togglePreferences('hideQuoteCount')"
          >
            {{ $t('settings.preferences.hide_quote_count') }}
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'hideFavoriteCount')"
            @click="togglePreferences('hideFavoriteCount')"
          >
            {{ $t('settings.preferences.hide_favorite_count') }}
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'hideReplyCount')"
            @click="togglePreferences('hideReplyCount')"
          >
            {{ $t('settings.preferences.hide_reply_count') }}
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'hideFollowerCount')"
            @click="togglePreferences('hideFollowerCount')"
          >
            {{ $t('settings.preferences.hide_follower_count') }}
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'hideUsernameEmojis')"
            @click="togglePreferences('hideUsernameEmojis')"
          >
            {{ $t("settings.preferences.hide_username_emojis") }}
            <template #description>
              {{ $t('settings.preferences.hide_username_emojis_description') }}
            </template>
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'hideNews')"
            @click="togglePreferences('hideNews')"
          >
            {{ $t("settings.preferences.hide_news") }}
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'hideRepliesInTimeline')"
            @click="togglePreferences('hideRepliesInTimeline')"
          >
            {{ $t('settings.preferences.hide_replies_in_timeline') }}
            <template #description>
              {{ $t('settings.preferences.hide_replies_in_timeline_description') }}
            </template>
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'hideBoostsInTimeline')"
            @click="togglePreferences('hideBoostsInTimeline')"
          >
            {{ $t('settings.preferences.hide_boosts_in_timeline') }}
            <template #description>
              {{ $t('settings.preferences.hide_boosts_in_timeline_description') }}
            </template>
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'disableTimelineAutoloading')"
            @click="togglePreferences('disableTimelineAutoloading')"
          >
            {{ $t('settings.preferences.disable_timeline_autoloading') }}
            <template #description>
              {{ $t('settings.preferences.disable_timeline_autoloading_description') }}
            </template>
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'zenMode')"
            @click="togglePreferences('zenMode')"
          >
            {{ $t("settings.preferences.zen_mode") }}
            <template #description>
              {{ $t('settings.preferences.zen_mode_description') }}
            </template>
          </SettingsToggleItem>
        </div>
      </details>
    </section>
    <section>
      <details>
        <summary
          px6 py4 mt2 font-semibold text-xl flex="~ gap-2 wrap" items-center cursor-pointer
          focus-visible:ring="2 current"
          aria-controls="settings-experimental-options"
        >
          <span aria-hidden="true" block i-ri-flask-line />
          <span role="heading" aria-level="2" flex-1 min-w-0>
            {{ $t('settings.preferences.title') }}
          </span>
        </summary>
        <div id="settings-experimental-options">
          <!-- Embedded Media -->
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'experimentalEmbeddedMedia')"
            @click="togglePreferences('experimentalEmbeddedMedia')"
          >
            {{ $t('settings.preferences.embedded_media') }}
            <template #description>
              {{ $t('settings.preferences.embedded_media_description') }}
            </template>
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'experimentalVirtualScroller')"
            @click="togglePreferences('experimentalVirtualScroller')"
          >
            {{ $t('settings.preferences.virtual_scroll') }}
            <template #description>
              {{ $t('settings.preferences.virtual_scroll_description') }}
            </template>
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'experimentalGitHubCards')"
            @click="togglePreferences('experimentalGitHubCards')"
          >
            {{ $t('settings.preferences.github_cards') }}
            <template #description>
              {{ $t('settings.preferences.github_cards_description') }}
            </template>
          </SettingsToggleItem>
          <SettingsToggleItem
            :checked="getPreferences(userSettings, 'experimentalUserPicker')"
            @click="togglePreferences('experimentalUserPicker')"
          >
            {{ $t('settings.preferences.user_picker') }}
            <template #description>
              {{ $t('settings.preferences.user_picker_description') }}
            </template>
          </SettingsToggleItem>
        </div>
      </details>
    </section>
  </MainContent>
</template>
