import { createError, defineEventHandler } from 'h3'
import { beforeEach, describe, expect, it, vi } from 'vitest'

;

(globalThis as any).defineEventHandler = defineEventHandler
;(globalThis as any).createError = createError

const mockDeleteApp = vi.fn()

vi.mock('~/server/utils/shared', () => ({
  deleteApp: (...args: any[]) => mockDeleteApp(...args),
}))

describe('server/api/[server]/clear', () => {
  let handler: any

  beforeEach(async () => {
    vi.clearAllMocks()
    ;(useRuntimeConfig() as any).adminKey = ''

    // Set up global helpers for test execution
    ;(globalThis as any).deleteApp = mockDeleteApp

    // Dynamic import clear handler
    const mod = await import('../../server/api/[server]/clear')
    handler = mod.default
  })

  it('rejects when server parameter is missing', async () => {
    ;(globalThis as any).getRouterParams = () => ({ server: '' })
    ;(globalThis as any).getQuery = () => ({ key: 'secret' })
    ;(globalThis as any).getHeader = () => undefined

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Missing server parameter',
    })
  })

  it('rejects when adminKey is not configured even if key is empty string', async () => {
    ;(useRuntimeConfig() as any).adminKey = ''
    ;(globalThis as any).getRouterParams = () => ({ server: 'mastodon.social' })
    ;(globalThis as any).getQuery = () => ({ key: '' })
    ;(globalThis as any).getHeader = () => undefined

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Admin key is not configured',
    })
    expect(mockDeleteApp).not.toHaveBeenCalled()
  })

  it('rejects when key does not match adminKey', async () => {
    ;(useRuntimeConfig() as any).adminKey = 'correct-secret-token'
    ;(globalThis as any).getRouterParams = () => ({ server: 'mastodon.social' })
    ;(globalThis as any).getQuery = () => ({ key: 'wrong-key' })
    ;(globalThis as any).getHeader = () => undefined

    await expect(handler({} as any)).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Incorrect admin key',
    })
    expect(mockDeleteApp).not.toHaveBeenCalled()
  })

  it('clears app registration when valid key is provided via query parameter', async () => {
    ;(useRuntimeConfig() as any).adminKey = 'correct-secret-token'
    ;(globalThis as any).getRouterParams = () => ({ server: 'mastodon.social' })
    ;(globalThis as any).getQuery = () => ({ key: 'correct-secret-token' })
    ;(globalThis as any).getHeader = () => undefined

    const result = await handler({} as any)
    expect(result).toEqual({ status: true })
    expect(mockDeleteApp).toHaveBeenCalledWith('mastodon.social')
  })

  it('clears app registration when valid key is provided via x-admin-key header', async () => {
    ;(useRuntimeConfig() as any).adminKey = 'correct-secret-token'
    ;(globalThis as any).getRouterParams = () => ({ server: 'mastodon.social' })
    ;(globalThis as any).getQuery = () => ({})
    ;(globalThis as any).getHeader = (_event: any, name: string) => {
      if (name === 'x-admin-key')
        return 'correct-secret-token'
      return undefined
    }

    const result = await handler({} as any)
    expect(result).toEqual({ status: true })
    expect(mockDeleteApp).toHaveBeenCalledWith('mastodon.social')
  })
})
