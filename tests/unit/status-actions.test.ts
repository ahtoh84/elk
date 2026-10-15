import type { mastodon } from 'masto'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { useStatusActions } from '~/composables/masto/status'

const mocks = vi.hoisted(() => ({
  favourite: vi.fn(),
  unfavourite: vi.fn(),
  cacheStatus: vi.fn(),
}))

const statusFixture = {
  id: 'status-1',
  account: { id: 'author-1' },
  visibility: 'public',
  favourited: false,
  favouritesCount: 2,
} as unknown as mastodon.v1.Status

const StatusActionsHarness = defineComponent({
  setup() {
    const client = ref({
      v1: {
        statuses: {
          $select: () => ({ favourite: mocks.favourite, unfavourite: mocks.unfavourite }),
        },
      },
    } as unknown as mastodon.rest.Client)
    const { status, actionError, toggleFavourite } = useStatusActions({ status: statusFixture }, {
      client,
      checkLogin: () => true,
      cacheStatus: mocks.cacheStatus,
    })

    return () => h('div', [
      h('button', { onClick: toggleFavourite }, 'Favourite'),
      h('output', { 'data-test': 'favourited' }, String(status.value.favourited)),
      h('output', { 'data-test': 'count' }, String(status.value.favouritesCount)),
      actionError.value
        ? h('div', { 'role': 'alert', 'data-test': 'action-error' }, actionError.value)
        : null,
    ])
  },
})

describe('status action failures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rolls back the optimistic state and exposes an inline error when favouriting fails', async () => {
    mocks.favourite.mockRejectedValueOnce(new Error('offline'))
    const wrapper = await mountSuspended(StatusActionsHarness)

    await wrapper.get('button').trigger('click')
    await vi.waitFor(() => expect(wrapper.find('[data-test="action-error"]').exists()).toBe(true))

    expect(wrapper.get('[data-test="favourited"]').text()).toBe('false')
    expect(wrapper.get('[data-test="count"]').text()).toBe('2')
    expect(wrapper.get('[role="alert"]').text()).toBeTruthy()
    expect(mocks.favourite).toHaveBeenCalledOnce()
    expect(mocks.unfavourite).not.toHaveBeenCalled()
  })

  it('sends the selected action and keeps the confirmed state on success', async () => {
    mocks.favourite.mockResolvedValueOnce({ ...statusFixture, favourited: true, favouritesCount: 3 })
    const wrapper = await mountSuspended(StatusActionsHarness)

    await wrapper.get('button').trigger('click')

    expect(mocks.favourite).toHaveBeenCalledOnce()
    expect(mocks.unfavourite).not.toHaveBeenCalled()
    expect(wrapper.get('[data-test="favourited"]').text()).toBe('true')
    expect(wrapper.get('[data-test="count"]').text()).toBe('3')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('uses subtle primary-fade hover background for more button instead of heavy dark background', async () => {
    const { createI18n } = await import('vue-i18n')
    const { default: StatusActionsMore } = await import('~/components/status/StatusActionsMore.vue')
    const wrapper = await mountSuspended(StatusActionsMore, {
      props: {
        status: statusFixture,
      },
      global: {
        plugins: [createI18n({
          legacy: false,
          locale: 'en',
          messages: { en: { action: { more: 'More' } } },
        })],
        stubs: {
          CommonDropdown: { template: '<div><slot /><slot name="popper" /></div>' },
          StatusActionButton: {
            props: ['elkGroupHover'],
            template: '<div data-test="action-btn" :data-elk-group-hover="elkGroupHover" />',
          },
        },
      },
    })
    const actionBtn = wrapper.find('[data-test="action-btn"]')
    expect(actionBtn.attributes('data-elk-group-hover')).toBe('bg-primary-fade')
  })
})
