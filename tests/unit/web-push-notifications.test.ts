import { beforeEach, describe, expect, it, vi } from 'vitest'
import { findBestClient, openUrl } from '../../service-worker/web-push-notifications'

describe('service-worker/web-push-notifications', () => {
  describe('findBestClient', () => {
    it('prefers a focused client', () => {
      const clients: any[] = [
        { id: '1', visibilityState: 'hidden', focused: false },
        { id: '2', visibilityState: 'visible', focused: true },
        { id: '3', visibilityState: 'visible', focused: false },
      ]
      expect(findBestClient(clients).id).toBe('2')
    })

    it('falls back to a visible client when none is focused', () => {
      const clients: any[] = [
        { id: '1', visibilityState: 'hidden', focused: false },
        { id: '2', visibilityState: 'visible', focused: false },
        { id: '3', visibilityState: 'hidden', focused: false },
      ]
      expect(findBestClient(clients).id).toBe('2')
    })

    it('falls back to the first client when none is visible or focused', () => {
      const clients: any[] = [
        { id: '1', visibilityState: 'hidden', focused: false },
        { id: '2', visibilityState: 'hidden', focused: false },
      ]
      expect(findBestClient(clients).id).toBe('1')
    })
  })

  describe('openUrl', () => {
    const mockOpenWindow = vi.fn()
    const mockMatchAll = vi.fn()

    beforeEach(() => {
      vi.clearAllMocks()
      ;(globalThis as any).self = {
        clients: {
          matchAll: mockMatchAll,
          openWindow: mockOpenWindow,
        },
      }
    })

    it('reuses existing window client and does NOT open a duplicate window when navigation succeeds', async () => {
      const mockFocus = vi.fn().mockResolvedValue(undefined)
      const mockNavigate = vi.fn().mockResolvedValue({
        focus: mockFocus,
      })

      const existingClient = {
        id: 'client-1',
        visibilityState: 'visible',
        focused: true,
        navigate: mockNavigate,
      }

      mockMatchAll.mockResolvedValue([existingClient])

      await openUrl('https://elk.zone/home')

      expect(mockMatchAll).toHaveBeenCalledWith({ type: 'window' })
      expect(mockNavigate).toHaveBeenCalledWith('https://elk.zone/home')
      expect(mockFocus).toHaveBeenCalled()
      expect(mockOpenWindow).not.toHaveBeenCalled()
    })

    it('falls back to openWindow when no clients match', async () => {
      mockMatchAll.mockResolvedValue([])

      await openUrl('https://elk.zone/home')

      expect(mockMatchAll).toHaveBeenCalledWith({ type: 'window' })
      expect(mockOpenWindow).toHaveBeenCalledWith('https://elk.zone/home')
    })

    it('falls back to openWindow when navigation rejects', async () => {
      const mockNavigate = vi.fn().mockRejectedValue(new Error('Navigation blocked'))

      const existingClient = {
        id: 'client-1',
        visibilityState: 'visible',
        focused: true,
        navigate: mockNavigate,
      }

      mockMatchAll.mockResolvedValue([existingClient])

      await openUrl('https://elk.zone/home')

      expect(mockNavigate).toHaveBeenCalledWith('https://elk.zone/home')
      expect(mockOpenWindow).toHaveBeenCalledWith('https://elk.zone/home')
    })
  })
})
