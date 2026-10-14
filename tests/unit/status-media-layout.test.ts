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

function getStyleValue(style: string | undefined, property: string) {
  return style?.match(new RegExp(`(?:^|;)\\s*${property}:\\s*([^;]+)`))?.[1]?.trim()
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
            props: ['preserveAspectRatio'],
            template: '<div data-test="attachment" :data-preserve-aspect-ratio="preserveAspectRatio" />',
          },
        },
      },
    })

    expect(wrapper.get('.status-media-container').classes()).toContain('status-media-container--single-image')
    expect(wrapper.get('[data-test="attachment"]').attributes('style')).toBeUndefined()
  })

  it('sizes a known single-image wrapper from its ratio and the viewport height cap', async () => {
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
            props: ['preserveAspectRatio'],
            template: '<div data-test="attachment" :data-preserve-aspect-ratio="preserveAspectRatio" />',
          },
        },
      },
    })

    const containerStyle = wrapper.get('.status-media-container').attributes('style')
    expect(containerStyle).toMatch(/aspect-ratio/)
    expect(Number.parseFloat(getStyleValue(containerStyle, 'aspect-ratio') ?? '')).toBeCloseTo(1.5)
    expect(Number.parseFloat(getStyleValue(containerStyle, 'max-width') ?? '')).toBeCloseTo(Math.min(430, window.innerHeight * 0.7) * 1.5, 2)
    expect(wrapper.get('[data-test="attachment"]').attributes('data-preserve-aspect-ratio')).toBe('true')
    expect(wrapper.get('[data-test="attachment"]').attributes('style')).toBeUndefined()
  })

  it('lets single images shrink by their intrinsic ratio under the height cap', async () => {
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
            props: ['preserveAspectRatio'],
            template: '<div data-test="attachment" :data-preserve-aspect-ratio="preserveAspectRatio" />',
          },
        },
      },
    })

    const containerStyle = wrapper.get('.status-media-container').attributes('style')
    const aspectRatio = 800 / 1200
    expect(Number.parseFloat(getStyleValue(containerStyle, 'aspect-ratio') ?? '')).toBeCloseTo(aspectRatio)
    expect(Number.parseFloat(getStyleValue(containerStyle, 'max-width') ?? '') / aspectRatio).toBeCloseTo(Math.min(430, window.innerHeight * 0.7), 2)
    expect(wrapper.get('[data-test="attachment"]').attributes('data-preserve-aspect-ratio')).toBe('true')
    expect(wrapper.get('[data-test="attachment"]').attributes('style')).toBeUndefined()
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
