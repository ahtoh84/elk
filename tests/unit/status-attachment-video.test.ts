import type { mastodon } from 'masto'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import StatusAttachment from '~/components/status/StatusAttachment.vue'

describe('video attachment', () => {
  it('keeps native video controls outside the load button', async () => {
    const attachment = {
      id: 'video-1',
      type: 'video',
      url: 'https://example.invalid/video.mp4',
      previewUrl: 'https://example.invalid/preview.jpg',
      meta: { original: { width: 640, height: 360, aspect: 640 / 360 } },
    } as mastodon.v1.MediaAttachment

    const wrapper = await mountSuspended(StatusAttachment, { props: { attachment } })

    expect(wrapper.find('video[controls]').exists()).toBe(true)
    expect(wrapper.find('button video').exists()).toBe(false)
  })

  it('keeps sensitive video as a blurred poster until the media itself is revealed', async () => {
    const attachment = {
      id: 'sensitive-video',
      type: 'video',
      url: 'https://example.invalid/video.mp4',
      previewUrl: 'https://example.invalid/preview.jpg',
      meta: { original: { width: 640, height: 360, aspect: 640 / 360 } },
    } as mastodon.v1.MediaAttachment

    const wrapper = await mountSuspended(StatusAttachment, {
      props: { attachment, isSensitive: true, spoilerHidden: true },
    })

    expect(wrapper.find('video source').exists()).toBe(false)
    expect(wrapper.find('video[controls]').exists()).toBe(false)
    expect(wrapper.find('.status-video-poster--spoiler').exists()).toBe(true)
    expect(wrapper.find('.status-attachment-spoiler__reveal').exists()).toBe(true)
    expect(wrapper.find('.status-attachment-spoiler__label').exists()).toBe(false)

    await wrapper.find('.status-attachment-spoiler__reveal').trigger('click')

    expect(wrapper.find('video[controls]').exists()).toBe(true)
    expect(wrapper.find('video source').exists()).toBe(true)
    expect(wrapper.get('video').attributes('poster')).toBe(attachment.previewUrl)
    expect(wrapper.find('.status-attachment-spoiler__reveal').exists()).toBe(false)
    expect(wrapper.find('.status-video-poster--spoiler').exists()).toBe(false)
  })

  it('keeps sensitive GIFV files from loading until revealed', async () => {
    const attachment = {
      id: 'sensitive-gifv',
      type: 'gifv',
      url: 'https://example.invalid/animation.mp4',
      previewUrl: 'https://example.invalid/preview.jpg',
      meta: { original: { width: 640, height: 360, aspect: 640 / 360 } },
    } as mastodon.v1.MediaAttachment

    const wrapper = await mountSuspended(StatusAttachment, {
      props: { attachment, isSensitive: true, spoilerHidden: true },
    })

    expect(wrapper.find('video source').exists()).toBe(false)
    expect(wrapper.find('video.status-video--spoiler-hidden').exists()).toBe(true)
    expect(wrapper.find('.status-video-poster--spoiler').exists()).toBe(true)
    expect(wrapper.find('.status-attachment-spoiler__label').exists()).toBe(false)

    await wrapper.find('button').trigger('click')

    expect(wrapper.find('video source').exists()).toBe(true)
    expect(wrapper.get('video').attributes('poster')).toBe(attachment.previewUrl)
    expect(wrapper.find('.status-video-poster--spoiler').exists()).toBe(false)
  })

  it('removes the spoiler blur when a sensitive image is revealed', async () => {
    const attachment = {
      id: 'sensitive-image',
      type: 'image',
      url: 'https://example.invalid/image.jpg',
      previewUrl: 'https://example.invalid/preview.jpg',
      meta: { original: { width: 640, height: 480, aspect: 640 / 480 } },
    } as mastodon.v1.MediaAttachment

    const wrapper = await mountSuspended(StatusAttachment, {
      props: { attachment, isSensitive: true, spoilerHidden: true },
    })

    expect(wrapper.find('.status-attachment-image--spoiler').exists()).toBe(true)
    expect(wrapper.find('.status-attachment-spoiler__label').exists()).toBe(false)

    await wrapper.find('button').trigger('click')

    expect(wrapper.find('.status-attachment-image--spoiler').exists()).toBe(false)
    expect(wrapper.find('.status-attachment-spoiler__reveal').exists()).toBe(false)
  })
})
