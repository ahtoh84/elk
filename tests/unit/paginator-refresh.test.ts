import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { usePaginator } from '~/composables/paginator'
import { isHydrated } from '~/composables/vue'

afterEach(() => {
  isHydrated.value = false
  vi.restoreAllMocks()
})

describe('paginator refresh', () => {
  it('keeps the current posts when a refresh request fails', async () => {
    isHydrated.value = true
    vi.spyOn(console, 'error').mockImplementation(() => {})

    let requestNumber = 0
    const paginator = {
      values() {
        requestNumber++
        let pageNumber = 0
        return {
          next: async () => {
            if (requestNumber === 2)
              throw new Error('Network unavailable')
            if (pageNumber++ === 0)
              return { done: false, value: [{ id: requestNumber === 1 ? 'existing-post' : 'new-post' }] }
            if (requestNumber === 1 || requestNumber === 3)
              return { done: true, value: undefined }
            throw new Error('Unexpected paginator request')
          },
        }
      },
    }

    let result!: ReturnType<typeof usePaginator<{ id: string }, unknown>>
    const wrapper = mount(defineComponent({
      setup() {
        result = usePaginator(paginator as any, ref(undefined), 'update', items => items, 0)
        return () => h('div')
      },
    }))

    await vi.waitFor(() => expect(result.items.value).toEqual([{ id: 'existing-post' }]))
    await result.refresh()

    expect(result.items.value).toEqual([{ id: 'existing-post' }])
    await result.refresh()
    expect(result.items.value).toEqual([{ id: 'new-post' }])
    wrapper.unmount()
  })
})
