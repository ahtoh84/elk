import type { mastodon } from 'masto'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import StatusAttachment from '~/components/status/StatusAttachment.vue'

const userSettings = vi.hoisted(() => ({
  current: { preferences: { enableDataSaving: true } },
}))

mockNuxtImport('useUserSettings', () => () => ({ value: userSettings.current }))

describe('sensitive image preview', () => {
  it('loads only the preview thumbnail while the full-size media remains masked in data-saving mode', async () => {
    const attachment = {
      id: 'sensitive-image',
      type: 'image',
      url: 'https://example.invalid/full-image.jpg',
      previewUrl: 'https://example.invalid/preview-image.jpg',
      meta: { original: { width: 1600, height: 1200 }, small: { width: 320, height: 240 } },
    } as mastodon.v1.MediaAttachment

    const wrapper = await mountSuspended(StatusAttachment, {
      props: { attachment, isSensitive: true, spoilerHidden: true },
      global: {
        stubs: {
          CommonBlurhash: {
            props: ['src', 'srcset', 'shouldLoadImage'],
            template: '<img data-test="sensitive-preview" :src="src" :data-srcset="srcset" :data-should-load="shouldLoadImage">',
          },
        },
      },
    })

    const preview = wrapper.get('[data-test="sensitive-preview"]')
    expect(preview.attributes('src')).toBe(attachment.previewUrl)
    expect(preview.attributes('data-srcset')).toBeUndefined()
    expect(preview.attributes('data-should-load')).toBe('true')
    expect(wrapper.find('.status-attachment-image--spoiler').exists()).toBe(true)
  })

  it('falls back to the available media URL when a sensitive image has no preview thumbnail', async () => {
    const attachment = {
      id: 'sensitive-image-without-preview',
      type: 'image',
      url: 'https://example.invalid/full-image.jpg',
      meta: { original: { width: 1600, height: 1200 } },
    } as mastodon.v1.MediaAttachment

    const wrapper = await mountSuspended(StatusAttachment, {
      props: { attachment, isSensitive: true, spoilerHidden: true },
      global: {
        stubs: {
          CommonBlurhash: {
            props: ['src', 'srcset', 'shouldLoadImage'],
            template: '<img data-test="sensitive-preview" :src="src" :data-srcset="srcset" :data-should-load="shouldLoadImage">',
          },
        },
      },
    })

    expect(wrapper.get('[data-test="sensitive-preview"]').attributes('src')).toBe(attachment.url)
    expect(wrapper.find('.status-attachment-image--spoiler').exists()).toBe(true)
  })

  it('uses the preview thumbnail as the masked poster for videos in data-saving mode', async () => {
    const attachment = {
      id: 'sensitive-video',
      type: 'video',
      url: 'https://example.invalid/full-video.mp4',
      previewUrl: 'https://example.invalid/video-preview.jpg',
      meta: { original: { width: 1280, height: 720, aspect: 1280 / 720 } },
    } as mastodon.v1.MediaAttachment

    const wrapper = await mountSuspended(StatusAttachment, {
      props: { attachment, isSensitive: true, spoilerHidden: true },
    })

    expect(wrapper.get('.status-video-poster--spoiler').attributes('src')).toBe(attachment.previewUrl)
    expect(wrapper.find('video source').exists()).toBe(false)
  })
})
