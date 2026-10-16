import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearUserLocalStorage, currentUser, currentUserHandle, findUserByHandle, migrateMockUserHandle, signOut, useUsers } from '../../app/composables/users'
import { STORAGE_KEY_SETTINGS } from '../../app/constants'

vi.mock('~/composables/masto', () => ({
  useMasto: () => ({}),
  loginTo: vi.fn(),
  useMastoClient: () => ({
    v1: {
      push: {
        subscription: {
          remove: vi.fn().mockResolvedValue(undefined),
        },
      },
    },
  }),
}))

describe('users.ts signOut and clearUserLocalStorage', () => {
  const users = useUsers()

  beforeEach(() => {
    vi.clearAllMocks()
    users.value = []
    currentUserHandle.value = ''

    const store: Record<string, string> = {}
    ;(globalThis as any).localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = String(v)
      },
      removeItem: (k: string) => {
        delete store[k]
      },
      clear: () => {
        for (const k of Object.keys(store))
          delete store[k]
      },
    }
  })

  it('removes only the user matching both server and account.id when IDs collide across instances', async () => {
    // Two accounts with same numeric ID 1 on different instances
    const userA: any = {
      server: 'mastodon.social',
      token: 'token-a',
      account: { id: '1', acct: 'alice@mastodon.social' },
    }
    const userB: any = {
      server: 'fosstodon.org',
      token: 'token-b',
      account: { id: '1', acct: 'bob@fosstodon.org' },
    }

    users.value = [userB, userA]
    // Currently logged in as userA
    currentUserHandle.value = 'alice@mastodon.social'
    expect(currentUser.value?.server).toBe('mastodon.social')

    await signOut()

    // userA should be removed, userB preserved
    expect(users.value.length).toBe(1)
    expect(users.value[0].server).toBe('fosstodon.org')
    expect(users.value[0].account.acct).toBe('bob@fosstodon.org')
  })

  it('clearUserLocalStorage cleans up entries matching account acct from localStorage', () => {
    const account: any = {
      id: '42',
      acct: 'charlie@elk.zone',
    }

    const settingsData = {
      'charlie@elk.zone': { fontSize: 'md' },
      'david@elk.zone': { fontSize: 'lg' },
    }

    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settingsData))

    clearUserLocalStorage(account)

    const updated = JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS) || '{}')
    expect(updated['charlie@elk.zone']).toBeUndefined()
    expect(updated['david@elk.zone']).toBeDefined()
  })

  it('matches currentUser when currentUserHandle is an account id before migration', () => {
    const user: any = {
      server: 'mastodon.social',
      account: { id: '109424142224653388', acct: 'elkdev@universeodon.com' },
    }
    users.value = [user]
    currentUserHandle.value = '109424142224653388'

    expect(currentUser.value?.account.acct).toBe('elkdev@universeodon.com')
  })

  it('prefers an exact acct match over another account ID with the same value', () => {
    const idMatch: any = {
      server: 'mastodon.social',
      account: { id: '42', acct: 'alice@mastodon.social' },
    }
    const acctMatch: any = {
      server: 'fosstodon.org',
      account: { id: '99', acct: '42' },
    }
    users.value = [idMatch, acctMatch]
    currentUserHandle.value = '42'

    expect(currentUser.value?.server).toBe('fosstodon.org')
    expect(findUserByHandle([idMatch, acctMatch], '42')).toBe(acctMatch)
  })

  it('does not choose arbitrarily when a legacy ID matches accounts on multiple instances', () => {
    const accountA: any = {
      server: 'mastodon.social',
      account: { id: '1', acct: 'alice@mastodon.social' },
    }
    const accountB: any = {
      server: 'fosstodon.org',
      account: { id: '1', acct: 'bob@fosstodon.org' },
    }
    users.value = [accountA, accountB]
    currentUserHandle.value = '1'

    expect(currentUser.value).toBeUndefined()
    expect(findUserByHandle([accountA, accountB], '1')).toBeUndefined()
  })

  it('migrates mock user IDs only when that mock account is explicitly configured', () => {
    const legacyId = '109424142224653388'

    expect(migrateMockUserHandle(legacyId, null)).toBe(legacyId)
    expect(migrateMockUserHandle(legacyId, { id: legacyId, acct: 'elkdev@universeodon.com' }))
      .toBe('elkdev@universeodon.com')
  })
})
