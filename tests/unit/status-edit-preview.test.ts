import type { mastodon } from 'masto'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import StatusEditPreview from '~/components/status/edit/StatusEditPreview.vue'

describe('status edit preview', () => {
  it('keeps edited content expanded and masks sensitive media without a post-level toggle', async () => {
    const edit = {
      id: 'edit-1',
      account: { id: 'author-1' },
      createdAt: '2026-10-01T00:00:00.000Z',
      sensitive: true,
      spoilerText: 'Content warning',
      content: 'Post body',
      emojis: [],
      mediaAttachments: [{
        id: 'image-1',
        type: 'image',
        url: 'https://example.invalid/image.jpg',
        previewUrl: 'https://example.invalid/preview.jpg',
      }],
    } as unknown as mastodon.v1.StatusEdit

    const wrapper = await mountSuspended(StatusEditPreview, {
      props: { edit },
      global: {
        plugins: [createI18n({ legacy: false, locale: 'en' })],
        stubs: {
          AccountInlineInfo: true,
          StatusBody: {
            props: ['status'],
            template: '<div data-test="status-body"><span v-if="status.spoilerText" data-test="content-warning">{{ status.spoilerText }}</span></div>',
          },
          StatusMedia: {
            props: ['spoilerHidden'],
            template: '<div data-test="status-media" :data-spoiler-hidden="spoilerHidden" />',
          },
        },
      },
    })

    expect(wrapper.find('[data-test="content-warning"]').text()).toBe('Content warning')
    expect(wrapper.find('[data-test="status-body"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="status-media"]').attributes('data-spoiler-hidden')).toBe('true')
    expect(wrapper.find('.border-b-dotted').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
  })
})
