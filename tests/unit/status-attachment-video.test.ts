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
})
