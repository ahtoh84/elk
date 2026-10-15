import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearCache, fetchAccountById, fetchStatus, fetchTag } from '../../app/composables/cache'
import { currentUserHandle, useUsers } from '../../app/composables/users'

const mockFetchStatus = vi.fn()
const mockFetchAccount = vi.fn()
const mockFetchTag = vi.fn()

describe('cache.ts getOrFetch retry behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearCache()

    const mockClient = {
      v1: {
        statuses: {
          $select: () => ({ fetch: mockFetchStatus }),
        },
        accounts: {
          $select: () => ({ fetch: mockFetchAccount }),
        },
        tags: {
          $select: () => ({ fetch: mockFetchTag }),
        },
      },
    }

    const masto = useNuxtApp().$masto as any
    if (masto?.client) {
      masto.client.value = mockClient
    }

    const users = useUsers()
    users.value = [{
      server: 'mastodon.social',
      token: 'test-token',
      account: { id: 'user-1', acct: 'me@mastodon.social' } as any,
    }]
    currentUserHandle.value = 'me@mastodon.social'
  })

  it('evicts failed promise on error and allows subsequent retry', async () => {
    mockFetchStatus.mockRejectedValueOnce(new Error('Network timeout'))

    // First attempt fails
    await expect(fetchStatus('status-101')).rejects.toThrow('Network timeout')
    expect(mockFetchStatus).toHaveBeenCalledTimes(1)

    // Second attempt should NOT return cached rejection; it must retry
    mockFetchStatus.mockResolvedValueOnce({ id: 'status-101', content: 'Hello' })
    const status = await fetchStatus('status-101')
    expect(status).toEqual({ id: 'status-101', content: 'Hello' })
    expect(mockFetchStatus).toHaveBeenCalledTimes(2)

    // Third attempt returns cached success without refetching
    const cachedStatus = await fetchStatus('status-101')
    expect(cachedStatus).toEqual({ id: 'status-101', content: 'Hello' })
    expect(mockFetchStatus).toHaveBeenCalledTimes(2)
  })

  it('deduplicates concurrent in-flight requests', async () => {
    let resolvePromise: (val: any) => void
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockFetchStatus.mockReturnValueOnce(pendingPromise)

    const req1 = fetchStatus('status-202')
    const req2 = fetchStatus('status-202')

    expect(mockFetchStatus).toHaveBeenCalledTimes(1)

    resolvePromise!({ id: 'status-202', content: 'Concurrent' })
    const [res1, res2] = await Promise.all([req1, req2])

    expect(res1).toEqual({ id: 'status-202', content: 'Concurrent' })
    expect(res2).toEqual({ id: 'status-202', content: 'Concurrent' })
  })

  it('allows forced refetch when force is true', async () => {
    mockFetchStatus.mockResolvedValueOnce({ id: 'status-303', content: 'Version 1' })
    await fetchStatus('status-303')
    expect(mockFetchStatus).toHaveBeenCalledTimes(1)

    mockFetchStatus.mockResolvedValueOnce({ id: 'status-303', content: 'Version 2' })
    const forcedStatus = await fetchStatus('status-303', true)
    expect(forcedStatus.content).toBe('Version 2')
    expect(mockFetchStatus).toHaveBeenCalledTimes(2)
  })

  it('evicts failed account and tag requests on rejection', async () => {
    mockFetchAccount.mockRejectedValueOnce(new Error('Account not found'))
    await expect(fetchAccountById('acc-1')).rejects.toThrow('Account not found')

    mockFetchAccount.mockResolvedValueOnce({ id: 'acc-1', acct: 'alice' })
    const acc = await fetchAccountById('acc-1')
    expect(acc?.acct).toContain('alice')
    expect(mockFetchAccount).toHaveBeenCalledTimes(2)

    mockFetchTag.mockRejectedValueOnce(new Error('Tag error'))
    await expect(fetchTag('nuxt')).rejects.toThrow('Tag error')

    mockFetchTag.mockResolvedValueOnce({ name: 'nuxt' })
    const tag = await fetchTag('nuxt')
    expect(tag.name).toBe('nuxt')
    expect(mockFetchTag).toHaveBeenCalledTimes(2)
  })
})
