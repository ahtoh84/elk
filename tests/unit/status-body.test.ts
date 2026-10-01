import type { mastodon } from 'masto'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import StatusBody from '~/components/status/StatusBody.vue'

describe('status body', () => {
  it('renders the content warning as ordinary body text without a divider', async () => {
    const status = {
      id: 'status-1',
      account: { id: 'author-1' },
      visibility: 'public',
      sensitive: true,
      spoilerText: 'NSFW - adult content',
      content: 'Post body',
      emojis: [],
      mentions: [],
    } as unknown as mastodon.v1.Status

    const wrapper = await mountSuspended(StatusBody, {
      props: { status, withAction: false },
      global: {
        plugins: [createI18n({ legacy: false, locale: 'en' })],
        stubs: {
          ContentRich: {
            props: ['content'],
            template: '<span data-test="rich-text">{{ content }}</span>',
          },
          StatusQuote: true,
        },
      },
    })

    const warning = wrapper.get('.status-spoiler-text')
    expect(warning.text()).toBe('NSFW - adult content')
    expect(wrapper.get('.status-body').element.contains(warning.element)).toBe(true)
    expect(warning.classes()).not.toContain('text-secondary')
    expect(wrapper.find('.border-b-dotted').exists()).toBe(false)
  })
})
