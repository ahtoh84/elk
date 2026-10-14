import type { mastodon } from 'masto'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import StatusMedia from '~/components/status/StatusMedia.vue'

function createStatus(mediaAttachments: Partial<mastodon.v1.MediaAttachment>[]) {
  return {
    sensitive: false,
    mediaAttachments: mediaAttachments as mastodon.v1.MediaAttachment[],
  } as mastodon.v1.Status
}

describe('status media layout', () => {
  it('does not force single images without dimensions into a square', async () => {
    const wrapper = await mountSuspended(StatusMedia, {
      props: {
        status: createStatus([{ id: 'image-1', type: 'image' }]),
      },
      global: {
        stubs: {
          StatusAttachment: {
            template: '<div data-test="attachment" />',
          },
        },
      },
    })

    expect(wrapper.get('.status-media-container').classes()).toContain('status-media-container--single-image')
    expect(wrapper.get('[data-test="attachment"]').attributes('style')).toBeUndefined()
  })

  it('preserves known single-image aspect ratios', async () => {
    const wrapper = await mountSuspended(StatusMedia, {
      props: {
        status: createStatus([{
          id: 'image-1',
          type: 'image',
          meta: { original: { width: 1200, height: 800, aspect: 1.5 } },
        }]),
      },
      global: {
        stubs: {
          StatusAttachment: {
            template: '<div data-test="attachment" />',
          },
        },
      },
    })

    expect(wrapper.get('[data-test="attachment"]').attributes('style')).toContain('aspect-ratio: 1.5')
    expect(wrapper.get('.status-media-container').classes()).not.toContain('status-media-container--single-portrait')
  })

  it('keeps a single portrait image aligned to the content edge', async () => {
    const wrapper = await mountSuspended(StatusMedia, {
      props: {
        status: createStatus([{
          id: 'portrait-1',
          type: 'image',
          meta: { original: { width: 800, height: 1200 } },
        }]),
      },
      global: {
        stubs: {
          StatusAttachment: {
            template: '<div data-test="attachment" />',
          },
        },
      },
    })

    expect(wrapper.get('.status-media-container').classes()).toContain('status-media-container--single-portrait')
  })

  it('keeps multi-image posts in the carousel layout', async () => {
    const wrapper = await mountSuspended(StatusMedia, {
      props: {
        status: createStatus([
          { id: 'image-1', type: 'image' },
          { id: 'image-2', type: 'image' },
        ]),
      },
      global: {
        stubs: {
          StatusAttachment: true,
        },
      },
    })

    expect(wrapper.get('.status-media-container').classes()).toContain('status-media-container--carousel')
    expect(wrapper.get('.status-media-container').classes()).not.toContain('status-media-container--single-image')
  })
})
