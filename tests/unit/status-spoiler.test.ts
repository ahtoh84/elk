import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import StatusSpoiler from '~/components/status/StatusSpoiler.vue'

describe('status spoiler', () => {
  it('shows a hidden-media preview only while sensitive content is collapsed', async () => {
    const wrapper = await mountSuspended(StatusSpoiler, {
      props: { enabled: true, sensitiveNonSpoiler: true },
      slots: {
        'default': () => h('p', { class: 'status-content' }, 'Post content'),
        'hidden-media': () => h('div', { class: 'hidden-media-preview' }, 'Blurred media'),
      },
    })

    expect(wrapper.find('.hidden-media-preview').exists()).toBe(true)
    expect(wrapper.find('.status-content').exists()).toBe(false)

    await wrapper.find('button').trigger('click')

    expect(wrapper.find('.hidden-media-preview').exists()).toBe(false)
    expect(wrapper.find('.status-content').exists()).toBe(true)
  })
})
