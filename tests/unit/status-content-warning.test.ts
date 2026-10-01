import type { mastodon } from 'masto'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import StatusContent from '~/components/status/StatusContent.vue'

function makeStatus(sensitive: boolean, spoilerText = 'Content warning'): mastodon.v1.Status {
  return {
    id: 'status-1',
    account: { id: 'author-1' },
    visibility: 'public',
    sensitive,
    spoilerText,
    content: 'Post body',
    emojis: [],
    mediaAttachments: [{
      id: 'image-1',
      type: 'image',
      url: 'https://example.invalid/image.jpg',
      previewUrl: 'https://example.invalid/preview.jpg',
    }],
    filtered: [],
  } as unknown as mastodon.v1.Status
}

function makeFilteredStatus(): mastodon.v1.Status {
  return {
    ...makeStatus(false, ''),
    filtered: [{
      filter: { title: 'Filtered phrase', context: ['public'] },
    }],
  } as unknown as mastodon.v1.Status
}

const stubs = {
  ContentRich: {
    props: ['content'],
    template: '<span data-test="content-warning">{{ content }}</span>',
  },
  StatusBody: {
    props: ['status'],
    template: '<div data-test="status-body"><span v-if="status.spoilerText" data-test="content-warning">{{ status.spoilerText }}</span></div>',
  },
  StatusMedia: {
    props: ['spoilerHidden'],
    template: '<div data-test="status-media" :data-spoiler-hidden="spoilerHidden" />',
  },
  StatusTranslation: { template: '<div data-test="status-translation" />' },
  StatusPoll: { template: '<div data-test="status-poll" />' },
  StatusPreviewCard: { template: '<div data-test="status-preview-card" />' },
  StatusEmbeddedMedia: { template: '<div data-test="status-embedded-media" />' },
  StatusCard: { template: '<div data-test="status-card" />' },
}

describe('status content warnings', () => {
  it('keeps a content warning in the post body without a divider or show/hide toggle', async () => {
    const wrapper = await mountSuspended(StatusContent, {
      props: { status: makeStatus(false), isNested: false },
      global: { stubs },
    })

    expect(wrapper.find('[data-test="content-warning"]').text()).toBe('Content warning')
    expect(wrapper.find('[data-test="status-body"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="status-media"]').exists()).toBe(true)
    expect(wrapper.find('.border-b-dotted').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('shows sensitive post text expanded while keeping its media blurred', async () => {
    const wrapper = await mountSuspended(StatusContent, {
      props: { status: makeStatus(true), isNested: false },
      global: { stubs },
    })

    expect(wrapper.find('[data-test="content-warning"]').text()).toBe('Content warning')
    expect(wrapper.find('[data-test="status-body"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="status-media"]').attributes('data-spoiler-hidden')).toBe('true')
    expect(wrapper.find('.border-b-dotted').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('shows sensitive posts without a content warning expanded and keeps media blurred', async () => {
    const wrapper = await mountSuspended(StatusContent, {
      props: { status: makeStatus(true, ''), isNested: false },
      global: { stubs },
    })

    expect(wrapper.find('[data-test="status-body"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="status-media"]').attributes('data-spoiler-hidden')).toBe('true')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('keeps every post section that used to live inside the collapse layer', async () => {
    const status = {
      ...makeStatus(true),
      poll: { id: 'poll-1' },
      card: { url: 'https://example.invalid/card', title: 'Card title' },
      reblog: makeStatus(false),
    } as unknown as mastodon.v1.Status
    const wrapper = await mountSuspended(StatusContent, {
      props: { status, isNested: false },
      global: { stubs },
    })

    for (const section of ['status-body', 'status-translation', 'status-poll', 'status-media', 'status-preview-card', 'status-card'])
      expect(wrapper.find(`[data-test="${section}"]`).exists(), `${section} should remain visible`).toBe(true)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('does not collapse posts matched by a content filter', async () => {
    const wrapper = await mountSuspended(StatusContent, {
      props: { status: makeFilteredStatus(), context: 'public', isNested: false },
      global: { stubs },
    })

    expect(wrapper.find('[data-test="status-body"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="status-media"]').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(false)
  })
})
