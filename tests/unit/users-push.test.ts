import { beforeEach, describe, expect, it, vi } from 'vitest'
import { removePushNotificationData, useUsers } from '../../app/composables/users'

describe('users.ts removePushNotificationData', () => {
  const mockUnsubscribe = vi.fn()
  const mockGetSubscription = vi.fn()
  const users = useUsers()

  beforeEach(() => {
    vi.clearAllMocks()
    users.value = []

    mockGetSubscription.mockResolvedValue({
      unsubscribe: mockUnsubscribe,
    })

    ;(globalThis as any).navigator = {
      serviceWorker: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: mockGetSubscription,
          },
        }),
      },
    }
  })

  function setPwa(registrationError: boolean) {
    const app = useNuxtApp() as any
    if (app.$pwa)
      app.$pwa.registrationError = registrationError
  }

  it('unregisters browser push subscription when last subscribed user removes push data and no registration error', async () => {
    const user: any = {
      account: { acct: 'test@mastodon.social' },
      pushSubscription: { endpoint: 'https://push.example.com' },
    }
    users.value = [user]

    // Set pwaEnabled and no error
    useAppConfig().pwaEnabled = true
    setPwa(false)

    await removePushNotificationData(user, true)

    expect(user.pushSubscription).toBeUndefined()
    expect(mockGetSubscription).toHaveBeenCalled()
    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('does not unregister browser push subscription if pwa registrationError is true', async () => {
    const user: any = {
      account: { acct: 'test@mastodon.social' },
      pushSubscription: { endpoint: 'https://push.example.com' },
    }
    users.value = [user]

    useAppConfig().pwaEnabled = true
    setPwa(true)

    await removePushNotificationData(user, true)

    expect(user.pushSubscription).toBeUndefined()
    expect(mockUnsubscribe).not.toHaveBeenCalled()
  })

  it('does not unregister browser push subscription if fromSWPushManager is false', async () => {
    const user: any = {
      account: { acct: 'test@mastodon.social' },
      pushSubscription: { endpoint: 'https://push.example.com' },
    }
    users.value = [user]

    useAppConfig().pwaEnabled = true
    setPwa(false)

    await removePushNotificationData(user, false)

    expect(mockUnsubscribe).not.toHaveBeenCalled()
  })

  it('does not unregister browser push subscription if another user still has an active subscription', async () => {
    const user1: any = {
      account: { acct: 'user1@mastodon.social' },
      pushSubscription: { endpoint: 'https://push1.example.com' },
    }
    const user2: any = {
      account: { acct: 'user2@mastodon.social' },
      pushSubscription: { endpoint: 'https://push2.example.com' },
    }
    users.value = [user1, user2]

    useAppConfig().pwaEnabled = true
    setPwa(false)

    await removePushNotificationData(user1, true)

    expect(user1.pushSubscription).toBeUndefined()
    expect(mockUnsubscribe).not.toHaveBeenCalled()
  })
})
