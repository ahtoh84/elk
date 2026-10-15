import type { mastodon } from 'masto'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import StatusDetails from '~/components/status/StatusDetails.vue'

const statusFixture = {
  id: 'status-1',
  createdAt: '2026-10-14T08:41:39.000Z',
  account: {
    id: 'author-1',
    username: 'author',
    displayName: 'Author',
    acct: 'author@example.com',
  },
  visibility: 'public',
  content: '',
  emojis: [],
  emojiReactions: [],
} as unknown as mastodon.v1.Status

async function mountStatusDetails(status: mastodon.v1.Status) {
  return mountSuspended(StatusDetails, {
    props: { status },
    global: {
      plugins: [createI18n({
        legacy: false,
        locale: 'en',
        messages: { en: { common: { in: 'in' }, app_name: 'Elk', state: { edited: 'edited' } } },
      })],
      stubs: {
        AccountHoverWrapper: { template: '<span><slot /></span>' },
        AccountInfo: { template: '<span>Author</span>' },
        NuxtLink: { template: '<a><slot /></a>' },
        StatusActions: { template: '<div data-test="status-actions" />' },
        StatusActionsMore: true,
        StatusContent: true,
        StatusEditIndicator: { template: '<span><slot /></span>' },
        StatusEmojiReaction: { template: '<div data-test="emoji-reactions" />' },
        StatusVisibilityIndicator: true,
      },
    },
  })
}

describe('status detail emoji reactions', () => {
  it('does not render the reactions section when there are no reactions', async () => {
    const wrapper = await mountStatusDetails(statusFixture)
    const actionsSection = wrapper.find('[data-test="status-actions"]').element.parentElement

    expect(wrapper.find('[data-test="emoji-reactions"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="status-actions"]').exists()).toBe(true)
    expect(actionsSection?.outerHTML).not.toMatch(/border/)
  })

  it('does not render the reactions section when every reaction count is zero', async () => {
    const status = {
      ...statusFixture,
      emojiReactions: [{ name: '👍', count: 0, me: false }],
    } as unknown as mastodon.v1.Status
    const wrapper = await mountStatusDetails(status)
    const actionsSection = wrapper.find('[data-test="status-actions"]').element.parentElement

    expect(wrapper.find('[data-test="emoji-reactions"]').exists()).toBe(false)
    expect(actionsSection?.outerHTML).not.toMatch(/border/)
  })

  it('renders the reactions section when the status has reactions', async () => {
    const status = {
      ...statusFixture,
      emojiReactions: [{ name: '👍', count: 1, me: false }],
    } as unknown as mastodon.v1.Status
    const wrapper = await mountStatusDetails(status)

    expect(wrapper.find('[data-test="emoji-reactions"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="emoji-reactions"]').element.parentElement?.outerHTML).toMatch(/border/)
    expect(wrapper.find('[data-test="status-actions"]').element.parentElement?.outerHTML).toMatch(/border/)
  })

  it('renders status more action on the right side of the author header row', async () => {
    const wrapper = await mountStatusDetails(statusFixture)
    const headerRow = wrapper.find('[aria-roledescription="status-details"] > div:first-child')
    expect(headerRow.attributes('flex')).toBeDefined()
    expect(headerRow.attributes('justify-between')).toBeDefined()
    expect(headerRow.attributes('items-center')).toBeDefined()
    const children = headerRow.element.children
    expect(children.length).toBe(2)
    expect(children[0].tagName.toLowerCase()).toBe('a')
  })
})
